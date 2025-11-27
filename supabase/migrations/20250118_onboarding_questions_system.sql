-- Migration: Onboarding Questions System
-- Description: Create dynamic onboarding questions system
-- Date: 2024-11-04

-- ============================================
-- 1. Create onboarding_questions table
-- ============================================

CREATE TABLE IF NOT EXISTS onboarding_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (
    question_type IN ('text', 'select', 'multi_select', 'yes_no', 'rating')
  ),
  options JSONB, -- Array of options for select/multi_select types
  placeholder TEXT, -- Placeholder text for text inputs
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  help_text TEXT, -- Optional help text to show below the question
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Create member_onboarding_responses table
-- ============================================

CREATE TABLE IF NOT EXISTS member_onboarding_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES onboarding_questions(id) ON DELETE CASCADE,
  response_value TEXT NOT NULL, -- Store as text, parse based on question_type
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, question_id) -- One response per member per question
);

-- ============================================
-- 3. Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_onboarding_questions_order 
ON onboarding_questions(display_order) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_onboarding_questions_active 
ON onboarding_questions(is_active);

CREATE INDEX IF NOT EXISTS idx_member_responses_member 
ON member_onboarding_responses(member_id);

CREATE INDEX IF NOT EXISTS idx_member_responses_question 
ON member_onboarding_responses(question_id);

-- ============================================
-- 4. Add trigger for updated_at
-- ============================================

CREATE TRIGGER update_onboarding_questions_updated_at 
BEFORE UPDATE ON onboarding_questions
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_responses_updated_at 
BEFORE UPDATE ON member_onboarding_responses
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. Enable Row Level Security
-- ============================================

ALTER TABLE onboarding_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_onboarding_responses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. RLS Policies for onboarding_questions
-- ============================================

-- Anyone can view active questions (for member app)
CREATE POLICY "Anyone can view active onboarding questions" 
ON onboarding_questions
FOR SELECT 
USING (is_active = true);

-- Authenticated users can manage all questions (admin dashboard)
CREATE POLICY "Authenticated users can view all questions" 
ON onboarding_questions
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert questions" 
ON onboarding_questions
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update questions" 
ON onboarding_questions
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete questions" 
ON onboarding_questions
FOR DELETE 
USING (auth.role() = 'authenticated');

-- ============================================
-- 7. RLS Policies for member_onboarding_responses
-- ============================================

-- Members can insert their own responses
CREATE POLICY "Members can insert their responses" 
ON member_onboarding_responses
FOR INSERT 
WITH CHECK (true); -- Will validate member_id in application layer

-- Members can view their own responses
CREATE POLICY "Members can view their own responses" 
ON member_onboarding_responses
FOR SELECT 
USING (true); -- Will filter by member_id in application layer

-- Authenticated users can view all responses (admin dashboard)
CREATE POLICY "Authenticated users can view all responses" 
ON member_onboarding_responses
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Authenticated users can update responses (if needed)
CREATE POLICY "Authenticated users can update responses" 
ON member_onboarding_responses
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- ============================================
-- 8. Insert default onboarding questions (in English)
-- ============================================

INSERT INTO onboarding_questions (
  question_text,
  question_type,
  options,
  is_required,
  display_order,
  is_active
) VALUES
(
  'What''s your favorite drink?',
  'select',
  '["Coffee", "Tea", "Juice", "Smoothie", "Other"]'::jsonb,
  true,
  1,
  true
),
(
  'What do you like to do?',
  'multi_select',
  '["Work", "Study", "Read", "Meet friends", "Relax"]'::jsonb,
  true,
  2,
  true
),
(
  'Do you have any dietary restrictions?',
  'yes_no',
  '["Yes", "No"]'::jsonb,
  false,
  3,
  true
),
(
  'How would you rate your coffee knowledge?',
  'rating',
  NULL, -- Rating uses 1-5 stars, no options needed
  false,
  4,
  true
);

-- ============================================
-- 9. Create view for onboarding analytics
-- ============================================

CREATE OR REPLACE VIEW onboarding_response_stats AS
SELECT 
  oq.id AS question_id,
  oq.question_text,
  oq.question_type,
  oq.display_order,
  COUNT(DISTINCT mor.member_id) AS total_responses,
  COUNT(mor.id) AS response_count,
  CASE 
    WHEN oq.question_type IN ('select', 'multi_select', 'yes_no') 
    THEN (
      SELECT jsonb_agg(
        jsonb_build_object(
          'value', response_value,
          'count', response_count
        ) ORDER BY response_count DESC
      )
      FROM (
        SELECT 
          mor2.response_value,
          COUNT(*) AS response_count
        FROM member_onboarding_responses mor2
        WHERE mor2.question_id = oq.id
        GROUP BY mor2.response_value
      ) AS value_counts
    )
    ELSE NULL
  END AS response_distribution
FROM onboarding_questions oq
LEFT JOIN member_onboarding_responses mor ON oq.id = mor.question_id
WHERE oq.is_active = true
GROUP BY oq.id, oq.question_text, oq.question_type, oq.display_order
ORDER BY oq.display_order;

-- ============================================
-- 10. Create function to get member's completion status
-- ============================================

CREATE OR REPLACE FUNCTION get_member_onboarding_status(member_uuid UUID)
RETURNS TABLE (
  total_questions INTEGER,
  answered_questions INTEGER,
  required_questions INTEGER,
  required_answered INTEGER,
  is_complete BOOLEAN,
  completion_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER AS total_questions,
    COUNT(mor.id)::INTEGER AS answered_questions,
    COUNT(*) FILTER (WHERE oq.is_required = true)::INTEGER AS required_questions,
    COUNT(mor.id) FILTER (WHERE oq.is_required = true)::INTEGER AS required_answered,
    (COUNT(mor.id) FILTER (WHERE oq.is_required = true) >= COUNT(*) FILTER (WHERE oq.is_required = true)) AS is_complete,
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND((COUNT(mor.id)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
    END AS completion_percentage
  FROM onboarding_questions oq
  LEFT JOIN member_onboarding_responses mor 
    ON oq.id = mor.question_id AND mor.member_id = member_uuid
  WHERE oq.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. Create function to reorder questions
-- ============================================

CREATE OR REPLACE FUNCTION reorder_onboarding_question(
  question_uuid UUID,
  new_order INTEGER
)
RETURNS VOID AS $$
DECLARE
  old_order INTEGER;
BEGIN
  -- Get current order
  SELECT display_order INTO old_order
  FROM onboarding_questions
  WHERE id = question_uuid;

  IF old_order IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  -- If moving down (increasing order number)
  IF new_order > old_order THEN
    UPDATE onboarding_questions
    SET display_order = display_order - 1
    WHERE display_order > old_order 
      AND display_order <= new_order
      AND id != question_uuid;
  -- If moving up (decreasing order number)
  ELSIF new_order < old_order THEN
    UPDATE onboarding_questions
    SET display_order = display_order + 1
    WHERE display_order >= new_order 
      AND display_order < old_order
      AND id != question_uuid;
  END IF;

  -- Update the question's order
  UPDATE onboarding_questions
  SET display_order = new_order
  WHERE id = question_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. Add comments for documentation
-- ============================================

COMMENT ON TABLE onboarding_questions IS 'Configurable onboarding questions for new members';
COMMENT ON TABLE member_onboarding_responses IS 'Member responses to onboarding questions';

COMMENT ON COLUMN onboarding_questions.question_type IS 'Type: text, select, multi_select, yes_no, rating';
COMMENT ON COLUMN onboarding_questions.options IS 'JSON array of options for select/multi_select types';
COMMENT ON COLUMN onboarding_questions.display_order IS 'Order in which questions are displayed (lower = first)';

COMMENT ON COLUMN member_onboarding_responses.response_value IS 'Response stored as text. For multi_select, comma-separated values';

-- ============================================
-- 13. Migration complete notification
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 20241104_onboarding_questions_system completed successfully';
  RAISE NOTICE 'Created tables: onboarding_questions, member_onboarding_responses';
  RAISE NOTICE 'Created view: onboarding_response_stats';
  RAISE NOTICE 'Created functions: get_member_onboarding_status, reorder_onboarding_question';
  RAISE NOTICE 'Inserted 4 default questions in English';
END $$;

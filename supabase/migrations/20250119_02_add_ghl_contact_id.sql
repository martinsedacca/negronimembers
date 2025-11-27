-- Add GHL contact ID column to members table
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_members_ghl_contact_id ON members(ghl_contact_id);

-- Add comment
COMMENT ON COLUMN members.ghl_contact_id IS 'GoHighLevel contact ID for this member';

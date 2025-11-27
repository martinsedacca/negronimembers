-- =============================================================================
-- SEED DATA FOR MEMBERSHIP CARDS APP - UPDATED 2025
-- Member/Gold system - NO LEVELS
-- =============================================================================

-- Clear existing data (optional - use with caution in production)
-- TRUNCATE members, transactions, coupons, coupon_redemptions, events, event_invitations, branches CASCADE;

-- =============================================================================
-- 1. MEMBERSHIP TYPES - ONLY MEMBER & GOLD
-- =============================================================================

INSERT INTO membership_types (id, name, description, price, color, benefits)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Member', 'Standard membership with essential benefits', 0, '#F97316', '["10% discount on coffee", "Access to special events", "Birthday reward", "Points on every purchase"]'),
  ('22222222-2222-2222-2222-222222222222', 'Gold', 'Premium membership with exclusive benefits', 199, '#EAB308', '["20% discount on everything", "Free monthly coffee", "Priority access to events", "Double points on purchases", "VIP invitations", "Birthday special gift"]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  color = EXCLUDED.color,
  benefits = EXCLUDED.benefits;

-- =============================================================================
-- 2. BRANCHES
-- =============================================================================

INSERT INTO branches (id, name, address, city, phone, email, manager_name, is_active)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'Palermo', 'Av. Santa Fe 3253, Buenos Aires', 'Buenos Aires', '+54 11 4829-5678', 'palermo@negroni.com', 'Carlos Méndez', true),
  ('a0000000-0000-0000-0000-000000000002', 'Recoleta', 'Av. Callao 1234, Buenos Aires', 'Buenos Aires', '+54 11 4805-1234', 'recoleta@negroni.com', 'María Fernández', true),
  ('a0000000-0000-0000-0000-000000000003', 'Belgrano', 'Av. Cabildo 2567, Buenos Aires', 'Buenos Aires', '+54 11 4783-4567', 'belgrano@negroni.com', 'Juan López', true),
  ('a0000000-0000-0000-0000-000000000004', 'San Isidro', 'Av. Libertador 15234, San Isidro', 'San Isidro', '+54 11 4732-8901', 'sanisidro@negroni.com', 'Ana García', true),
  ('a0000000-0000-0000-0000-000000000005', 'Aeroparque', 'Terminal A, Aeroparque Jorge Newbery', 'Buenos Aires', '+54 11 4576-2345', 'aeroparque@negroni.com', 'Roberto Silva', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  manager_name = EXCLUDED.manager_name,
  is_active = EXCLUDED.is_active;

-- =============================================================================
-- 3. MEMBERS - Mix of Member & Gold tiers
-- =============================================================================

INSERT INTO members (id, full_name, email, phone, phone_country_code, phone_number, membership_type, status, member_number, points, joined_date, birth_day, birth_month, birth_year)
VALUES 
  -- GOLD MEMBERS (High-value customers)
  ('10000000-0000-0000-0000-000000000001', 'Martín Sedacca', 'martin.sedacca@email.com', '+5491134567890', '+54', '91134567890', 'Gold', 'active', 'G001', 1250, NOW() - INTERVAL '2 years', 15, 6, 1990),
  ('10000000-0000-0000-0000-000000000002', 'Lucía Fernández', 'lucia.fernandez@email.com', '+5491145678901', '+54', '91145678901', 'Gold', 'active', 'G002', 980, NOW() - INTERVAL '18 months', 22, 9, 1988),
  ('10000000-0000-0000-0000-000000000003', 'Diego Ramírez', 'diego.ramirez@email.com', '+5491156789012', '+54', '91156789012', 'Gold', 'active', 'G003', 1580, NOW() - INTERVAL '3 years', 10, 3, 1985),
  ('10000000-0000-0000-0000-000000000004', 'Carolina Torres', 'carolina.torres@email.com', '+5491167890123', '+54', '91167890123', 'Gold', 'active', 'G004', 720, NOW() - INTERVAL '1 year', 5, 12, 1992),
  ('10000000-0000-0000-0000-000000000005', 'Sebastián Morales', 'sebastian.morales@email.com', '+5491178901234', '+54', '91178901234', 'Gold', 'active', 'G005', 1105, NOW() - INTERVAL '2.5 years', 18, 7, 1987),

  -- MEMBER (Standard tier)
  ('10000000-0000-0000-0000-000000000006', 'Ana García', 'ana.garcia@email.com', '+5491189012345', '+54', '91189012345', 'Member', 'active', 'M001', 350, NOW() - INTERVAL '6 months', 30, 1, 1995),
  ('10000000-0000-0000-0000-000000000007', 'Pablo Rodríguez', 'pablo.rodriguez@email.com', '+5491190123456', '+54', '91190123456', 'Member', 'active', 'M002', 220, NOW() - INTERVAL '4 months', 25, 4, 1993),
  ('10000000-0000-0000-0000-000000000008', 'Sofía Martínez', 'sofia.martinez@email.com', '+5491101234567', '+54', '91101234567', 'Member', 'active', 'M003', 180, NOW() - INTERVAL '3 months', 12, 11, 1996),
  ('10000000-0000-0000-0000-000000000009', 'Javier López', 'javier.lopez@email.com', '+5491112345678', '+54', '91112345678', 'Member', 'active', 'M004', 425, NOW() - INTERVAL '8 months', 8, 2, 1991),
  ('10000000-0000-0000-0000-000000000010', 'Valentina Pérez', 'valentina.perez@email.com', '+5491123456789', '+54', '91123456789', 'Member', 'active', 'M005', 290, NOW() - INTERVAL '5 months', 20, 8, 1994),
  ('10000000-0000-0000-0000-000000000011', 'Matías Castro', 'matias.castro@email.com', '+5491134567891', '+54', '91134567891', 'Member', 'active', 'M006', 155, NOW() - INTERVAL '2 months', 14, 5, 1997),
  ('10000000-0000-0000-0000-000000000012', 'Camila Ruiz', 'camila.ruiz@email.com', '+5491145678902', '+54', '91145678902', 'Member', 'active', 'M007', 510, NOW() - INTERVAL '10 months', 3, 10, 1989),
  ('10000000-0000-0000-0000-000000000013', 'Nicolás Díaz', 'nicolas.diaz@email.com', '+5491156789013', '+54', '91156789013', 'Member', 'active', 'M008', 95, NOW() - INTERVAL '1 month', 27, 7, 1998),
  ('10000000-0000-0000-0000-000000000014', 'Florencia Vargas', 'florencia.vargas@email.com', '+5491167890124', '+54', '91167890124', 'Member', 'active', 'M009', 380, NOW() - INTERVAL '7 months', 16, 3, 1992),
  ('10000000-0000-0000-0000-000000000015', 'Tomás Sánchez', 'tomas.sanchez@email.com', '+5491178901235', '+54', '91178901235', 'Member', 'active', 'M010', 265, NOW() - INTERVAL '4 months', 9, 12, 1995)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  membership_type = EXCLUDED.membership_type,
  points = EXCLUDED.points;

-- =============================================================================
-- 4. COUPONS - Special branch-specific offers
-- =============================================================================

INSERT INTO coupons (id, code, description, discount_type, discount_value, branch_id, expires_at, max_redemptions, is_active)
VALUES 
  -- Summer campaign
  ('c0000000-0000-0000-0000-000000000001', 'SUMMER2024', '20% discount on all beverages at Palermo branch', 'percentage', 20, 'a0000000-0000-0000-0000-000000000001', NOW() + INTERVAL '6 months', 100, true),
  
  -- Aeroparque exclusive
  ('c0000000-0000-0000-0000-000000000002', 'AERO22', '$10 off at Aeroparque location', 'fixed', 10, 'a0000000-0000-0000-0000-000000000005', NOW() + INTERVAL '1 year', 200, true),
  
  -- Recoleta special
  ('c0000000-0000-0000-0000-000000000003', 'RECO15', '15% off breakfast menu at Recoleta', 'percentage', 15, 'a0000000-0000-0000-0000-000000000002', NOW() + INTERVAL '3 months', 50, true),
  
  -- All branches
  ('c0000000-0000-0000-0000-000000000004', 'WELCOME10', '$5 off your first purchase', 'fixed', 5, NULL, NOW() + INTERVAL '1 year', NULL, true),
  
  -- Gold exclusive
  ('c0000000-0000-0000-0000-000000000005', 'GOLDVIP', '25% off for Gold members only', 'percentage', 25, NULL, NOW() + INTERVAL '3 months', NULL, true),
  
  -- Weekend special
  ('c0000000-0000-0000-0000-000000000006', 'WEEKEND20', '20% off on weekends at all branches', 'percentage', 20, NULL, NOW() + INTERVAL '2 months', 500, true)
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  discount_value = EXCLUDED.discount_value,
  is_active = EXCLUDED.is_active,
  expires_at = EXCLUDED.expires_at;

-- =============================================================================
-- 5. TRANSACTIONS - Sample transaction history
-- =============================================================================

INSERT INTO transactions (member_id, branch_id, amount, points_earned, transaction_type, created_at)
VALUES 
  -- Recent transactions (last 30 days)
  ('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 45.50, 46, 'purchase', NOW() - INTERVAL '2 days'),
  ('10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 32.00, 32, 'purchase', NOW() - INTERVAL '3 days'),
  ('10000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 15.75, 16, 'purchase', NOW() - INTERVAL '5 days'),
  ('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', 62.30, 62, 'purchase', NOW() - INTERVAL '7 days'),
  ('10000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000004', 28.90, 29, 'purchase', NOW() - INTERVAL '10 days'),
  ('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 51.20, 51, 'purchase', NOW() - INTERVAL '12 days'),
  ('10000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 38.40, 38, 'purchase', NOW() - INTERVAL '15 days'),
  ('10000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000005', 22.10, 22, 'purchase', NOW() - INTERVAL '18 days'),
  ('10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 47.80, 48, 'purchase', NOW() - INTERVAL '20 days'),
  ('10000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002', 19.50, 20, 'purchase', NOW() - INTERVAL '22 days'),
  ('10000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 73.60, 74, 'purchase', NOW() - INTERVAL '25 days'),
  ('10000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000004', 34.25, 34, 'purchase', NOW() - INTERVAL '28 days'),
  
  -- Older transactions (last 90 days)
  ('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 41.30, 41, 'purchase', NOW() - INTERVAL '35 days'),
  ('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 56.90, 57, 'purchase', NOW() - INTERVAL '40 days'),
  ('10000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', 25.40, 25, 'purchase', NOW() - INTERVAL '45 days'),
  ('10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 68.20, 68, 'purchase', NOW() - INTERVAL '50 days'),
  ('10000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000005', 17.85, 18, 'purchase', NOW() - INTERVAL '55 days'),
  ('10000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 44.70, 45, 'purchase', NOW() - INTERVAL '60 days'),
  ('10000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000002', 31.10, 31, 'purchase', NOW() - INTERVAL '65 days'),
  ('10000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 59.30, 59, 'purchase', NOW() - INTERVAL '70 days'),
  ('10000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 23.60, 24, 'purchase', NOW() - INTERVAL '75 days'),
  ('10000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', 52.40, 52, 'purchase', NOW() - INTERVAL '80 days'),
  ('10000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000002', 29.90, 30, 'purchase', NOW() - INTERVAL '85 days')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 6. EVENTS - Upcoming and past events
-- =============================================================================

INSERT INTO events (id, name, description, event_date, location, max_attendees, created_by)
VALUES 
  ('e0000000-0000-0000-0000-000000000001', 'Coffee Tasting Workshop', 'Join us for an exclusive coffee tasting session led by our master baristas', NOW() + INTERVAL '15 days', 'Palermo', 20, '10000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000002', 'Gold Members VIP Night', 'Exclusive evening for Gold members with special menu and live music', NOW() + INTERVAL '30 days', 'Recoleta', 30, '10000000-0000-0000-0000-000000000002'),
  ('e0000000-0000-0000-0000-000000000003', 'Latte Art Competition', 'Watch our baristas compete in creating the perfect latte art', NOW() + INTERVAL '45 days', 'Belgrano', 50, '10000000-0000-0000-0000-000000000003'),
  ('e0000000-0000-0000-0000-000000000004', 'Members Breakfast Meetup', 'Connect with other members over breakfast and coffee', NOW() - INTERVAL '10 days', 'San Isidro', 25, '10000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 7. PROMOTIONS - Benefits tied to membership tiers
-- =============================================================================

INSERT INTO promotions (
  id, 
  title, 
  description, 
  discount_type, 
  discount_value, 
  start_date, 
  end_date, 
  terms_conditions,
  icon,
  usage_type,
  category,
  applicable_membership_types
)
VALUES 
  -- Member benefits
  ('p0000000-0000-0000-0000-000000000001', '10% Coffee Discount', 'Get 10% off any coffee beverage', 'percentage', 10, NOW() - INTERVAL '1 year', NOW() + INTERVAL '10 years', 'Valid for hot or cold coffee. Not combinable with other coffee promotions.', '☕', 'coffee', 'discount', ARRAY['Member', 'Gold']),
  ('p0000000-0000-0000-0000-000000000002', 'Birthday Reward', 'Free dessert or beverage on your birthday', 'percentage', 100, NOW() - INTERVAL '1 year', NOW() + INTERVAL '10 years', 'Valid on your birthday. Must present membership card.', '🎂', 'birthday', 'freebie', ARRAY['Member', 'Gold']),
  ('p0000000-0000-0000-0000-000000000003', 'Points on Purchases', 'Earn 1 point per dollar spent', 'percentage', 0, NOW() - INTERVAL '1 year', NOW() + INTERVAL '10 years', 'Points automatically added to your account.', '⭐', 'general', 'points', ARRAY['Member', 'Gold']),
  
  -- Gold exclusive benefits
  ('p0000000-0000-0000-0000-000000000004', '20% Everything Discount', 'Get 20% off on all purchases', 'percentage', 20, NOW() - INTERVAL '1 year', NOW() + INTERVAL '10 years', 'Applies to all menu items. Not combinable with other discounts.', '🌟', 'general', 'discount', ARRAY['Gold']),
  ('p0000000-0000-0000-0000-000000000005', 'Free Monthly Coffee', 'One free coffee every month', 'percentage', 100, NOW() - INTERVAL '1 year', NOW() + INTERVAL '10 years', 'Gold members only. Limit: 1 coffee per calendar month.', '👑', 'coffee', 'freebie', ARRAY['Gold']),
  ('p0000000-0000-0000-0000-000000000006', 'Double Points', 'Earn double points on every purchase', 'percentage', 0, NOW() - INTERVAL '1 year', NOW() + INTERVAL '10 years', 'Gold members earn 2 points per dollar instead of 1.', '💎', 'general', 'points', ARRAY['Gold']),
  ('p0000000-0000-0000-0000-000000000007', 'Priority Event Access', 'Get early access to special events', 'percentage', 0, NOW() - INTERVAL '1 year', NOW() + INTERVAL '10 years', 'Gold members receive invitations before general members.', '🎟️', 'events', 'access', ARRAY['Gold']),
  ('p0000000-0000-0000-0000-000000000008', 'VIP Seating', 'Reserved seating in VIP area', 'percentage', 0, NOW() - INTERVAL '1 year', NOW() + INTERVAL '10 years', 'Subject to availability. Valid at all locations.', '🪑', 'general', 'access', ARRAY['Gold'])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  usage_type = EXCLUDED.usage_type,
  category = EXCLUDED.category,
  applicable_membership_types = EXCLUDED.applicable_membership_types;

-- =============================================================================
-- 8. SAMPLE COUPON REDEMPTIONS
-- =============================================================================

INSERT INTO coupon_redemptions (coupon_id, member_id, branch_id, redeemed_at)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '5 days'),
  ('c0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '10 days'),
  ('c0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '15 days')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- DONE! Database seeded with updated Member/Gold system data
-- =============================================================================

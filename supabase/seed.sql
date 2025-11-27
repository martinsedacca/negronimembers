-- =============================================================================
-- SEED DATA FOR MEMBERSHIP CARDS APP
-- This file will be executed after migrations on db reset
-- =============================================================================

-- =============================================================================
-- 1. MEMBERSHIP TYPES
-- =============================================================================

INSERT INTO membership_types (id, name, description, price, color, benefits)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Standard', 'Membresía básica con beneficios esenciales', 0, '#F97316', '["10% descuento en café", "Acceso a eventos especiales"]'),
  ('00000000-0000-0000-0000-000000000002', 'Premium', 'Membresía premium con beneficios exclusivos', 99, '#8B5CF6', '["20% descuento en todo", "Café gratis en cumpleaños", "Invitaciones VIP"]'),
  ('00000000-0000-0000-0000-000000000003', 'VIP', 'Membresía VIP con máximos beneficios', 299, '#EAB308', '["30% descuento en todo", "Café gratis mensual", "Eventos privados", "Prioridad en reservas"]')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. MEMBERS (Sample data)
-- =============================================================================

INSERT INTO members (id, full_name, email, phone, phone_country_code, phone_number, membership_type, status, member_number, points, joined_date, birth_day, birth_month, birth_year)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'María García', 'maria.garcia@email.com', '+13051234567', '+1', '3051234567', 'Standard', 'active', 'M001', 150, NOW() - INTERVAL '6 months', 15, 3, 1990),
  ('10000000-0000-0000-0000-000000000002', 'Carlos Rodríguez', 'carlos.rodriguez@email.com', '+13051234568', '+1', '3051234568', 'Premium', 'active', 'M002', 320, NOW() - INTERVAL '1 year', 22, 7, 1985),
  ('10000000-0000-0000-0000-000000000003', 'Ana Martínez', 'ana.martinez@email.com', '+13051234569', '+1', '3051234569', 'VIP', 'active', 'M003', 580, NOW() - INTERVAL '2 years', 10, 12, 1988),
  ('10000000-0000-0000-0000-000000000004', 'Luis Fernández', 'luis.fernandez@email.com', '+13051234570', '+1', '3051234570', 'Standard', 'active', 'M004', 95, NOW() - INTERVAL '3 months', 5, 5, 1995),
  ('10000000-0000-0000-0000-000000000005', 'Carmen López', 'carmen.lopez@email.com', '+13051234571', '+1', '3051234571', 'Premium', 'active', 'M005', 245, NOW() - INTERVAL '8 months', 18, 9, 1992),
  ('10000000-0000-0000-0000-000000000006', 'José Sánchez', 'jose.sanchez@email.com', '+13051234572', '+1', '3051234572', 'Standard', 'active', 'M006', 120, NOW() - INTERVAL '4 months', 30, 1, 1987),
  ('10000000-0000-0000-0000-000000000007', 'Laura Pérez', 'laura.perez@email.com', '+13051234573', '+1', '3051234573', 'VIP', 'active', 'M007', 720, NOW() - INTERVAL '3 years', 25, 6, 1991),
  ('10000000-0000-0000-0000-000000000008', 'Miguel Torres', 'miguel.torres@email.com', '+13051234574', '+1', '3051234574', 'Premium', 'active', 'M008', 410, NOW() - INTERVAL '1 year', 12, 11, 1989),
  ('10000000-0000-0000-0000-000000000009', 'Isabel Ramírez', 'isabel.ramirez@email.com', '+13051234575', '+1', '3051234575', 'Standard', 'active', 'M009', 85, NOW() - INTERVAL '2 months', 8, 4, 1993),
  ('10000000-0000-0000-0000-000000000010', 'Diego Flores', 'diego.flores@email.com', '+13051234576', '+1', '3051234576', 'Premium', 'active', 'M010', 290, NOW() - INTERVAL '10 months', 20, 8, 1986),
  ('10000000-0000-0000-0000-000000000011', 'Patricia Morales', 'patricia.morales@email.com', '+13051234577', '+1', '3051234577', 'VIP', 'active', 'M011', 890, NOW() - INTERVAL '4 years', 14, 2, 1984),
  ('10000000-0000-0000-0000-000000000012', 'Roberto Castro', 'roberto.castro@email.com', '+13051234578', '+1', '3051234578', 'Standard', 'active', 'M012', 110, NOW() - INTERVAL '5 months', 3, 10, 1994),
  ('10000000-0000-0000-0000-000000000013', 'Sofía Ruiz', 'sofia.ruiz@email.com', '+13051234579', '+1', '3051234579', 'Premium', 'active', 'M013', 355, NOW() - INTERVAL '1 year', 27, 7, 1990),
  ('10000000-0000-0000-0000-000000000014', 'Fernando Díaz', 'fernando.diaz@email.com', '+13051234580', '+1', '3051234580', 'Standard', 'active', 'M014', 65, NOW() - INTERVAL '1 month', 16, 3, 1996),
  ('10000000-0000-0000-0000-000000000015', 'Elena Vargas', 'elena.vargas@email.com', '+13051234581', '+1', '3051234581', 'VIP', 'active', 'M015', 1050, NOW() - INTERVAL '5 years', 9, 12, 1983)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 3. ONBOARDING QUESTIONS (Default questions already in migration)
-- =============================================================================

-- Already created in 20250110_16_onboarding_questions_system.sql

-- =============================================================================
-- 4. PROMOTIONS (Standard benefits with icons)
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
  ('30000000-0000-0000-0000-000000000001', '20% Descuento en Café', 'Obtén 20% de descuento en cualquier bebida de café', 'percentage', 20, NOW() - INTERVAL '1 year', NOW() + INTERVAL '10 years', 'Válido para café caliente o frío. No acumulable con otras promociones de café.', '☕', 'coffee', 'discount', ARRAY['Premium', 'VIP']),
  ('30000000-0000-0000-0000-000000000002', '15% Descuento Takeaway', '15% de descuento en pedidos para llevar', 'percentage', 15, NOW() - INTERVAL '1 year', NOW() + INTERVAL '10 years', 'Aplicable a cualquier orden para llevar. No incluye delivery.', '🥡', 'takeaway', 'discount', ARRAY['Standard', 'Premium', 'VIP']),
  ('30000000-0000-0000-0000-000000000003', 'Brunch Especial', 'Café gratis con tu brunch los fines de semana', 'percentage', 100, NOW() - INTERVAL '1 year', NOW() + INTERVAL '10 years', 'Válido sábados y domingos de 9am a 2pm. Un café por brunch ordenado.', '🍳', 'brunch', 'freebie', ARRAY['Premium', 'VIP']),
  ('30000000-0000-0000-0000-000000000004', 'Regalo de Cumpleaños', 'Postre o bebida gratis en tu cumpleaños', 'percentage', 100, NOW() - INTERVAL '1 year', NOW() + INTERVAL '10 years', 'Válido el día de tu cumpleaños. Presentar tarjeta de membresía.', '🎂', 'birthday', 'freebie', ARRAY['Standard', 'Premium', 'VIP']),
  ('30000000-0000-0000-0000-000000000005', 'Café Gratis Mensual VIP', 'Un café gratis cada mes para miembros VIP', 'percentage', 100, NOW() - INTERVAL '1 year', NOW() + INTERVAL '10 years', 'Solo para miembros VIP. Límite: 1 café por mes calendario.', '👑', 'coffee', 'freebie', ARRAY['VIP'])
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  usage_type = EXCLUDED.usage_type,
  category = EXCLUDED.category,
  applicable_membership_types = EXCLUDED.applicable_membership_types;

-- =============================================================================
-- 5. CARD USAGE (Sample usage data)
-- =============================================================================

INSERT INTO card_usage (member_id, usage_date, location, notes)
SELECT 
  id,
  NOW() - (random() * INTERVAL '30 days'),
  'Negroni Doral',
  'Visita de ejemplo'
FROM members
WHERE id::text LIKE '10000000-%'
ORDER BY RANDOM()
LIMIT 25;

-- =============================================================================
-- 6. APPLIED PROMOTIONS (Sample applied promotions)
-- =============================================================================

INSERT INTO applied_promotions (member_id, promotion_id, applied_date)
SELECT 
  m.id,
  '20000000-0000-0000-0000-000000000002',
  NOW() - INTERVAL '1 week'
FROM members m
WHERE m.id::text LIKE '10000000-%'
ORDER BY RANDOM()
LIMIT 10;

-- =============================================================================
-- 7. BRANCHES (Sample branches)
-- =============================================================================

INSERT INTO branches (id, name, address, city, phone, is_active)
VALUES 
  ('30000000-0000-0000-0000-000000000001', 'Negroni Doral', '8300 NW 53rd St, Doral, FL 33166', 'Doral', '+1 305 555 0100', true),
  ('30000000-0000-0000-0000-000000000002', 'Negroni Brickell', '1111 Brickell Ave, Miami, FL 33131', 'Miami', '+1 305 555 0200', true),
  ('30000000-0000-0000-0000-000000000003', 'Negroni Wynwood', '2750 NW 3rd Ave, Miami, FL 33127', 'Miami', '+1 305 555 0300', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- DONE! Database seeded with sample data
-- =============================================================================

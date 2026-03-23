-- Seed data for FreshProduce

-- 1. Create a Primary Premium Supplier
INSERT INTO public.suppliers (id, name, description, is_verified, rating)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Premium Cape Farms',
    'Select high-quality produce from the heart of the Cape.',
    true,
    4.9
);

-- 2. Seed Products (Base Price -> Premium Price 110%)
INSERT INTO public.products (title, description, category, base_price, unit, stock_quantity, supplier_id)
VALUES 
('English Cucumber', 'Cool, crisp and refreshing.', 'fruit-veg', 18.17, 'ea', 100, '550e8400-e29b-41d4-a716-446655440000'),
('Strawberries 400 g', 'Sweet and juicy premium strawberries.', 'fruit-veg', 81.81, '400g', 50, '550e8400-e29b-41d4-a716-446655440000'),
('Ripe & Ready Hass Avocados 4 pk', 'Perfectly ripe premium avocados.', 'fruit-veg', 89.08, '4pk', 30, '550e8400-e29b-41d4-a716-446655440000'),
('Small Bananas 800 g', 'Energizing premium bananas.', 'fruit-veg', 26.35, '800g', 80, '550e8400-e29b-41d4-a716-446655440000');

-- Note: The premium_price will be automatically calculated by the DB (base_price * 1.1)
-- (18.17 * 1.1 = 19.99)
-- (81.81 * 1.1 = 89.99)
-- (89.08 * 1.1 = 97.99)
-- (26.35 * 1.1 = 28.99)

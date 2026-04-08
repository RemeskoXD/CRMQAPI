-- CRMQ Seed Data
-- Password for all users: admin123
-- Hash: $2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W

INSERT INTO users (id, first_name, last_name, email, password_hash, role, phone) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Admin', 'Root', 'admin@crmq.cz', '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W', 'root', '+420600111222'),
  ('a0000000-0000-0000-0000-000000000002', 'Marek', 'Novák', 'marek@crmq.cz', '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W', 'team_leader', '+420600222333'),
  ('a0000000-0000-0000-0000-000000000003', 'Andrej', 'Kováč', 'andrej@crmq.cz', '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W', 'sales_rep', '+420600333444'),
  ('a0000000-0000-0000-0000-000000000004', 'Petr', 'Dvořák', 'petr@crmq.cz', '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W', 'technician', '+420600444555'),
  ('a0000000-0000-0000-0000-000000000005', 'Jana', 'Svobodová', 'jana@crmq.cz', '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W', 'technician', '+420600555666'),
  ('a0000000-0000-0000-0000-000000000006', 'Eva', 'Procházková', 'eva@crmq.cz', '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W', 'analyst', '+420600666777'),
  ('a0000000-0000-0000-0000-000000000007', 'Lucie', 'Černá', 'lucie@crmq.cz', '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W', 'infoline', '+420600777888'),
  ('a0000000-0000-0000-0000-000000000008', 'Martin', 'Veselý', 'martin@crmq.cz', '$2a$10$XLZtH7eN/bBsKmm7h2YfJOeYrj1hHJkS1coiDihod9PQ.YjcO7l3W', 'accountant', '+420600888999');

INSERT INTO clients (id, type, company_name, ico, dic, email, phone, marketing_source, billing_street, billing_city, billing_zip, assigned_user_id) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'company', 'Stavby Praha s.r.o.', '12345678', 'CZ12345678', 'info@stavbypraha.cz', '+420700111222', 'Google Ads', 'Vinohradská 120', 'Praha 2', '12000', 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000002', 'individual', NULL, NULL, NULL, 'karel.novotny@email.cz', '+420700222333', 'Doporučení', 'Masarykova 45', 'Brno', '60200', 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000003', 'company', 'AutoDům Ostrava a.s.', '87654321', 'CZ87654321', 'obchod@autodum-ova.cz', '+420700333444', 'Webový formulář', 'Porubská 88', 'Ostrava', '70800', 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000004', 'individual', NULL, NULL, NULL, 'marie.h@seznam.cz', '+420700444555', 'Facebook', 'Jiráskova 12', 'Plzeň', '30100', 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000005', 'company', 'Rezidence Karlín s.r.o.', '11223344', 'CZ11223344', 'sprava@rezidence-karlin.cz', '+420700555666', 'Google Ads', 'Křižíkova 200', 'Praha 8', '18600', 'a0000000-0000-0000-0000-000000000002');

UPDATE clients SET first_name = 'Karel', last_name = 'Novotný' WHERE id = 'b0000000-0000-0000-0000-000000000002';
UPDATE clients SET first_name = 'Marie', last_name = 'Horáková' WHERE id = 'b0000000-0000-0000-0000-000000000004';

INSERT INTO locations (id, client_id, label, street, city, zip) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Sídlo firmy', 'Vinohradská 120', 'Praha 2', '12000'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Stavba - Dejvice', 'Evropská 33', 'Praha 6', '16000'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'Rodinný dům', 'Masarykova 45', 'Brno', '60200'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'Autosalon', 'Porubská 88', 'Ostrava', '70800'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 'Dům', 'Jiráskova 12', 'Plzeň', '30100');

INSERT INTO projects (id, client_id, location_id, title, description, type, status, assigned_sales_id, assigned_technician_id, total_price, scheduled_date, deadline) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'Sekční vrata - novostavba Dejvice', 'Montáž 2ks sekčních garážových vrat Hörmann LPU 42', 'garage_doors', 'in_progress', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 185000, CURRENT_DATE + 3, CURRENT_DATE + 10),
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'Výměna oken - RD Brno', 'Kompletní výměna 8ks plastových oken za dřevěná eurookna', 'windows', 'pricing', 'a0000000-0000-0000-0000-000000000003', NULL, 320000, NULL, CURRENT_DATE + 21),
  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004', 'Průmyslová vrata - AutoDům', 'Montáž rychloběžných průmyslových vrat 4x4m', 'garage_doors', 'waiting_material', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', 450000, CURRENT_DATE + 7, CURRENT_DATE + 14),
  ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000005', 'Venkovní žaluzie - RD Plzeň', 'Instalace venkovních žaluzií C80 na 6 oken', 'shading', 'site_visit', 'a0000000-0000-0000-0000-000000000003', NULL, 95000, NULL, CURRENT_DATE + 30),
  ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', NULL, 'Garážová vrata - Rezidence Karlín', 'Poptávka na 12ks garážových vrat do podzemních garáží', 'garage_doors', 'new_inquiry', 'a0000000-0000-0000-0000-000000000002', NULL, NULL, NULL, NULL),
  ('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Servis vrat - sídlo Stavby Praha', 'Pravidelný servis sekčních vrat, výměna pružin', 'garage_doors', 'done', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 12000, NULL, NULL);

INSERT INTO tasks (project_id, assigned_user_id, title, description, status, priority, due_date) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'Montáž vodících lišt', 'Připravit a namontovat vodící lišty pro oboje vrata', 'in_progress', 'high', CURRENT_DATE + 3),
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000004', 'Elektroinstalace pohonu', NULL, 'pending', 'high', CURRENT_DATE + 4),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Zaměření oken', 'Jet na místo a zaměřit všech 8 okenních otvorů', 'pending', 'medium', CURRENT_DATE + 5),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000005', 'Kontrola stavební připravenosti', NULL, 'done', 'medium', CURRENT_DATE - 2),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'Obhlídka a zaměření - Plzeň', NULL, 'pending', 'medium', CURRENT_DATE + 2);

INSERT INTO tasks (client_id, assigned_user_id, title, description, status, priority, due_date) VALUES
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'Kontaktovat klienta Rezidence Karlín', 'Domluvit schůzku pro prezentaci řešení', 'pending', 'high', CURRENT_DATE + 1);

INSERT INTO inventory (sku, name, description, category, unit, price_per_unit, stock_quantity, min_stock_level) VALUES
  ('HOR-LPU42-S', 'Hörmann LPU 42 - standardní', 'Sekční garážová vrata Hörmann', 'garage_doors', 'ks', 62000, 3, 1),
  ('HOR-SUP-M', 'Hörmann SupraMatic', 'Pohon pro sekční vrata', 'garage_doors', 'ks', 18000, 5, 2),
  ('PRU-TOR-SET', 'Pružiny torzní - sada', NULL, 'garage_doors', 'sada', 4500, 12, 5),
  ('EUR-IV68-W', 'Eurookno IV68 - bílé', 'Dřevěné eurookno profil IV68', 'windows', 'ks', 8500, 0, 0),
  ('ZAL-C80-ALU', 'Žaluzie C80 ALU', 'Venkovní hliníková žaluzie C80', 'shading', 'ks', 12000, 8, 3),
  ('MOT-SOM-IO', 'Somfy io motor', 'Motor pro venkovní žaluzie', 'shading', 'ks', 5500, 15, 5);

-- ============================================================
-- BlueCo — Seed Data
-- Run this AFTER schema.sql.
-- Populates the trades and skills reference tables.
-- Uses ON CONFLICT DO NOTHING so it is safe to re-run.
-- ============================================================

-- ============================================================
-- TRADES
-- ============================================================
insert into trades (name, slug) values
  ('Electrician',      'electrician'),
  ('Plumber',          'plumber'),
  ('Welder',           'welder'),
  ('Carpenter',        'carpenter'),
  ('Mason',            'mason'),
  ('HVAC Technician',  'hvac-technician'),
  ('Painter',          'painter'),
  ('Tiler',            'tiler'),
  ('Roofer',           'roofer'),
  ('Mechanic',         'mechanic'),
  ('Landscaper',       'landscaper'),
  ('General Labour',   'general-labour')
on conflict (slug) do nothing;


-- ============================================================
-- SKILLS
-- ============================================================
insert into skills (trade_id, name, slug) values
  -- Electrician
  ((select id from trades where slug = 'electrician'), 'Wiring & Installations',     'wiring-installations'),
  ((select id from trades where slug = 'electrician'), 'Solar Panel Installation',   'solar-panel-installation'),
  ((select id from trades where slug = 'electrician'), 'Electrical Fault Finding',   'electrical-fault-finding'),
  ((select id from trades where slug = 'electrician'), 'Panel Board Installation',   'panel-board-installation'),

  -- Plumber
  ((select id from trades where slug = 'plumber'), 'Pipe Fitting',                  'pipe-fitting'),
  ((select id from trades where slug = 'plumber'), 'Drainage Systems',              'drainage-systems'),
  ((select id from trades where slug = 'plumber'), 'Water Tank Installation',        'water-tank-installation'),
  ((select id from trades where slug = 'plumber'), 'Leak Detection & Repair',       'leak-detection-repair'),

  -- Welder
  ((select id from trades where slug = 'welder'), 'MIG Welding',                    'mig-welding'),
  ((select id from trades where slug = 'welder'), 'TIG Welding',                    'tig-welding'),
  ((select id from trades where slug = 'welder'), 'Arc Welding',                    'arc-welding'),
  ((select id from trades where slug = 'welder'), 'Metal Fabrication',              'metal-fabrication'),

  -- Carpenter
  ((select id from trades where slug = 'carpenter'), 'Furniture Making',            'furniture-making'),
  ((select id from trades where slug = 'carpenter'), 'Door & Window Fitting',       'door-window-fitting'),
  ((select id from trades where slug = 'carpenter'), 'Roofing Carpentry',           'roofing-carpentry'),
  ((select id from trades where slug = 'carpenter'), 'Cabinetry',                   'cabinetry'),

  -- Mason
  ((select id from trades where slug = 'mason'), 'Bricklaying',                     'bricklaying'),
  ((select id from trades where slug = 'mason'), 'Plastering',                      'plastering'),
  ((select id from trades where slug = 'mason'), 'Concrete Work',                   'concrete-work'),
  ((select id from trades where slug = 'mason'), 'Stone Masonry',                   'stone-masonry'),

  -- HVAC Technician
  ((select id from trades where slug = 'hvac-technician'), 'AC Installation',       'ac-installation'),
  ((select id from trades where slug = 'hvac-technician'), 'AC Maintenance & Repair','ac-maintenance-repair'),
  ((select id from trades where slug = 'hvac-technician'), 'Refrigeration Systems', 'refrigeration-systems'),
  ((select id from trades where slug = 'hvac-technician'), 'Ventilation Systems',   'ventilation-systems'),

  -- Painter
  ((select id from trades where slug = 'painter'), 'Interior Painting',             'interior-painting'),
  ((select id from trades where slug = 'painter'), 'Exterior Painting',             'exterior-painting'),
  ((select id from trades where slug = 'painter'), 'Spray Painting',                'spray-painting'),
  ((select id from trades where slug = 'painter'), 'Texture & Decorative Finishes', 'texture-decorative-finishes'),

  -- Tiler
  ((select id from trades where slug = 'tiler'), 'Floor Tiling',                    'floor-tiling'),
  ((select id from trades where slug = 'tiler'), 'Wall Tiling',                     'wall-tiling'),
  ((select id from trades where slug = 'tiler'), 'Waterproofing',                   'waterproofing'),

  -- Roofer
  ((select id from trades where slug = 'roofer'), 'Iron Sheet Roofing',             'iron-sheet-roofing'),
  ((select id from trades where slug = 'roofer'), 'Roof Repair',                    'roof-repair'),
  ((select id from trades where slug = 'roofer'), 'Guttering & Drainage',           'guttering-drainage'),

  -- Mechanic
  ((select id from trades where slug = 'mechanic'), 'Engine Repair',                'engine-repair'),
  ((select id from trades where slug = 'mechanic'), 'Auto Electrical',              'auto-electrical'),
  ((select id from trades where slug = 'mechanic'), 'Bodywork & Welding',           'bodywork-welding'),
  ((select id from trades where slug = 'mechanic'), 'Tyre & Suspension',            'tyre-suspension')

on conflict (slug) do nothing;

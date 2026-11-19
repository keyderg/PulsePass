-- Eventos y sedes de DEMOSTRACIÓN (parte 2) para tu base local. Complementa a seed-demo.sql.
-- Se puede ejecutar varias veces: no duplica sedes, eventos ni relaciones (ON CONFLICT / NOT EXISTS).
-- Los eventos son ficticios; las sedes, direcciones y aforos son reales pero APROXIMADOS (verifícalos si los vas a mostrar).
-- Usa los 5 artistas de V2 (Solar Beat, Neon Waves, Caribbean Sound, Ocean Drive, Digital Pulse).
-- Para probar «Agotado» baja el aforo, p. ej.:  UPDATE venues SET capacity = 2 WHERE code = 'VEN-BOG-03';

INSERT INTO venues (code, name, city, address, capacity, active) VALUES
 ('VEN-BOG-01', 'Movistar Arena',                           'Bogotá',   'Diagonal 61C # 26-36',     14000, true),
 ('VEN-BOG-02', 'Teatro Mayor Julio Mario Santo Domingo',   'Bogotá',   'Calle 170 # 67-51',         1700, true),
 ('VEN-BOG-03', 'Teatro Jorge Eliécer Gaitán',              'Bogotá',   'Carrera 7 # 22-47',         1700, true),
 ('VEN-BOG-04', 'Estadio El Campín',                        'Bogotá',   'Carrera 30 # 57-60',       36000, true),
 ('VEN-MED-02', 'Teatro Pablo Tobón Uribe',                 'Medellín', 'Carrera 40 # 51-24',         900, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO events (event_code, name, description, event_date, category, status, minimum_age, venue_id) VALUES
 ('ELE-2027',   'Noche Electrónica',            'Techno, deep house y dance en una sola noche.',  '2027-07-17 20:00', 'MUSIC',         'PUBLISHED', 18,
   (SELECT id FROM venues WHERE code = 'VEN-BOG-01')),
 ('REG-2027',   'Reggae en Vivo',               'Una tarde de reggae y dancehall.',               '2027-08-14 19:00', 'MUSIC',         'PUBLISHED', 0,
   (SELECT id FROM venues WHERE code = 'VEN-BOG-03')),
 ('TEC-2027',   'Cumbre Tech Colombia',         'Charlas y talleres sobre tecnología y software.','2027-09-09 09:00', 'TECHNOLOGY',    'PUBLISHED', 15,
   (SELECT id FROM venues WHERE code = 'VEN-BOG-02')),
 ('IND-2027',   'Indie Sunset',                 'Synthpop e indie al atardecer.',                 '2027-10-02 19:30', 'MUSIC',         'PUBLISHED', 0,
   (SELECT id FROM venues WHERE code = 'VEN-MED-02')),
 ('FES-2027',   'Festival Deportivo Urbano',    'Jornada de deportes urbanos y exhibiciones.',    '2027-11-20 16:00', 'SPORTS',        'PUBLISHED', 0,
   (SELECT id FROM venues WHERE code = 'VEN-BOG-04')),
 ('PAS-2026',   'Festival de Otoño (finalizado)','Evento pasado para probar el estado FINISHED.', '2026-10-10 18:00', 'CULTURE',       'FINISHED',  0,
   (SELECT id FROM venues WHERE code = 'VEN-BOG-02')),
 ('CAN-2027',   'Stand-up Capital (cancelado)', 'Evento cancelado para probar el estado CANCELLED.','2027-05-29 20:00','ENTERTAINMENT','CANCELLED', 18,
   (SELECT id FROM venues WHERE code = 'VEN-MED-02')),
 ('DRAFT-003',  'Festival de Fin de Año (borrador)', 'Solo visible para STAFF/ADMIN.',            '2027-12-18 18:00', 'ENTERTAINMENT', 'DRAFT',     0,
   (SELECT id FROM venues WHERE code = 'VEN-BOG-01'))
ON CONFLICT (event_code) DO NOTHING;

INSERT INTO event_artists (event_id, artist_id)
SELECT e.id, a.id
FROM (VALUES ('ELE-2027','Digital Pulse'), ('ELE-2027','Solar Beat'), ('ELE-2027','Ocean Drive'),
             ('REG-2027','Caribbean Sound'),
             ('IND-2027','Neon Waves'),     ('IND-2027','Ocean Drive'),
             ('PAS-2026','Solar Beat')) AS v(codigo, artista)
JOIN events e  ON e.event_code = v.codigo
JOIN artists a ON a.stage_name = v.artista
WHERE NOT EXISTS (SELECT 1 FROM event_artists ea WHERE ea.event_id = e.id AND ea.artist_id = a.id);

-- Corrige el seed inicial con los datos reales del Plan Metabólico.
-- El seed original usó nombres genéricos porque el plan todavía no estaba a la
-- mano. Cada UPDATE está condicionado al valor exacto que sembró el seed, así
-- que si algo ya se editó desde Config, la edición se respeta.

UPDATE settings
SET value = '{"A":"Fuerza metabólica tren superior","B":"Zona 2 en caminadora","C":"Fuerza metabólica tren inferior + core","D":"Intervalos en caminadora","E":"Circuito full body «HYROX en casa»","OTHER":"Otro"}'
WHERE key = 'workout_labels'
  AND value = '{"A":"Circuito metabólico","B":"Fuerza tren superior","C":"Fuerza-resistencia","D":"Fuerza tren inferior","E":"Intervalos / HIIT","OTHER":"Otro"}';
--> statement-breakpoint

UPDATE supplement_defs SET name = 'Inositol (myo-D-chiro)', timing_label = 'Pre-prandial, comida principal'
WHERE name = 'Inositol' AND timing_label = 'Antes de comer';
--> statement-breakpoint

UPDATE supplement_defs SET name = 'Omega-3 1,400 mg EPA+DHA', timing_label = 'Diario, con comida grasa'
WHERE name = 'Omega-3' AND timing_label = 'Con comida grasa';
--> statement-breakpoint

UPDATE supplement_defs SET timing_label = 'Diaria, hora indistinta'
WHERE name = 'Creatina 5 g' AND timing_label = 'Cualquier momento';
--> statement-breakpoint

UPDATE supplement_defs SET name = 'Magnesio bisglicinato', timing_label = '30-60 min antes de dormir'
WHERE name = 'Magnesio' AND timing_label = 'Antes de dormir';
--> statement-breakpoint

UPDATE supplement_defs SET name = 'D3+K2', timing_label = 'Con la comida más grasa'
WHERE name = 'D3 + K2' AND timing_label = 'Con comida grasa';
--> statement-breakpoint

UPDATE supplement_defs SET name = 'HMB-Ca', timing_label = 'Alrededor del entreno'
WHERE name = 'HMB' AND timing_label = 'Peri-entreno';
--> statement-breakpoint

UPDATE supplement_defs SET name = 'B12 metilcobalamina', timing_label = 'Sublingual'
WHERE name = 'B12' AND timing_label = 'Sublingual, en ayunas';
--> statement-breakpoint

UPDATE supplement_defs SET name = 'Proteína Birdman Falcon', timing_label = 'Para llegar a 130-150 g'
WHERE name = 'Proteína' AND timing_label = 'Según objetivo del día';

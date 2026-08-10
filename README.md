# FitTrack Alberto

Portal personal de tracking metabólico y de entrenamiento. Un solo usuario, mobile-first,
instalable como PWA. Implementa el alcance **P0** del PRD v1.0 (R1–R9).

- **Stack:** Next.js 15 (App Router) · TypeScript · Tailwind v4 · Drizzle ORM · Vercel Postgres (Neon)
- **Zona horaria:** `America/Monterrey`, fija en todo el portal
- **Idioma:** español

---

## Puesta en marcha local

```bash
npm install
cp .env.example .env.local     # pon tu POSTGRES_URL y tu ACCESS_PASSWORD
npm run db:migrate             # crea tablas + seed de suplementos y metas
npm run dev                    # http://localhost:3000
```

`db:migrate` es idempotente: aplica las migraciones pendientes y siembra las metas por
defecto y los 8 suplementos sólo si faltan.

## Deploy en Vercel

1. Importa el repo en Vercel.
2. Conecta una base **Vercel Postgres (Neon)** al proyecto con el prefijo `POSTGRES`,
   para que la variable quede como `POSTGRES_URL` (también se acepta `DATABASE_URL`).
3. Agrega la variable de entorno `ACCESS_PASSWORD`.
4. Opcional: crea un store de **Vercel Blob** (inyecta `BLOB_READ_WRITE_TOKEN`) para
   habilitar la sección Documentos. Sin él, el resto del portal funciona igual y
   Documentos avisa que falta conectarlo.
5. Deploy.

El comando de build es `npm run db:migrate && next build`, así que **las migraciones y el
seed corren solos en cada deploy**. No hace falta ningún paso manual más allá de las dos
variables de entorno. Si `POSTGRES_URL` no está definida, la migración se salta con un
aviso en vez de romper el build.

### Acceso

Todo el portal vive detrás de un middleware que exige `ACCESS_PASSWORD` (R9). Al entrar
correctamente se guarda una cookie `httpOnly` de 30 días con un hash de la contraseña —
nunca la contraseña en claro. Si `ACCESS_PASSWORD` no está configurada, el portal queda
cerrado y `/login` lo explica: falla cerrado, no abierto.

---

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Migra la DB y compila para producción |
| `npm run test` | Pruebas unitarias de la lógica pura (fechas, sueño, HOMA-IR, reglas de secuencia) |
| `npm run lint` | ESLint |
| `npm run db:generate` | Genera una migración SQL nueva tras cambiar `src/db/schema.ts` |
| `npm run db:migrate` | Aplica migraciones + seed |
| `npm run db:studio` | Drizzle Studio contra la DB configurada |

---

## Mapa del código

```
src/
  app/
    (portal)/            Hoy · Plan · Semana · Tendencias · Labs · Config
    api/documentos/      Sirve los archivos de Blob detrás de la sesión
    login/               Pantalla de acceso y server actions de sesión
    manifest.ts          Manifest de la PWA
  actions/               Server actions (mutaciones), una por dominio
  components/            UI; los formularios son client components
  db/                    Esquema Drizzle, cliente, migración y seed
  lib/
    date.ts              Fechas civiles en Monterrey; duración de sueño
    plan.ts              El Plan Metabólico transcrito del PDF
    status.ts            Semáforos del día
    rules.ts             Reglas de secuencia de entrenos
    labs.ts              HOMA-IR y tendencias de marcadores
    queries/             Lecturas (día, semana, tendencias, labs)
  middleware.ts          Password gate
tests/                   Pruebas de la lógica pura
drizzle/                 Migraciones SQL versionadas
```

Las páginas son Server Components que leen con Drizzle; las mutaciones son server
actions que revalidan el layout. No hay API REST intermedia.

---

## Decisiones que conviene conocer

- **El plan vive dentro del portal.** `src/lib/plan.ts` es la transcripción del Plan
  Metabólico (las 5 sesiones con sus ejercicios, cargas y notas técnicas; fases; semana de
  la extracción; calorías; suplementos). La sección **Plan** lo muestra y **Hoy** dice qué
  toca, así que no hace falta abrir el PDF. Si el plan cambia, se edita ese archivo.
- **La plantilla semanal por defecto es `A · D · descanso · C · B · E · descanso`.** El plan
  sugiere la secuencia A → D → C → B → E con "2 días de descanso donde acomode", pero leída
  como días corridos rompería su propia regla de no poner C y D juntos. Los descansos van en
  miércoles y domingo porque es la colocación que respeta las reglas duras; hay una prueba
  que lo verifica. Se edita en **Config → Qué toca cada día**.
- **Un día sin entreno se pinta neutro, no rojo.** La meta es 5 entrenos por semana: los
  días de descanso son parte del plan y marcarlos en rojo entrenaría a ignorar el semáforo.
- **Sin dato ≠ cero.** Las gráficas cortan la línea donde no hay registro (R6) y los
  semáforos muestran gris, no rojo, cuando falta capturar.
- **Un registro por día** en sueño y métricas diarias: volver a capturar corrige en vez de
  duplicar. Sobrescribir métricas exige confirmación explícita (R4).
- **HOMA-IR** se calcula solo con glucosa × insulina / 405, pero si capturas el valor a
  mano, el tuyo manda (R7).
- **El peso de la vista Tendencias es media móvil de 7 días** para separar ruido de
  tendencia real.

- **Los documentos nunca exponen su URL de almacenamiento.** El binario vive en Vercel Blob,
  pero el navegador sólo ve `/api/documentos/<id>`, que pasa por el middleware de sesión.

## Fuera de alcance en esta versión

P1 y P2 del PRD siguen pendientes: **leer resultados desde una foto, un CSV o un PDF
subido** (import de Withings/SECA era P1), exportación CSV/JSON, racha de días completos,
modo oscuro, vista imprimible para la cita, integraciones con wearables, presión arterial y
notificaciones push.

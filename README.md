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
2. Conecta una base **Vercel Postgres (Neon)** al proyecto — inyecta `POSTGRES_URL` sola.
3. Agrega la variable de entorno `ACCESS_PASSWORD`.
4. Deploy.

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
    (portal)/            Hoy · Semana · Tendencias · Labs · Config
    login/               Pantalla de acceso y server actions de sesión
    manifest.ts          Manifest de la PWA
  actions/               Server actions (mutaciones), una por dominio
  components/            UI; los formularios son client components
  db/                    Esquema Drizzle, cliente, migración y seed
  lib/
    date.ts              Fechas civiles en Monterrey; duración de sueño
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

- **Las etiquetas de los tipos de entreno A–E son marcadores de posición.** El PRD nombra
  los tipos pero no su contenido, así que se sembraron nombres genéricos y se editan en
  **Config → Nombres de los tipos de entreno**. Lo que sí es fijo son las reglas de
  secuencia: C↔D y A↔E no pueden caer en días consecutivos, y la vista Semana lo avisa.
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

## Fuera de alcance en esta versión

P1 y P2 del PRD siguen pendientes: importación y exportación CSV/JSON, racha de días
completos, modo oscuro, vista imprimible para la cita, integraciones con wearables,
presión arterial y notificaciones push.

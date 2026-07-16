# BetGO Admin

Panel de administración de BetGO. Gestiona bares, símbolos de la tragamonedas,
premios, personal (mozos y encargados), el pozo global y las transacciones.

Next.js 16 (App Router, RSC + Server Actions) · React 19 · Tailwind v4 ·
shadcn/ui (new-york) · TypeScript.

Consume la API de `betgo-backend` **server-to-server**: el navegador nunca ve la
URL del backend ni los tokens (viven en cookies httpOnly).

---

## Requisitos

- **Node.js 20+** y npm (para correr en local)
- **Docker** y Docker Compose (para correr en contenedor)
- **betgo-backend** corriendo y accesible (y su PostgreSQL)

---

## Variables de entorno

Una sola variable:

| Variable      | Descripción                                                                            |
| ------------- | -------------------------------------------------------------------------------------- |
| `BACKEND_URL` | URL base de la API de NestJS. Solo se usa en el servidor, nunca se expone al navegador. |

Copiá el ejemplo y ajustalo:

```bash
cp .env.example .env.local
```

```env
BACKEND_URL=http://localhost:3000/api
```

> En Docker, `docker-compose.yml` la sobreescribe con `http://betgo_backend:3000/api`,
> porque dentro de la red los contenedores se resuelven por nombre.

---

## Correr en local

```bash
npm install
cp .env.example .env.local     # ajustá BACKEND_URL si hace falta
npm run dev
```

Abrí **http://localhost:3001**.

> El backend usa el puerto 3000, por eso el admin corre en el **3001**.

### Build de producción en local

```bash
npm run build
npm run start
```

### Scripts

| Script          | Qué hace                                 |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Servidor de desarrollo en el puerto 3001 |
| `npm run build` | Build de producción                      |
| `npm run start` | Sirve el build de producción             |
| `npm run lint`  | ESLint                                   |

---

## Correr con Docker

El admin se levanta en la misma red que el resto de BetGO (`betgo_network`) y
llega al backend por nombre de contenedor.

### 1. Red y base de datos (una sola vez)

```bash
docker network create betgo_network
docker volume create betgo_postgres_data

cd infra
docker-compose up -d           # levanta betgo_postgres
```

### 2. Backend

```bash
cd betgo-backend
docker-compose up -d --build   # levanta betgo_backend
```

### 3. Admin

```bash
cd betgo-admin
cp .env.example .env.local     # docker-compose lo lee como env_file
docker-compose up -d --build
```

Abrí **http://localhost:3001**.

### Comandos útiles

```bash
docker-compose logs -f admin   # ver logs
docker-compose restart admin   # reiniciar
docker-compose down            # detener
docker-compose up -d --build   # reconstruir tras cambios
```

> **Si el backend no está en Docker** (lo corrés con `npm`), el nombre
> `betgo_backend` no resuelve. Cambiá `BACKEND_URL` en `docker-compose.yml` a
> `http://host.docker.internal:3000/api` para que el contenedor llegue a tu máquina.

---

## Puertos

| Servicio      | Contenedor        | Puerto   |
| ------------- | ----------------- | -------- |
| PostgreSQL    | `betgo_postgres`  | 5432     |
| Backend (API) | `betgo_backend`   | 3000     |
| **Admin**     | **`betgo_admin`** | **3001** |

---

## Estructura

```
app/
├─ (admin)/              rutas del panel (heredan sidebar + header)
│  ├─ bares/  mozos/  premios/  pozo/  transacciones/  dashboard/
└─ login/                login (fuera del shell del admin)

components/
├─ ui/                   primitivas shadcn (button, table, dialog, …)
├─ bares/  staff/  premios/  pozo/  transacciones/    un módulo por sección
└─ layout/               sidebar, header

lib/
├─ session.ts            cookies httpOnly + apiFetch (adjunta el Bearer)
├─ auth.ts               contrato de sesión y roles
└─ <módulo>/             types.ts · api.ts (lectura) · actions.ts (escritura)

config/                  navegación y constantes por módulo
proxy.ts                 guard de rutas + refresh de tokens
```

**Convenciones:**

- `lib/<módulo>/api.ts` — lectura, `server-only`, se usa desde Server Components.
- `lib/<módulo>/actions.ts` — escritura (`"use server"`), revalida la ruta.
- Los componentes reciben datos por props; el estado de UI vive en el cliente.
- Feedback con `withToast()` (sonner) en toda mutación.
- Los comentarios `ponytail:` marcan simplificaciones deliberadas: nombran el
  techo y el camino de salida.

---

## Autenticación

- El login llama al backend y guarda `accessToken` / `refreshToken` en cookies
  **httpOnly** (no accesibles por JS).
- `proxy.ts` protege las rutas y **renueva el access token** cuando expira,
  usando el refresh.
- Solo usuarios con rol **admin** pueden entrar.

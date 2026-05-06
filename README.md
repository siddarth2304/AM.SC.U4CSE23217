# Campus Notification Platform

Practice full-stack assessment project for a campus notification platform.

## Structure

```text
logging_middleware/
notification_app_be/
notification_app_fe/
notification_system_design.md
README.md
.gitignore
```

## Setup

```bash
cd notification_app_be
npm install

cd ../notification_app_fe
npm install
```

Optional local environment files:

```bash
cp notification_app_be/.env.example notification_app_be/.env
cp notification_app_fe/.env.example notification_app_fe/.env
```

Do not commit `.env` files.

## Run

Backend:

```bash
cd notification_app_be
npm run dev
```

Frontend:

```bash
cd notification_app_fe
npm run dev
```

Backend runs on `http://localhost:5000`.
Frontend runs on `http://localhost:3000`.

## Checks

```bash
cd notification_app_be
npm run typecheck
npm run build
npm test
```

```bash
cd notification_app_fe
npm run typecheck
npm run build
npm test
```

## Sample API Requests

```bash
curl http://localhost:5000/api/health
curl "http://localhost:5000/api/notifications?page=1&limit=10"
curl "http://localhost:5000/api/notifications?type=Placement&page=1&limit=10"
curl "http://localhost:5000/api/notifications/priority?n=10"
curl -X PATCH http://localhost:5000/api/notifications/1/viewed
```

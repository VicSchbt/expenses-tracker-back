# Prisma Commands – Developer Cheat Sheet

This document provides a quick reference for the most common Prisma commands used in development.

## 📦 Installation
```bash
npm install prisma --save-dev
npm install @prisma/client
```


Initialize Prisma in your project:

```
npx prisma init
```

This will create:

- a `prisma/schema.prisma` file (data model + datasource + generator)

- a `.env` file (environment variables like `DATABASE_URL`)

## 🔄 Database Migrations
### Create a new migration
```bash
npx prisma migrate dev --name <migration_name>
```

- Applies schema changes to the database

- Generates a new migration file under prisma/migrations/

- Updates the Prisma Client

Example:
```
npx prisma migrate dev --name add-user-table
```
### Reset database
```
npx prisma migrate reset
```

- Drops the database

- Recreates it from migrations

- Runs seed scripts (if configured)

## 🛠️ Prisma Client
### Generate client
```
npx prisma generate
```

- Generates the Prisma Client based on schema.prisma

- Run this whenever the schema changes

### Use Prisma Client (example in TS)
```ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const allUsers = await prisma.user.findMany()
  console.log(allUsers)
}

main()
```

## 🔍 Database Introspection
### Pull schema from existing database
```
npx prisma db pull
```

- Introspects the database and updates `schema.prisma`

- Useful when working with an existing DB

## 🌱 Seeding the Database

Define a `prisma/seed.ts` (or `.js`) script, then run:
```bash
npx prisma db seed
```

Configure seeding in `package.json`:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

## 🖥️ Studio
### Open Prisma Studio (GUI for DB)
```bash
npx prisma studio
```


- Launches a web UI to browse and edit your data

## ⚡ Quick Reference
| Command                                   | Description                                 |
|--------------------------------------------|---------------------------------------------|
| `npx prisma init`                         | Initialize Prisma in project                |
| `npx prisma migrate dev --name NAME`      | Create & apply migration                    |
| `npx prisma migrate reset`                | Reset database with all migrations          |
| `npx prisma generate`                     | Regenerate Prisma Client                    |
| `npx prisma db pull`                      | Introspect database schema                  |
| `npx prisma db push`                      | Push schema changes without migrations      |
| `npx prisma db seed`                      | Run seed script                             |
| `npx prisma studio`                       | Open Prisma Studio                          |
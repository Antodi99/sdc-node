# Articles App

This project is a simple full-stack web application built with **Express** and **Vue**.  

## Installation and Setup

```bash
# 1. Install dependencies for both server and client
npm run install:all

# 2. Create environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Start Docker services
npm run docker:up

# 4. Run database migrations
npm run db:migrate

# 5. Run database seeder
npm run db:migrate:seed

# 6. Run both FE and BE in development mode
npm run dev
```

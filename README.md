# Articles App

This project is a simple full-stack web application built with **Express** and **Vue**.  

## Overview

**Frontend:**

- Built with Vue 3 and Vite
- Uses `@vueup/vue-quill` for the WYSIWYG editor
- Provides pages for listing, viewing, and creating articles

**Backend:**

- Built with Express (Node.js)
- Stores articles as JSON files in `/server/data`
- Validates input with Joi and handles errors with structured responses

## Project Structure

```
project/
├── client/           # Vue frontend
│   ├── src/
│   ├── .env.example
│   └── package.json
│
├── server/           # Express backend
│   ├── data/         # Article JSON files
│   ├── index.js
│   ├── .env.example
│   └── package.json
│
├── package.json      # Root workspace configuration
└── README.md
```

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

# 5. Run both FE and BE in development mode
npm run dev
```

## API Endpoints

| Method | Endpoint            | Description                       |
| ------ | ------------------- | --------------------------------- |
| GET    | `/api/articles`     | Returns list of all articles      |
| GET    | `/api/articles/:id` | Returns a single article by ID    |
| POST   | `/api/articles`     | Creates a new article             |
| PUT    | `/api/articles/:id` | Updates an existing article by ID |
| DELETE | `/api/articles/:id` | Deletes an existing article by ID |
| GET    | `/api/health`       | Health check endpoint             |

Articles are stored in `/server/data` as individual JSON files.

## Validation and Error Handling

- `title` and `content` fields are required for article creation.
- The server returns JSON errors in the following format:

```json
{
  "error": {
    "message": "Title is required",
    "status": 400
  }
}
```

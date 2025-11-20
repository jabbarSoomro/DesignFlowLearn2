# System Design Academy (DesignFlowLearn)

A comprehensive platform for learning system design concepts visually.

## Prerequisites

- Node.js (v20.6.0 or later)
- PostgreSQL (or a compatible database)

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Configuration:**
    Ensure you have a `.env` file in the root directory with the following variables:
    ```env
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/designflow
    JWT_SECRET=your_jwt_secret
    SESSION_SECRET=your_session_secret
    PORT=5000
    NODE_ENV=development
    ```

3.  **Database Setup:**
    Push the schema to your database:
    ```bash
    npm run db:push
    ```

## Running the Application

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the client and server for production.
-   `npm start`: Starts the production server.
-   `npm run db:push`: Pushes Drizzle schema changes to the database.

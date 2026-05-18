# System Architecture & Implementation Overview

This document provides a comprehensive breakdown of the Timber Tales application, detailing how the system is designed, the technologies used, and the core features implemented.

## 1. System Architecture Flow

The architecture follows a standard 3-tier Client-Server model. The client requests are processed by the Node.js API, which interacts with the PostgreSQL database to persist and retrieve data.

```mermaid
graph TD
    Admin(["🧑‍💼 Admin User"])
    Customer(["👤 Customer"])
    
    subgraph Frontend Client
        UI["Web Interface (HTML/CSS/JS)"]
    end
    
    subgraph Backend Server
        API["Express.js REST API (Node.js)"]
    end
    
    subgraph Database Layer
        DB[("PostgreSQL Database")]
    end

    Customer -->|Browses, Checks out| UI
    Admin -->|Manages Products & Orders| UI
    
    UI <-->|HTTP GET/POST/PUT/DELETE (JSON)| API
    API <-->|SQL Queries (pg)| DB
```

## 2. Technological Stack

| Layer / Domain | Technology | Purpose & Implementation Details |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5, CSS3 | Semantic page structure and custom responsive styling without heavy CSS frameworks. |
| **Frontend Logic** | Vanilla JavaScript | Client-side logic, DOM manipulation, and asynchronous HTTP requests via Fetch API. |
| **Backend Server** | Node.js & Express.js | High-performance, event-driven web server to handle RESTful API routing. |
| **Database** | PostgreSQL | Robust relational database for managing structured Users, Products, and Orders data. |
| **DB Driver** | `pg` (Node Postgres) | Non-blocking PostgreSQL client for Node.js used for direct SQL query execution. |
| **Authentication** | JSON Web Tokens (JWT) | Stateless authentication mechanism for securing user and admin sessions. |
| **Security** | `bcryptjs` | Cryptographic hashing algorithm for secure password storage in the database. |
| **Environment** | `dotenv` | Secure management of environment variables (`PORT`, `DATABASE_URL`, `SECRET_KEY`). |

## 3. Frontend Implementation Details

The frontend of Timber Tales was built entirely from scratch using vanilla web technologies, ensuring a lightweight and incredibly fast user experience:

- **Static Serving:** All client files are statically served from the `public/` directory via Express (`app.use(express.static('public'))`).
- **Modular Structure:** The application uses separate HTML files for distinct views (e.g., `index.html`, `collection.html`, `cart.html`, `admin.html`) rather than a Single Page Application (SPA) framework.
- **API Integration:** The frontend communicates with the backend exclusively through the modern native `Fetch API`. Responses are parsed as JSON to dynamically update the DOM.
- **State Management:** User sessions (JWT tokens) and shopping cart data are persisted using the browser's `localStorage`, allowing the state to persist across page reloads.
- **Admin Isolation:** Admin logic is separated into a dedicated `admin.js` file to ensure the public `script.js` remains lightweight and secure.

## 4. Key Features

### 🛍️ Customer Experience
- **Dynamic Product Catalog:** View real-time product listings fetched directly from the database.
- **Shopping Cart:** Add, remove, and adjust items in a local shopping cart that automatically calculates totals.
- **Secure Checkout & Order History:** Process orders securely and view past order history tied to the user's account.
- **Responsive Design:** Optimized for both desktop and mobile viewing with a cohesive, modern UI.

### 🛡️ Security & Authentication
- **User Registration & Login:** Encrypted user signup and secure login system.
- **Route Protection:** JWT-based protection ensures only authenticated users can place orders and access history.
- **Role-Based Authorization:** Strict backend checks ensure that only users with the `admin` role can access or modify inventory routes.

### 🔧 Admin Capabilities
- **Inventory Management:** Full CRUD (Create, Read, Update, Delete) capabilities for the product catalog.
- **Image Uploads:** Admins can upload product images which are processed as Base64 strings and saved statically on the server.
- **Order Fulfillment View:** Access a comprehensive list of all customer orders across the entire platform.

## 5. Backend Development & Key Components

The backend is built as a monolithic RESTful API using Node.js and Express, designed for simplicity, speed, and easy deployment.

### Core Architecture & Initialization
- **Express App:** The central `server.js` file configures the Express application, applies global middleware (`cors`, `body-parser`), and maps all API routes.
- **Database Bootstrapping:** Upon startup, the server establishes a connection pool to PostgreSQL using the `pg` library. It automatically provisions the schema by executing `CREATE TABLE IF NOT EXISTS` for `users`, `orders`, and `products`. It also checks if the products table is empty and seeds initial default products.

### Key Backend Components & Modules
- **Authentication Module (`/api/auth/*`):** 
  - Handles `/signup` and `/login`.
  - Utilizes `bcryptjs` to asynchronously hash passwords with a salt round of 10 before saving to the database, ensuring raw passwords are never exposed.
  - Issues `jsonwebtoken` (JWT) upon successful login. The token payload contains user identification and role data, signed with a configurable `SECRET_KEY`.
- **Product Management Module (`/api/products/*`):**
  - Exposes full CRUD REST endpoints. 
  - **Image Processing logic:** The `POST` endpoint handles large JSON payloads (configured up to 50mb via `body-parser`) containing Base64 encoded images. The server parses this string using Regex, converts it to a raw binary buffer, and saves it asynchronously to the local file system (`public/images/`). The resulting file path is then inserted into the PostgreSQL `imageUrl` column.
- **Order Processing Module (`/api/orders/*`):**
  - Handles creation of orders containing stringified JSON for arrays of cart items and nested shipping address objects.
  - Provides endpoints for users to fetch their individual order history (`GET /api/orders/:userId`) and for admins to fetch a global ledger (`GET /api/admin/orders`).

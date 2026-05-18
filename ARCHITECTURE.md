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

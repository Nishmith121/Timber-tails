# Timber Tales E-Commerce

Timber Tales is a robust, lightweight full-stack e-commerce web application. Designed with vanilla HTML/CSS/JS on the frontend and powered by a Node.js Express server on the backend, it delivers a fast and seamless shopping experience. The database has been successfully migrated to **PostgreSQL** to ensure production-level reliability and scalability.

## 🚀 Features

- **User Authentication:** Secure JWT-based signup and login system.
- **Role-Based Access Control:** Built-in admin accounts for inventory and order management.
- **Product Management:** Fully-featured API to add, edit, delete, and view products with image upload capabilities.
- **Order Processing:** Cart checkout and order history tracking for users.
- **RESTful API Backend:** Clean and well-structured Express.js routes.
- **Relational Database:** Powered by PostgreSQL.

### 🔐 Default Admin Access
To access the admin dashboard, you can use the default administrator credentials:
- **Email:** `admin@gmail.com`
- **Password:** `admin@123`

## 🛠️ Technologies Used

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Security:** bcryptjs (password hashing), jsonwebtoken (JWT auth)
- **Database:** PostgreSQL (using `pg` node package)
- **Deployment:** Render (via Blueprint `render.yaml`), Neon (Serverless Postgres)

---

## 💻 Running Locally

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/en/) (v14 or higher)
- [PostgreSQL](https://www.postgresql.org/) (Ensure your local Postgres server is running)

### Setup Steps

1. **Clone the repository:**
   \`\`\`bash
   git clone <repository-url>
   cd ecomerce
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment Variables:**
   Create a \`.env\` file in the root directory and configure the following variables:
   \`\`\`env
   PORT=3005
   SECRET_KEY=your_super_secret_key_here
   # Update this URL with your local postgres credentials
   DATABASE_URL=postgres://postgres:root@localhost:5432/ecomerce
   \`\`\`

4. **Start the application:**
   \`\`\`bash
   npm start
   \`\`\`
   The server will start running on \`http://localhost:3005\`. The app will automatically create the necessary database tables and seed them with initial product data upon the first successful connection.

---

## ☁️ Setting Up Neon (PostgreSQL Database)

To deploy the database to the cloud, we use [Neon](https://neon.tech/), a serverless Postgres platform.

1. **Create a Neon Account:** Go to [Neon.tech](https://neon.tech/) and sign up.
2. **Create a Project:** Click on "New Project". Give it a name (e.g., \`timber-tales-db\`) and select your preferred region.
3. **Get the Connection String:** 
   - Once the project is created, navigate to the **Dashboard**.
   - Under **Connection Details**, you will find your \`postgres://...\` connection string. It usually looks like this:
     \`\`\`
     postgres://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require
     \`\`\`
4. **Update your App:** Replace the \`DATABASE_URL\` in your local \`.env\` file (or provide it to your hosting platform like Render) with this new connection string.

---

## 🚢 Deploying to Render

This repository is fully configured for seamless deployment on [Render](https://render.com/) using the Blueprint specification (\`render.yaml\`).

1. **Sign in to Render:** Go to your Render Dashboard.
2. **New Blueprint Instance:** Click on **New +** and select **Blueprint**.
3. **Connect Repository:** Link your GitHub/GitLab repository containing this codebase.
4. **Configure Environment Variables:** During the deployment setup, Render will prompt you for variables defined in \`render.yaml\`.
   - Provide the **DATABASE_URL** you obtained from Neon in the previous step.
5. **Deploy:** Click **Apply** to provision your web service automatically. Render will install dependencies, start the server using \`npm start\`, and handle HTTPS routing.

---

## 📂 Project Structure

\`\`\`
ecomerce/
├── images/               # Product and site images
├── node_modules/         # NPM dependencies
├── admin.html            # Admin dashboard
├── cart.html             # Shopping cart page
├── checkout.html         # Checkout flow
├── collection.html       # Product listing
├── index.html            # Landing page
├── invoice.html          # Order invoice view
├── login.html            # User login
├── order-success.html    # Post-purchase confirmation
├── orders.html           # User order history
├── signup.html           # User registration
├── script.js             # Main frontend logic
├── admin.js              # Admin-specific logic
├── styles.css            # Global stylesheets
├── server.js             # Express application and API routes
├── package.json          # Node project metadata
├── render.yaml           # Render deployment configuration
└── README.md             # Project documentation
\`\`\`

# MarketLink - Farm Fresh Just a Click Away
**TechWiz 7 / Aptech Software Requirements Specification v1.0**
**Theme**: eGreen Basket | **Category**: End-to-End Web Solutions

MarketLink is a full-stack web application designed to connect local farmers-market vendors directly with health-conscious consumers. It enables farmers to publicize weekly harvest stock, set pickup schedules, and manage incoming pre-orders. Customers can discover nearby markets via interactive maps, filter fresh organic produce, schedule pre-orders for market pickup, leave ratings, and chat with an AI assistant.

---

## Technical Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide React Icons, Leaflet / React-Leaflet (OpenStreetMap), Recharts, Canvas Confetti.
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs password hashing.
- **Database**: Embedded JSON/SQLite zero-config engine with full `schema.sql` export.

---

## 🔐 Authentication

Beyond email/password, MarketLink now supports:

- **Sign in / sign up with Google** — one-click auth via Google Identity Services. Requires a Google OAuth Client ID:
  1. Create one (type "Web application") at https://console.cloud.google.com/apis/credentials
  2. Add `http://localhost:5173` (and your real domain later) under "Authorized JavaScript origins"
  3. Put the Client ID in **both** `backend/.env` (`GOOGLE_CLIENT_ID`) and `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`)

  Google sign-up is offered for Customer accounts (Farmer accounts still go through the full form since they need business details + Admin approval). If a Google email matches an existing password account, it's simply linked — no duplicate account.

- **Forgot / reset password** — `/forgot-password` emails a one-hour reset link (via `backend/src/utils/email.js`, Nodemailer). Configure `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`EMAIL_FROM` in `backend/.env` to actually send mail (Gmail App Passwords work well). **Without SMTP configured, the server just prints the reset link to the console and returns it in the API response** so the flow is fully testable in dev — remove that dev fallback before going to production.

- **Email validation** — both the login and register forms validate the email format client-side, and the API rejects malformed addresses server-side too.

---

## Project Structure
```
MarketLink/
├── backend/            # Express REST API & Database engine
│   ├── src/
│   │   ├── config/     # Database persistence
│   │   ├── controllers/# Auth, Markets, Products, Orders, Reviews, Favorites, Admin, AI
│   │   ├── middleware/ # JWT Auth & Role Access Control
│   │   ├── routes/     # Express API routes
│   │   ├── seed.js     # Seed script
│   │   └── server.js   # Express server entry point
│   ├── schema.sql      # Database SQL Table Definitions
│   └── package.json
├── frontend/           # Vite React SPA
│   ├── src/
│   │   ├── components/ # Header, Footer, MapView, ProductCard, AIAssistant, etc.
│   │   ├── context/    # AuthContext & CartContext
│   │   ├── pages/      # Home, Markets, Products, Dashboards, Cart, About, Contact
│   │   └── index.css   # Tailwind design tokens
│   └── package.json
├── schema.sql          # Root SQL script file
├── User_Credentials.md # Mandatory evaluation user passwords
└── README.md           # Project documentation
```

---

## How to Install and Run

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)

### Step 1: Set up MongoDB
The backend now stores all data in MongoDB (previously a `db.json` file).
- **Local:** install MongoDB Community Edition and make sure it's running (`mongod`).
- **Cloud:** create a free cluster on MongoDB Atlas.

Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` to your
connection string (defaults to `mongodb://127.0.0.1:27017/marketlink`).

### Step 2: Install Backend Dependencies & Start Server
```bash
cd backend
npm install
npm start
```
*The server connects to MongoDB, seeds initial data on first boot (if the `users` collection is empty), and starts on `http://localhost:5000`.*

### Step 3: Install Frontend Dependencies & Start App
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The React app will start on `http://localhost:5173`.*

---

## Key Features Implemented

1. **Role-Based Portals**:
   - **Customer Portal**: Search produce, map discovery, cart & pre-order checkout with pickup slot selection, order status tracking, favorite farmers, reviews, AI assistant.
   - **Farmer Portal**: Manage weekly stock, pricing, order acceptance, order status progression, sales analytics, review responses.
   - **Admin Portal**: System metrics, farmer application approvals, market management, product moderation, announcements, platform revenue reports.
2. **Interactive Map Integration**: Powered by OpenStreetMap / Leaflet with custom markers for markets and farmer stall pickup points.
3. **Greenie AI Assistant**: Interactive chatbot for finding items, checking market operating days, pickup windows, and farm tips.
4. **Offline Payment Model**: Orders are pre-ordered online and settled in person at market pickup per SRS requirements.
5. **MongoDB persistence**: all app data (users, markets, products, orders, reviews, favorites, audit logs) lives in MongoDB via `backend/src/config/db.js`, instead of the old flat `db.json` file.
6. **GSAP scroll animations**: `frontend/src/components/ScrollEffects.jsx` drives a scroll-progress bar, staggered section/card reveals, animated stat counters, and parallax, using GSAP + ScrollTrigger across every page.
7. **Community Impact section**: a new stats + testimonials section on the Home page (`frontend/src/components/CommunityImpact.jsx`) showcasing the animated counters.

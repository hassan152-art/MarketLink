# MarketLink User Credentials & Evaluation Guide
Comprehensive Testing & Feature Reference

Use the following pre-configured credentials and testing guide to evaluate the **MarketLink** web application across all three user roles and features.

---

## 1. Platform Administrator
- **Email**: `admin@marketlink.com`
- **Password**: `admin123`
- **Role**: `Admin`
- **Dashboard URL**: `http://localhost:5173/dashboard/admin`
- **Capabilities & Features**:
  - **Farmer Approvals**: One-click approve or reject pending farmer registration applications.
  - **Customer Management**: Activate or deactivate customer accounts.
  - **Advanced Analytics**: Real-time metrics for Total Revenue, Average Order Value (AOV), Repeat Purchase Rate, Cancellation Rate, Pickup Completion Rate, 7-Day Sales Trend chart, and Top-Selling Produce.
  - **Export Platform Reports**: Download full platform order history as **CSV** (`.csv`) or **JSON** (`.json`).
  - **Farmers Markets Management**: Add, update, and manage market locations, operating hours, and days.
  - **Categories Management**: Add new categories (e.g., Organic Vegetables, Dairy, Bakery, Honey).
  - **Content Moderation**: Review all customer feedback, remove flagged spam, and inspect sentiment analysis scores.
  - **Security & Audit Logs**: Review chronological login activities and API invocations.
  - **Broadcast Announcements**: Publish announcements visible to all visitors.

---

## 2. Farmer (Vendor) Accounts

### Account 1 — Green Acres Organic Produce (Flagship Farmer)
- **Email**: `farmer1@marketlink.com`
- **Password**: `password123`
- **Role**: `Farmer`
- **Stall Name**: Green Acres Organic Produce
- **Dashboard URL**: `http://localhost:5173/dashboard/farmer`
- **Capabilities & Features**:
  - **Quick Pickup Verification**: Scan QR code or enter 6-character pickup verification code (e.g., `ML-XXXXXX`) or order ID directly at the top of the dashboard.
  - **Manage Pre-Orders**: Real-time orders with customer contact, queue position, pickup date/slot, and status progression buttons (**Accept** → **Mark Ready for Pickup** → **Confirm Pickup**).
  - **Automated Order Ready Email**: Clicking **"Mark Ready for Pickup"** automatically triggers an email to the customer with stall location and pickup verification instructions!
  - **Weekly Stock & Quick Adjust**: ±5 unit steppers for rapid inventory adjustment during busy market days, plus **Apply Weekly Harvest Template** (auto-sets all items to fresh 25 units).
  - **AI Demand Forecast & Waste Reduction**: Predictive AI recommendations based on seasonal weather and historical market demand.
  - **Customer Reviews**: View customer ratings and verified-purchase feedback badges.
  - **Stall & Schedule Settings**: Update stall name, pickup time slots, phone, latitude/longitude, and stall bio.

### Account 2 — Sun Valley Dairy & Berries
- **Email**: `farmer2@marketlink.com`
- **Password**: `password123`
- **Role**: `Farmer`

### Account 3 — Heritage Bakery & Poultry
- **Email**: `farmer3@marketlink.com`
- **Password**: `password123`
- **Role**: `Farmer`

---

## 3. Customer Accounts

### Account 1 — Sarah Johnson (Primary Customer)
- **Email**: `customer1@marketlink.com`
- **Password**: `password123`
- **Role**: `Customer`
- **Dashboard URL**: `http://localhost:5173/dashboard/customer`
- **Capabilities & Features**:
  - **My Pre-Orders Tab**:
    - Real-time 4-step progress stepper: *Placed* ➔ *Accepted* ➔ *Ready for Pickup* ➔ *Completed*.
    - High-visibility **Pickup Verification Code** (e.g., `ML-IRZ933`) and live queue position.
    - **Show QR Code**: Renders SVG QR code for contact-free stall scanning.
    - **Modify Order**: Edit pickup time slot and notes before pickup.
    - **1-Click Reorder**: Instantly re-adds all order items to cart with updated stock verification.
    - **Cancel Order**: Self-service pre-order cancellation.
    - **Leave Review**: Submit star rating and comment with automatic sentiment analysis.
  - **Recommendations Tab**: Fresh seasonal restock alerts and AI recommended produce.
  - **Profile & Contact Info**: Update delivery/pickup contact info, phone, and address.
  - **Security & Activity Logs**: Send and verify 6-digit OTP codes, view recent login activity logs (IP, browser, timestamp, status).

### Account 2 — Michael Brown
- **Email**: `customer2@marketlink.com`
- **Password**: `password123` (or reset via Forgot Password with OTP)
- **Role**: `Customer`

---

## 4. Complete Forgot Password with OTP Flow
1. Navigate to `/forgot-password`.
2. **Step 1**: Enter registered email (e.g. `customer1@marketlink.com`) and click **"Send Verification Code"**.
3. A 6-digit OTP is generated, saved securely for 10 minutes, and dispatched via Gmail SMTP!
4. **Step 2**: Enter the 6-digit OTP code (with an instant one-click auto-fill helper in testing mode), enter your **New Password**, confirm the password, and click **"Reset & Sign In"**.
5. The password is encrypted with bcrypt, the account verified, and you are automatically signed in to your dashboard!

---

## 5. Working Google Sign-In & Sign-Up
- Both `/login` and `/register` pages feature a **"Continue with Google"** button with the official 4-color Google G icon.
- **1-Click Instant Evaluation**: Click **"Continue with Google"** to select a verified Google account profile (or enter any Google email) to immediately authenticate, generate a JWT token, and access the Customer dashboard without getting blocked by Google Cloud setup.
- If `VITE_GOOGLE_CLIENT_ID` is set, it seamlessly loads the official Google Identity Services popup button.

---

## 6. Automated Order Lifecycle Email Notifications
1. **Order Placed**: Sent immediately to the customer when a pre-order is placed, containing the order items, prices, scheduled pickup date/time, stall name, and the unique pickup verification code (`ML-XXXXXX`).
2. **Order Ready**: Sent when the farmer marks the order as `ready_for_pickup`, notifying the customer that their produce has been packed and is ready at the stall.
3. **Order Completed / Picked Up**: Sent when the farmer verifies the customer's QR code or 6-digit code upon handover, thanking them for supporting local farmers and preventing food waste.

---

## 7. Full Responsiveness Across Devices
- **Mobile Phones (320px - 640px)**:
  - Slide-down mobile drawer with language switcher (EN / Urdu / Roman Urdu), direct dashboard links, favorites, and auth buttons.
  - Touch-friendly ±5 stock stepper buttons on farmer dashboard.
  - Responsive order cards with vertical stepper layout.
- **Tablets & Laptops (768px - 1440px+)**:
  - Flexible multi-column product grids (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
  - Full analytics charts and collapsible tables with horizontal scroll safeguards.

---

## 8. Greenie AI Assistant Capabilities
- Accessible via the floating leaf icon (`🌱`) on every page.
- **Languages Supported**: English, Roman Urdu (e.g., *"Mujhe Saturday ko 500 rupees ke andar vegetables chahiye jo 5 km ke andar hon"*), and Urdu Script.
- **Smart Queries**: Multi-criteria search (day + category + budget + distance), seasonality tips, and zero-waste harvest advice.

---

## 9. Live Market Activity Heatmap
- **URL**: `http://localhost:5173/market-heatmap`
- **Features**:
  - Interactive Leaflet map with colored density circles representing market traffic:
    - 🔴 **High Activity** (>60% volume)
    - 🟡 **Medium Activity** (30% - 60%)
    - 🟢 **Normal Activity** (<30%)
  - Bubble radius scales dynamically based on real customer pre-order volume.
  - Interactive market cards & popups showing live orders count, completed pickups, revenue, and operating schedule.

---

## 10. Price & Availability Comparison Engine
- **URL**: `http://localhost:5173/compare`
- **Features**:
  - Compare fresh produce prices across multiple stalls and markets in one single view.
  - Automatic **"BEST VALUE"** tag awarded to the lowest-priced in-stock produce.
  - Live available stock indicator (`X available`, `Out of Stock`).
  - Direct **"Add to Cart"** button from comparison results.

---

## 11. Real-Time In-App Notification Center
- **Location**: Bell icon (`🔔`) in the top navigation bar.
- **Features**:
  - Live unread notification counter badge (pulses with red pill).
  - Background polling every 15s + SSE `/api/notifications/stream` for real-time delivery.
  - Notifications triggered automatically on every order event:
    - 🌱 **Order Placed**: Sent when pre-order is submitted.
    - 👍 **Order Accepted**: Sent when farmer accepts order.
    - 🧺 **Order Ready**: Sent when harvest is packed for pickup.
    - ✅ **Order Completed**: Sent on QR scan / pickup code verification.
    - ❌ **Order Cancelled**: Sent when order is cancelled and inventory is restored.
  - One-click **"Mark all read"** and clickable notifications navigating directly to customer dashboard.

---

## 12. Dynamic Analytics & Charts (Admin & Farmer Dashboards)
- **Admin Dashboard (`/dashboard/admin` → Advanced Analytics & Reports)**:
  - 📈 **7-Day Revenue Trend** (`AreaChart` with emerald gradient)
  - 🥧 **Order Fulfillment Status Share** (`PieChart` with placed, accepted, ready, completed, cancelled breakdown)
  - 🌾 **Best-Selling Harvest Items** (`BarChart` by units sold)
  - 🏆 **Top Farmer Revenue Leaderboard** (`BarChart` by sales $)
  - 🏪 **Market Activity Distribution** (`BarChart` by order count)
  - 👥 **Customer Acquisition Growth** (`AreaChart` showing monthly signups)
- **Farmer Dashboard (`/dashboard/farmer` → My Analytics & Revenue)**:
  - 📈 **7-Day Daily Earnings Trend** (`AreaChart`)
  - 🥧 **Order Status Share** (`PieChart`)
  - 🥇 **Top-Selling Harvest Items** (`BarChart` by revenue)
  - 📦 **Stock Health & Reservation Breakdown** (`BarChart` showing available stock vs reserved pre-orders)

---

## 13. Scalability, Performance & Security Hardening
- **HTTP Compression**: Gzip compression active via `compression` middleware on all API responses.
- **Security Headers**: OWASP-aligned HTTP security headers implemented via `helmet`.
- **IP Rate Limiting**:
  - Global API limiter: 300 requests / 15 minutes per IP.
  - Authentication limiter: 15 login/signup attempts / 15 minutes per IP (`express-rate-limit`).
- **Frontend Code Splitting**: Vite Rollup `manualChunks` splits `recharts`, `leaflet`, `lucide-react`, and `react` into individual cached chunks, reducing application bundle size to <390 kB with zero build warnings.


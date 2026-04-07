# FuelSync | Next-Gen Fuel Infrastructure ⛽

FuelSync is a professional, real-time fuel management and queue optimization platform designed for the modern driver and fuel station owner. It solves the critical problem of fuel uncertainty and long wait times by providing a live, data-driven ecosystem.

## 🌟 Purpose

The core mission of FuelSync is to eliminate wasted time and fuel by connecting drivers with real-time station data. It transforms the traditional "drive and hope" approach into a predictable, digital experience.

---

## 🖥️ Dashboards

### 🚗 Driver Dashboard

Designed for agility and quick decision-making.

- **Real-time Map**: Visual markers for all nearby stations using OpenStreetMap.
- **Live Inventory**: Instantly see if a station has Petrol or Diesel in stock.
- **Smart Checkout**: Select the exact amount of fuel needed, calculate prices automatically, and pay via Telebirr, CBE Birr, or Cash.
- **Digital Ticketing**: Receive a unique ticket ID and receipt immediately after purchase to show at the station.
- **History Management**: Keep track of all previous fuel fulfillments and statuses, with the option to remove old records from history.

### ⛽ Station Dashboard (Console)

A powerful management suite for station owners.

- **Inventory Management**: Real-time control over fuel quantities (Litres) and prices (ETB).
- **Live Status Toggle**: Instantly update the public status of Petrol/Diesel pumps.
- **Queue Management**: Monitor and manage incoming driver requests in real-time.
- **Automatic Sync**: Stock levels automatically decrease when a driver completes a checkout, ensuring perfect inventory consistency.
- **Live Insights**: Quick stats on daily approvals, pending requests, and rejections.

---

## 🚀 Registration, Login, and Dashboard Access

### 1. Registration

1. Visit [http://localhost:3000](http://localhost:3000) and open `/auth/register`.
2. Submit `name`, `email`, and password.
3. Password must include:

   - 8+ characters
   - uppercase
   - lowercase
   - number
   - symbol

4. New users are created as `DRIVER` by default.
5. Optional bootstrap admins can be set with:

   - `ADMIN_BOOTSTRAP_EMAILS=admin1@x.com,admin2@x.com`

### 2. Verification

1. Registration sends an email verification token.
2. User must click the verification link (`/api/auth/verify?token=...`).
3. Login is blocked until `isVerified = true`.

### 3. Login

1. Use `/auth/login` (email/password) or Google login.
2. On success, JWT is stored in `token` cookie.
3. App resolves user identity from `/api/auth/me` and routes to dashboards.

### 4. Access Matrix (Role + Ownership)

- **Driver**
  - Default: `DriverDashboard`
  - If user owns station(s): can open `StationDashboard` using `?view=station`
- **Station**
  - Default: `StationDashboard`
  - Can switch to Driver view using `?view=driver`
- **Admin**
  - Default: `AdminDashboard`
  - Can open Driver view (`?view=driver`)
  - If admin owns station(s): can open Station view (`?view=station`)

### 5. Becoming a Station Owner

- Register a station from the station registration flow.
- System creates a station with `ownerUserId = user.id`.
- Ownership-based access is used by station APIs.
- Station actions (inventory, station requests, analytics, price history) are authorized by ownership.

### 6. Driver Order Flow

1. Driver opens station list/map.
2. Initiates payment and creates fuel request.
3. After station approval/completion, request status and finance entries update.
4. Driver can download a receipt from Fuel Logs.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (Turbopack)
- **Database**: MongoDB with Mongoose
- **Mapping**: Leaflet & OpenStreetMap
- **Styling**: Tailwind CSS
- **Authentication**: JWT & Cookies
- **Real-time**: Background Polling & SSE Support

---

*FuelSync - Keeping you moving.* 🚀

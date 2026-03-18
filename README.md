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

## 🚀 Steps to Use

### 1. Registration & Setup
1.  **Visit the App**: Navigate to [http://localhost:3000](http://localhost:3000).
2.  **Sign Up**: Go to the [register](file:///c:/fuel-tracker/src/app/auth/register/page.tsx) page.
3.  **Choose Your Role**: 
    - **Driver**: For those looking for fuel.
    - **Station Owner**: For those managing a fuel station (requires entering Station Name and Location).
4.  **Automatic Geocoding**: For stations, our system automatically converts your address into map coordinates.

### 2. For Station Owners (Updating Stock)
1.  Log in to your **Station Console**.
2.  Go to **Inventory Management**.
3.  Enter your current fuel quantities in Litres and set your prices.
4.  Click **"Update Live Status"** to broadcast your stock to all drivers.

### 3. For Drivers (Ordering Fuel)
1.  Log in to your **Driver Dashboard**.
2.  Browse the list or the map to find a station with available stock.
3.  Click **"Request Petrol"** or **"Request Diesel"**.
4.  Enter the amount of litres you need and choose a payment method.
5.  **Pay & Get Ticket**: Once confirmed, your digital ticket will appear.

### 4. Fulfillment
1.  Drive to the station.
2.  Show your **Digital Ticket** (found in your Request History) to the station attendant.
3.  The attendant verifies the ticket ID and fills your tank!

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

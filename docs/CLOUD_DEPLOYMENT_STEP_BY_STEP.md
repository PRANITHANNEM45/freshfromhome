# 🚀 24/7 Autonomous Cloud Deployment Guide (Zero Laptop Dependency)

This guide walks you through deploying **FreshFromFarm (freshfromhome)** to cloud hosting infrastructure in **under 5 minutes**. Once deployed, your website, backend API, database, and UPI checkout run **24 hours a day, 7 days a week, 365 days a year**, completely independent of your computer.

---

## 🏗️ Architecture Overview

```
[Customer on Phone / PC]
         ↓ HTTPS (SSL)
   [Vercel Cloud Edge]  -----> Hosts Next.js Frontend (100% Free, Global CDN, 24/7)
         ↓ API Requests (HTTPS)
  [Render.com Cloud Service] -> Hosts Express API Backend (100% Free, Auto-restart, 24/7)
         ↓ Database
  [Managed Cloud DB / Volume] -> Stores Products, Orders, Admin & Staff Credentials
```

---

## Step 1: Deploy Backend to Render.com (2 Minutes)

1. Open [https://dashboard.render.com](https://dashboard.render.com) and log in with your GitHub account (**PRANITHANNEM08** or **PRANITHANNEM45**).
2. Click **New +** (top right) ➔ Select **Web Service**.
3. Choose **"Build and deploy from a Git repository"** ➔ Click **Next**.
4. Select your repository: **`freshfromhome`** (or paste `https://github.com/PRANITHANNEM45/freshfromhome`).
5. Fill in the deployment settings:
   - **Name**: `freshfromhome-backend`
   - **Region**: Singapore or Frankfurt (choose nearest)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Instance Type**: **Free** ($0/month)
6. Under **Environment Variables**, click **Add Environment Variable**:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `freshfromfarm_super_secure_jwt_secret_2026`
   - `MERCHANT_UPI_ID`: `annemnagapranitheswarreddy45-2@okicici`
   - `MERCHANT_PAYEE_NAME`: `ANNEM NAGA PRANITHESWARREDDY`
7. Click **Create Web Service**.
8. In ~60 seconds, Render will display: **`Your service is live 🎉`** with a public URL:  
   👉 `https://freshfromhome-backend.onrender.com` (Copy this URL!)

---

## Step 2: Deploy Frontend to Vercel (2 Minutes)

1. Open [https://vercel.com/new](https://vercel.com/new) and log in with your GitHub account.
2. Under **"Import Git Repository"**, search for and select **`freshfromhome`**.
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click *Edit* ➔ Select **`frontend`** ➔ Click *Continue*.
   - **Project Name**: `freshfromfarm` (or your preferred name)
4. Expand **Environment Variables** and add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://freshfromhome-backend.onrender.com` *(The Render URL from Step 1)*
5. Click **Deploy**.
6. Within 60 seconds, Vercel will show confetti: **`Congratulations! Your project is deployed.`**
7. Vercel provides your permanent live production URL:  
   👉 **`https://freshfromfarm.vercel.app`** (or `https://freshfromhome.vercel.app`)

---

## Step 3: Link Your Custom Domain (Optional)

If you own a custom domain (e.g. `freshfromfarm.in` or `freshfromhome.com`) through Cloudflare, GoDaddy, or Namecheap:

1. In Vercel Project Dashboard ➔ Go to **Settings** ➔ **Domains**.
2. Type your domain (e.g., `www.freshfromfarm.in`).
3. In your Cloudflare DNS or domain registrar dashboard:
   - Add a `CNAME` record pointing `www` to `cname.vercel-dns.com`.
4. Vercel automatically issues an official 256-bit SSL Certificate and keeps your domain running 24/7.

---

## 🧪 Step 4: The 24/7 "Laptop Off" Verification Test

Once deployed:

1. Open your live Vercel URL on your mobile phone (disconnect from home Wi-Fi and use mobile 4G/5G data).
2. **Close your laptop completely** (or shut it down).
3. On your phone:
   - Browse products (Milk, Ghee, Paneer, Vegetables).
   - Add items to the cart.
   - Go to checkout and test the automated UPI flow.
   - Log in as Master Admin (`pranith` / `pranith123`) at `/login?type=staff`.
4. Notice that everything works instantly with zero latency—even while your laptop is completely powered off!

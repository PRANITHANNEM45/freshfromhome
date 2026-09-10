# 🌐 Complete Publishing & Free Hosting Guide

This guide explains how to host and publish **FreshFromFarm (freshfromhome)** for free across all browsers and devices.

---

## 1. Instant Free Live URL (Cloudflare Quick Tunnel)
If you want an immediate live HTTPS link to test on any mobile device or share with customers:

```bash
# 1. Start Backend in one terminal
cd backend
npm run dev

# 2. Start Frontend in a second terminal
cd frontend
npm run dev

# 3. Start Cloudflare Tunnel
.\cloudflared.exe tunnel --url http://localhost:3000
```
- Cloudflare will output an HTTPS URL like `https://xxxx.trycloudflare.com`.
- Open that link on any smartphone, tablet, or browser worldwide.

---

## 2. Permanent 24/7 Free Cloud Hosting (Vercel)
Vercel provides permanent, 100% free hosting with automatic deployments on every git push.

1. Go to [https://vercel.com/new](https://vercel.com/new) and log in with GitHub (`PRANITHANNEM08`).
2. Select your repository: **freshfromhome**.
3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Project Name**: `freshfromfarm`
4. Add Environment Variables (Optional):
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g., on Render).
5. Click **Deploy**.

> **Result**: You will get a permanent, live URL like `https://freshfromfarm.vercel.app` with zero hosting costs and free global SSL.

---

## 3. Permanent Backend Hosting (Render.com)
Render provides free Node.js Web Services:

1. Go to [https://dashboard.render.com](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository **freshfromhome**.
4. Configure settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/server.js`
   - **Environment Variables**:
     - `PORT`: `5000`
     - `JWT_SECRET`: `your_super_secret_jwt_key`
     - `MERCHANT_UPI_ID`: `annemnagapranitheswarreddy45-2@okicici`
     - `MERCHANT_PAYEE_NAME`: `ANNEM NAGA PRANITHESWARREDDY`
5. Click **Create Web Service**.

---

## 4. Custom Domain Linking (e.g., www.freshfromfarm.in)
1. Purchase a domain from GoDaddy, Namecheap, or Hostinger (approx ₹399/year).
2. In Vercel Project Settings -> **Domains**:
   - Add `www.freshfromfarm.in`
   - Add the CNAME record in your domain registrar's DNS settings.
3. Your custom brand domain is live with automatic free SSL renewal!

# MarketLink Live Deployment & Database Guide
**Hosting**: Vercel (All-In-One) / Render / Railway  
**Database**: Embedded Serverless DB / MongoDB Atlas / Vercel Postgres / Supabase

---

## 🗄️ Database Live Setup Options

Currently, MarketLink features a **zero-config embedded database engine** pre-seeded with rich test data (markets, organic products, pre-orders, reviews, admin accounts).

Jab aap live deploy karte hain, aap ke paas Database ke **3 Sab Se Behtareen Options** hain:

---

### Option 1: Zero-Config Vercel Serverless Storage (Default — No Extra Setup Needed!)
Humne `backend/src/config/db.js` mein serverless memory & `/tmp` persistence adapter enable kar diya ha.
- **Fayda**: Aap ko koi external database setup nahi karna pare ga!
- Vercel par deploy hote hi test data, markets, products, orders, aur credentials immediately kaam karein ge!

---

### Option 2: MongoDB Atlas (Free 512MB Cloud Database — Most Popular)
Agar aap chahte hain ke customer pre-orders aur new farmer registrations permanently cloud par save rahein:
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) -> Create Free Cluster.
2. Database Access -> Create Username & Password.
3. Network Access -> Allow IP `0.0.0.0/0` (Anywhere).
4. Connection String copy karein (`mongodb+srv://user:pass@cluster.mongodb.net/marketlink`).
5. Vercel Dashboard -> Project Settings -> **Environment Variables**:
   - Key: `MONGODB_URI`
   - Value: `<your-mongodb-connection-string>`

---

### Option 3: Vercel Built-In Postgres Database (1-Click Vercel Storage)
Vercel ke dashboard ke andar 1-click SQL database setup:
1. Vercel Dashboard -> Open MarketLink Project -> **Storage** tab.
2. Select **Vercel Postgres** -> Click **Create**.
3. Project root mein maujood `schema.sql` file ko Query tab mein paste karke **Run** kar dein!

---

## ⚡ Quick Vercel Deployment Commands

```bash
# 1. Global Vercel CLI install karein
npm install -g vercel

# 2. MarketLink directory se deploy karein
vercel
```
*Prompt mein `Y` press karein. Aap ka Live URL milliseconds mein tayyar ho jaye ga!*

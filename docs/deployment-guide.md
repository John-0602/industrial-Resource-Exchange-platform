# Independent Cloud Deployment Guide
## Industrial Resource Exchange Platform (IREP)

This guide provides step-by-step instructions to deploy all three components independently on cloud platforms:
1. **Frontend**: Vercel (React Vite Single Page App)
2. **Resource Catalog Service**: Render (Independent Node.js Web Service)
3. **Exchange & Matching Service**: Render (Independent Node.js Web Service)
4. **Database Layer**: MongoDB Atlas (with separate database isolation: `irep_resources_db` & `irep_exchanges_db`)

---

## 1. MongoDB Atlas Configuration (Database Isolation)

1. Log in to [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create or navigate to your shared cluster (e.g. `M0 Free Tier`).
3. Under **Security > Database Access**:
   - Create a dedicated database user (e.g. `irep_admin`) with a secure password.
4. Under **Security > Network Access**:
   - Add IP Access: `0.0.0.0/0` (Allow access from anywhere, required for cloud services like Render).
5. Obtain the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Compulsory Database Isolation**:
   - For **Resource Catalog Service**, append:
     `mongodb+srv://<username>:<password>@cluster0.mongodb.net/irep_resources_db?retryWrites=true&w=majority`
   - For **Exchange & Matching Service**, append:
     `mongodb+srv://<username>:<password>@cluster0.mongodb.net/irep_exchanges_db?retryWrites=true&w=majority`

---

## 2. Deploying Resource Catalog Service on Render

1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click **New + > Web Service**.
3. Connect your GitHub repository.
4. Configure service parameters:
   - **Name**: `irep-resource-service`
   - **Region**: Singapore or Frankfurt
   - **Root Directory**: `resource-service`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
5. Configure Production Environment Variables in Render:
   | Key | Value Example | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Port assigned by Render |
   | `MONGODB_URI` | `mongodb+srv://.../irep_resources_db` | Isolated Resource database |
   | `JWT_SECRET` | `generate-random-secure-64-character-string` | Signing key for enterprise tokens |
   | `SERVICE_API_KEY` | `internal_shared_microservice_secret_token_college_2025` | Inter-service REST key |
   | `CLIENT_ORIGIN` | `https://your-irep-frontend.vercel.app` | Vercel production frontend domain |
6. Click **Deploy Web Service**.
7. Once deployed, verify health:
   `https://irep-resource-service-xxxx.onrender.com/health` (should return `{"status":"OK"}`).

---

## 3. Deploying Exchange & Matching Service on Render

1. On the Render Dashboard, click **New + > Web Service**.
2. Connect the same repository.
3. Configure service parameters:
   - **Name**: `irep-exchange-service`
   - **Region**: Same region as Resource Service for low inter-service latency
   - **Root Directory**: `exchange-service`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. Configure Production Environment Variables in Render:
   | Key | Value Example | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Port assigned by Render |
   | `MONGODB_URI` | `mongodb+srv://.../irep_exchanges_db` | Isolated Exchange database |
   | `JWT_SECRET` | *(Must match Resource Service JWT_SECRET)* | Validates company JWTs |
   | `RESOURCE_SERVICE_URL` | `https://irep-resource-service-xxxx.onrender.com` | **Public URL of deployed Resource Service** |
   | `SERVICE_API_KEY` | *(Must match Resource Service SERVICE_API_KEY)* | Inter-service REST key |
   | `CLIENT_ORIGIN` | `https://your-irep-frontend.vercel.app` | Vercel production frontend domain |
5. Click **Deploy Web Service**.
6. Verify deployment by checking:
   `https://irep-exchange-service-xxxx.onrender.com/health`

---

## 4. Deploying React Frontend on Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New... > Project** and import the GitHub repository.
3. In Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_RESOURCE_SERVICE_URL` | `https://irep-resource-service-xxxx.onrender.com` | Resource Service API URL |
   | `VITE_EXCHANGE_SERVICE_URL` | `https://irep-exchange-service-xxxx.onrender.com` | Exchange Service API URL |
5. Click **Deploy**.
6. Copy your production Vercel domain (e.g. `https://irep-marketplace.vercel.app`) and ensure `CLIENT_ORIGIN` in both Render services is updated to allow CORS requests.

---

## 5. End-to-End Deployed Workflow Verification

1. **Catalog Exploration**:
   - Access the deployed Vercel frontend URL.
   - Navigate to `/marketplace` and verify live surplus listings load from the deployed Resource Service.
2. **Post Procurement Requirement**:
   - Log in using a demo enterprise or register a new facility.
   - Post a material requirement in `/requirements/new`.
3. **Circular Matching over REST**:
   - Open `/matching` to trigger the circular matching engine.
   - Observe in Render logs that `irep-exchange-service` executes:
     `[Exchange Service -> Resource Service] OUTBOUND REST GET: https://irep-resource-service-xxxx.onrender.com/api/resources/matches`
4. **Submit Proposal & Reserve Stock**:
   - Submit a proposal for a matching candidate listing.
   - Log in as the supplier enterprise on another browser window/incognito.
   - Click "Accept & Reserve Stock".
   - Confirm via Render logs:
     `[Exchange Service -> Resource Service] OUTBOUND REST PATCH: .../api/resources/:id/reserve with action="reserve"`
   - Verify unreserved stock decrements appropriately without overselling.
5. **Transfer & Delivery**:
   - Dispatch freight and update status to "In Transfer".
   - Confirm delivery to finalize status to "Completed".

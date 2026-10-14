# Independent Cloud Deployment Guide
## Resource Exchange Platform (Microservices Architecture)

This guide provides step-by-step instructions to deploy all three components independently on cloud platforms:
1. **Frontend**: Vercel (React Single Page App)
2. **Resource Service**: Render (Independent Node.js Web Service)
3. **Exchange Service**: Render (Independent Node.js Web Service)
4. **Database**: MongoDB Atlas (Isolated Databases)

---

## 1. MongoDB Atlas Configuration

1. Log in to [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a free shared cluster (e.g. `M0 Free Tier`).
3. Under **Security > Database Access**:
   - Create a database user (e.g. `platform_admin`) with password.
4. Under **Security > Network Access**:
   - Add IP Access: `0.0.0.0/0` (Allow access from anywhere, required for cloud services like Render).
5. Obtain the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Compulsory Database Isolation**:
   - For **Resource Service**, append database name:
     `mongodb+srv://<username>:<password>@cluster0.mongodb.net/resource_exchange_resources?retryWrites=true&w=majority`
   - For **Exchange Service**, append separate database name:
     `mongodb+srv://<username>:<password>@cluster0.mongodb.net/resource_exchange_exchanges?retryWrites=true&w=majority`

---

## 2. Deploying Resource Service on Render

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New + > Web Service**.
3. Connect your GitHub repository.
4. Configure service parameters:
   - **Name**: `resource-service`
   - **Region**: Oregon (US West) or Singapore / Frankfurt
   - **Root Directory**: `resource-service`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
5. Configure Environment Variables in Render:
   | Key | Value Example | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Port provided by Render |
   | `MONGODB_URI` | `mongodb+srv://.../resource_exchange_resources` | Isolated Resources DB |
   | `JWT_SECRET` | `generate-random-secure-string-64-chars` | Signing key for student JWT |
   | `SERVICE_API_KEY` | `shared-microservice-token-secret-2025` | Shared token for inter-service calls |
   | `CLIENT_ORIGIN` | `https://your-frontend.vercel.app` | Vercel production frontend domain |
6. Click **Deploy Web Service**.
7. Once deployed, test the public health endpoint:
   `https://resource-service-xxxx.onrender.com/health` (should return `{"status":"OK"}`).

---

## 3. Deploying Exchange Service on Render

1. On the Render Dashboard, click **New + > Web Service**.
2. Connect the same repository.
3. Configure service parameters:
   - **Name**: `exchange-service`
   - **Root Directory**: `exchange-service`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. Configure Environment Variables in Render:
   | Key | Value Example | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Port provided by Render |
   | `MONGODB_URI` | `mongodb+srv://.../resource_exchange_exchanges` | Isolated Exchanges DB |
   | `JWT_SECRET` | *(Must match Resource Service `JWT_SECRET`)* | Validates student tokens |
   | `RESOURCE_SERVICE_URL` | `https://resource-service-xxxx.onrender.com` | **Public URL of deployed Resource Service** |
   | `SERVICE_API_KEY` | *(Must match Resource Service `SERVICE_API_KEY`)* | Authenticates inter-service REST calls |
   | `CLIENT_ORIGIN` | `https://your-frontend.vercel.app` | Vercel production frontend domain |
5. Click **Deploy Web Service**.
6. Verify deployment by checking:
   `https://exchange-service-xxxx.onrender.com/health`

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
   | Variable | Value |
   | :--- | :--- |
   | `VITE_RESOURCE_SERVICE_URL` | `https://resource-service-xxxx.onrender.com` |
   | `VITE_EXCHANGE_SERVICE_URL` | `https://exchange-service-xxxx.onrender.com` |
5. Click **Deploy**.
6. Vercel will build the frontend assets using `vercel.json` (routing rewrites for React Router).
7. Copy your production Vercel domain (e.g. `https://resource-exchange.vercel.app`) and update the `CLIENT_ORIGIN` in both Render services so CORS allows requests.

---

## 5. End-to-End Verification Checklist

- [ ] `GET https://resource-service-xxxx.onrender.com/health` returns `200 OK`.
- [ ] `GET https://exchange-service-xxxx.onrender.com/health` returns `200 OK`.
- [ ] Visit Vercel frontend URL, test registration or 1-click demo login.
- [ ] Browse marketplace items fetched from deployed Resource Service.
- [ ] Submit an exchange request:
  - Check Render logs on `exchange-service` to observe:
    `[Exchange Service -> Resource Service] OUTBOUND REST GET: https://.../api/resources/:id`
- [ ] Log in as owner, approve request:
  - Check Render logs to observe:
    `[Exchange Service -> Resource Service] OUTBOUND REST PATCH: https://.../api/resources/:id/availability with status="reserved"`
- [ ] Observe item status update to "Reserved" on both services.

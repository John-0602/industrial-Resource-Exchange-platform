# Academic Project Report
## Industrial Resource Exchange Platform (IREP)
**Platform Name**: Industrial Resource Exchange Platform (IREP)  
**Architecture Style**: Decoupled Microservices Architecture with Isolated Databases  
**Technology Stack**: MERN (MongoDB Atlas, Express.js, React.js with Vite, Node.js) + Tailwind CSS  

---

### 1. Problem Statement

Across manufacturing ecosystems, large volumes of industrial by-products, production scraps, surplus polymers, and recoverable materials are routinely treated as waste—resulting in heavy landfill tipping fees, regulatory disposal liabilities, and substantial greenhouse gas emissions. Simultaneously, downstream manufacturers (such as recyclers, remanufacturers, and composite material producers) expend vast capital and natural resources extracting or purchasing expensive virgin raw materials.

Traditional commercial avenues lack a specialized B2B industrial exchange mechanism that accommodates:
1. Technical specifications, chemical compositions, and polymer grades.
2. Large volume tracking (tonnes, kg, drums, pallets) with variable stock availability.
3. Environmental compliance manifests (State Pollution Control Board certifications, MSDS documentation).
4. Multi-criteria circular matching to connect supplier waste streams with receiver input requirements.

---

### 2. Project Objectives

1. **Digital Intermediary for Circular Symbiosis**: Build an industrial marketplace that connects manufacturing plants generating surplus materials with secondary manufacturers requiring those inputs.
2. **Decoupled Microservices Architecture**: Implement two completely autonomous Node.js/Express backend applications:
   - `resource-service` (Port 5001): Industrial catalog management, company profiles, and quantity tracking.
   - `exchange-service` (Port 5002): Procurement requirements, circular matching engine, and B2B proposals.
3. **Database Isolation**: Ensure zero collection sharing by deploying separate MongoDB databases (`irep_resources_db` and `irep_exchanges_db`).
4. **Authentic Inter-Service REST Communication**: Execute server-to-server HTTP REST calls protected by `x-service-api-key` for cross-service inventory queries and atomic reservations.
5. **Multi-Criteria Circular Matching Engine**: Implement a multi-dimensional algorithm calculating compatibility scores (0–100%) across category, quantity, condition, location proximity, and price alignment.
6. **Atomic Quantity Reservation Guard**: Implement concurrent reservation logic to prevent overselling available industrial materials.
7. **Professional Industrial UI & Governance**: Develop a comprehensive React single-page application adhering to an industrial navy/slate/teal design system across 17 distinct pages.

---

### 3. Technologies Utilized

- **Frontend Client**: React 19, Vite 6, Tailwind CSS 3.4, Lucide React Icons, React Router v7, Axios.
- **Microservice A (`resource-service`)**: Node.js, Express.js, Mongoose ODM, JWT, Bcrypt.js, Helmet, Morgan, Express Rate Limit.
- **Microservice B (`exchange-service`)**: Node.js, Express.js, Mongoose ODM, Axios (Inter-Service REST client), Helmet, Morgan, Express Rate Limit.
- **Databases**: MongoDB Atlas with database isolation (plus local fallback with in-memory Mongo server for evaluation).
- **Testing & Tooling**: Jest, Supertest, Postman Collection & Environment, Vite Bundler.
- **Deployment**: Vercel (Frontend), Render (Independent Microservices), Git/GitHub (Version Control).

---

### 4. System Architecture & Inter-Service REST Protocol

#### 4.1 Independent Services
- **Resource Service (`resource-service`, Port 5001)**: Owns corporate company authentication, regulatory verification status (`Pending`, `Verified`, `Rejected`), and the 10 industrial material categories.
- **Exchange Service (`exchange-service`, Port 5002)**: Owns procurement requirements, cross-service matching, price negotiation threads, and consignment freight tracking.

#### 4.2 Server-to-Server REST Workflows
1. **Circular Matching Query**: When an enterprise views matching candidates for a requirement, the Exchange Service calls:
   `GET /api/resources/matches` on the Resource Service over HTTP REST.
2. **Proposal Pre-Validation**: When a buyer submits a proposal, the Exchange Service calls:
   `GET /api/resources/:id` to confirm that `requestedQuantity <= availableQuantity`.
3. **Atomic Stock Reservation**: When a supplier accepts a proposal, the Exchange Service calls:
   `PATCH /api/resources/:id/reserve` with `{ quantity, action: 'reserve' }`, atomically locking stock.
4. **Permanent Inventory Deduction**: Upon verified delivery completion, the Exchange Service calls:
   `PATCH /api/resources/:id/reserve` with `{ quantity, action: 'complete' }`.

---

### 5. Implementation Highlights

1. **10 Industrial Material Categories**: Textile & fabric waste, Metal scraps, Plastic waste & reusable polymers, Paper & cardboard, Wood scraps & sawdust, Agricultural by-products, Construction & demolition materials, Reusable industrial packaging, Surplus raw materials, and Other recoverable by-products.
2. **Dual View Marketplace**: Grid card catalog (`ResourceCard.jsx`) and dense industrial registry table (`MaterialTable.jsx`).
3. **Multi-Factor Matching Engine**: Evaluates 5 dimensions: Category & Keywords (35%), Quantity (25%), Condition (15%), Proximity (15%), and Price (10%).
4. **Honest Corporate Verification**: Newly registered enterprises default to `Pending` until platform administrators inspect business registration references (GSTIN/CIN).
5. **1-Click Evaluator Accounts**: Includes 5 realistic enterprise profiles (Apex Textiles, Kalyani Forge, GreenLeaf Polymers, Sahyadri Eco-Board, and IREP Admin) with 1-click credential filling.

---

### 6. Testing & Results

- **Automated Test Suites**: 13 automated integration tests across both microservices (7 in `resource-service`, 6 in `exchange-service`).
- **Pass Rate**: 100% (13/13 passed).
- **Concurrency & Anti-Overselling**: Validated that concurrent reservation requests exceeding available stock return `409 Conflict`.
- **Frontend Production Build**: Successfully compiled with Vite in 7.75s with zero syntax or bundle errors.

---

### 7. Business Value & Environmental Impact

1. **Landfill Diversion**: Diverts metric tons of industrial by-products directly into secondary production cycles.
2. **Cost Reduction**: Suppliers eliminate hazardous disposal and tipping fees; buyers obtain quality inputs at substantial discounts compared to virgin market rates.
3. **Scope 3 Carbon Abatement**: Quantifiable carbon reduction through avoided virgin resource extraction and reduced transport distances via regional proximity matching.

---

### 8. Limitations & Future Enhancements

1. **Distributed Transaction Resilience**: While atomic quantity reservation prevents overselling, network partitions during cross-service updates utilize idempotent reservation IDs and retries rather than full distributed Two-Phase Commit (2PC).
2. **IoT Weighbridge & Smart Sensor Integration**: Future iterations can interface with industrial weighbridges at facility gates to automatically confirm intake weights and trigger real-time stock deduction.
3. **Blockchain Circular Traceability**: Implement immutable ledger manifests (e.g. Hyperledger Fabric) to track hazardous waste custody chains and automate environmental compliance reporting for state pollution control boards.

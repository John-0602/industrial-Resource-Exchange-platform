# Industrial Resource Exchange Platform (IREP)
## Complete REST API Documentation

This document provides complete endpoint specifications, authentication rules, sample JSON payloads, and response structures for both independent microservices.

---

## 1. Microservice A: Resource Catalog Service
- **Default Port**: `5001`
- **Base URL**: `http://localhost:5001`
- **Database**: `irep_resources_db`

### 1.1 Corporate Authentication & Administration

#### `POST /api/auth/register`
Registers a new industrial enterprise. The company is initially created with `verificationStatus: 'Pending'`.
- **Request Body**:
```json
{
  "companyName": "Apex Industrial Textiles Ltd",
  "registrationNumber": "33AAAAA0000A1Z5",
  "industrySector": "Textiles & Apparel Manufacturing",
  "contactPerson": "S. Karthikeyan",
  "email": "karthik@apextextiles.com",
  "phone": "+91 98450 12345",
  "address": "Plot 42, SIDCO Industrial Estate",
  "city": "Coimbatore",
  "state": "Tamil Nadu",
  "country": "India",
  "description": "Integrated spinning and weaving mill.",
  "password": "Password@123"
}
```
- **Response `(201 Created)`**:
```json
{
  "success": true,
  "message": "Company registered successfully. Account is pending verification review.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "6734a1b2c3d4e5f6a7b8c9d0",
      "companyName": "Apex Industrial Textiles Ltd",
      "email": "karthik@apextextiles.com",
      "verificationStatus": "Pending",
      "role": "company"
    }
  }
}
```

#### `POST /api/auth/login`
Authenticates an enterprise or administrator and returns a signed JWT token.
- **Request Body**:
```json
{
  "email": "karthik@apextextiles.com",
  "password": "Password@123"
}
```
- **Response `(200 OK)`**: Returns JWT token and company payload.

#### `GET /api/auth/admin/companies`
*(Admin Only)* Lists all registered companies with their current verification status.
- **Headers**: `Authorization: Bearer <ADMIN_JWT>`
- **Response `(200 OK)`**: Array of company registration objects.

#### `PATCH /api/auth/admin/companies/:id/verify`
*(Admin Only)* Reviews and updates an enterprise's verification status.
- **Headers**: `Authorization: Bearer <ADMIN_JWT>`
- **Request Body**:
```json
{
  "verificationStatus": "Verified"
}
```

---

### 1.2 Industrial Resource Catalog CRUD

#### `POST /api/resources`
Creates a new surplus, scrap, or industrial by-product listing.
- **Headers**: `Authorization: Bearer <JWT>`
- **Request Body**:
```json
{
  "title": "100% Cotton Comber Noil Scraps",
  "category": "Textile and fabric waste",
  "resourceType": "By-product",
  "description": "Short staple virgin cotton fiber extracted during combing process.",
  "totalQuantity": 15000,
  "availableQuantity": 15000,
  "unit": "kg",
  "materialCondition": "Production Scrap",
  "composition": "100% Raw Cotton Cellulose",
  "intendedUse": "Acoustic insulation, paper pulp, absorbent cotton",
  "pricePerUnit": 28,
  "currency": "INR",
  "minOrderQuantity": 500,
  "pickupLocation": {
    "address": "Plot 42, SIDCO Industrial Estate",
    "city": "Coimbatore",
    "state": "Tamil Nadu",
    "country": "India",
    "loadingEquipmentAvailable": true
  },
  "safetyHandling": "Keep in covered dry shed. Non-combustible packaging.",
  "compliance": {
    "hazardousMaterial": false,
    "pcbCategory": "Green (Non-hazardous residue)",
    "msdsUrl": "https://example.com/msds-cotton.pdf"
  }
}
```
- **Response `(201 Created)`**: Returns full resource document.

#### `GET /api/resources`
Lists resources with multi-attribute filtering, sorting, and pagination.
- **Query Parameters**:
  - `page`: default `1`
  - `limit`: default `12`
  - `category`: e.g. `Metal scraps`
  - `resourceType`: e.g. `By-product`
  - `condition`: e.g. `Production Scrap`
  - `availability`: e.g. `available`
  - `sort`: `newest` | `oldest` | `quantity_desc` | `title_asc`

#### `GET /api/resources/search?q=:keyword`
Full-text search querying title, description, category, and composition.

#### `GET /api/resources/:id`
Retrieves detailed specifications of a specific material listing.

#### `PUT /api/resources/:id`
Updates material details, available quantity, or pricing (owner company only).

#### `DELETE /api/resources/:id`
Permanently removes a material listing (owner company or admin).

---

### 1.3 Inter-Service REST Endpoints (Guarded by `x-service-api-key`)

#### `GET /api/resources/matches`
Called by the Exchange Service during circular matching. Returns active unreserved candidate listings matching category and condition criteria.
- **Headers**: `x-service-api-key: <SERVICE_SECRET>`

#### `PATCH /api/resources/:id/reserve`
Atomic stock reservation endpoint used by the Exchange Service to lock or release inventory.
- **Headers**: `x-service-api-key: <SERVICE_SECRET>`
- **Request Body**:
```json
{
  "quantity": 500,
  "action": "reserve"
}
```
*Actions Supported*:
- `'reserve'`: Atomically decrements `availableQuantity` and increments `reservedQuantity`. Returns `409 Conflict` if available stock is insufficient.
- `'release'`: Restores `availableQuantity` and decrements `reservedQuantity` upon proposal cancellation.
- `'complete'`: Permanently decrements `reservedQuantity` and `totalQuantity` upon finalized delivery.

---

## 2. Microservice B: Exchange & Matching Service
- **Default Port**: `5002`
- **Base URL**: `http://localhost:5002`
- **Database**: `irep_exchanges_db`

### 2.1 Material Procurement Requirements

#### `POST /api/requirements`
Publishes an industrial procurement need to be matched against surplus listings.
- **Headers**: `Authorization: Bearer <JWT>`
- **Request Body**:
```json
{
  "materialCategory": "Textile and fabric waste",
  "materialTitle": "Raw Cotton Waste for Acoustic Insulation",
  "specificationDetails": "Clean dry fiber scraps with low dust.",
  "requiredQuantity": 500,
  "unit": "kg",
  "acceptableCondition": "Production Scrap",
  "deliveryLocation": {
    "city": "Coimbatore",
    "state": "Tamil Nadu",
    "country": "India"
  },
  "maxBudgetPerUnit": 35,
  "currency": "INR"
}
```

#### `GET /api/requirements`
Lists active procurement requirements posted by the authenticated company.

#### `GET /api/matches/:requirementId`
**Cross-Service Circular Matching Engine Endpoint**:
1. Exchange Service reads requirement specifications.
2. Exchange Service executes HTTP REST query to Resource Service (`GET /api/resources/matches`).
3. Evaluates 5 dimensions: Category & Keywords (35%), Quantity (25%), Condition (15%), Proximity (15%), Price (10%).
4. Returns ranked listings with `compatibilityScore` (0-100%) and `factors` array.

---

### 2.2 B2B Exchange Proposals & Lifecycle

#### `POST /api/exchanges`
Submits a procurement proposal for a listed industrial resource.
- **Server-to-Server REST Validation**: The Exchange Service contacts Resource Service `GET /api/resources/:id` over HTTP to verify that `requestedQuantity <= availableQuantity` before saving.
- **Request Body**:
```json
{
  "resourceId": "6734a1b2c3d4e5f6a7b8c9d1",
  "requestedQuantity": 500,
  "unit": "kg",
  "proposedPricePerUnit": 26,
  "currency": "INR",
  "proposalMessage": "Intend to reprocess cotton fiber into acoustic insulation panels.",
  "deliveryTerms": "Ex-Works facility pickup arranged by receiver",
  "complianceAck": true
}
```

#### `GET /api/exchanges/sent`
Lists outbound proposals submitted by the authenticated company.

#### `GET /api/exchanges/received`
Lists inbound proposals received by the authenticated company for its listings.

#### `GET /api/exchanges/:id`
Retrieves exchange details, message history, status timeline, and freight tracking.

#### `POST /api/exchanges/:id/negotiate`
Submits a counter-offer price or message in the negotiation thread.
- **Request Body**:
```json
{
  "message": "We can accommodate your intake date. Counter-offer is ₹27/kg for immediate loading.",
  "proposedPrice": 27
}
```

#### `PATCH /api/exchanges/:id/status`
Updates lifecycle status (`Accepted`, `Rejected`, `In Transfer`, `Completed`).
- When `status === 'Accepted'`: Coordinates atomic stock reservation with Resource Service (`PATCH /api/resources/:id/reserve`, `action: 'reserve'`).
- When `status === 'In Transfer'`: Records carrier name, waybill tracking reference, and dispatch date.
- When `status === 'Completed'`: Coordinates permanent stock decrement (`action: 'complete'`).

#### `PATCH /api/exchanges/:id/cancel`
Withdraws proposal and triggers automatic REST stock release if the proposal was previously accepted.

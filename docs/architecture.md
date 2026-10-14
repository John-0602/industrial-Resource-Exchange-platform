# System Architecture Documentation
## Resource Exchange Platform for College Students

### 1. High-Level Architectural Overview

The **Resource Exchange Platform** is engineered following a decoupled **Microservices Architecture**. Rather than deploying a monolithic backend, the platform isolates core domain capabilities into two autonomous microservices, each with its own database, lifecycle, and API surface:

1. **Frontend Client**: Built with React (Vite) and Tailwind CSS, providing a responsive single-page application (SPA).
2. **Resource Microservice (`resource-service`)**: Owns student authentication, student profiles, and the complete resource catalog lifecycle (CRUD, search, filtering, availability flags). Powered by its own isolated MongoDB database.
3. **Exchange Microservice (`exchange-service`)**: Manages the request lifecycle, conflict resolution, request negotiation, and status updates (Approve, Reject, Cancel, Complete). Powered by its own independent MongoDB database.
4. **Inter-Service REST Bridge**: The Exchange Service communicates directly with the Resource Service over standard HTTP REST APIs protected by a shared server-side secret (`x-service-api-key`), ensuring full data consistency without shared database access.

---

### 2. Component Architecture Diagram

```mermaid
graph TD
    subgraph Client Layer
        UI["🖥️ React.js (Vite) Single Page App\nTailwind CSS • Lucide Icons\nDeployed on Vercel"]
    end

    subgraph Microservice Layer
        RS["📦 Resource Service (Port 5001 / Cloud)\nNode.js • Express.js\nJWT Auth • Resource CRUD • Search"]
        ES["🤝 Exchange Service (Port 5002 / Cloud)\nNode.js • Express.js\nRequest Logic • Conflict Prevention"]
    end

    subgraph Data Persistence Layer
        RDB[("🗄️ MongoDB (Resources DB)\nUsers & Resources Collections")]
        EDB[("🗄️ MongoDB (Exchanges DB)\nExchange Requests Collection")]
    end

    %% Client Interactions
    UI -->|"HTTP REST (JWT Auth)\n/api/auth/* & /api/resources/*"| RS
    UI -->|"HTTP REST (JWT Auth)\n/api/exchanges/*"| ES

    %% Database Isolation
    RS -->|"Mongoose ODM (Isolated)"| RDB
    ES -->|"Mongoose ODM (Isolated)"| EDB

    %% Genuine Microservice REST Communication
    ES -.->|"⚡ Inter-Service REST Calls\nGET /api/resources/:id\nPATCH /api/resources/:id/availability\nHeader: x-service-api-key"| RS
```

---

### 3. Inter-Service Communication Sequence Diagram

This sequence diagram illustrates the compulsory server-to-server REST communication during request creation and approval.

```mermaid
sequenceDiagram
    autonumber
    actor Requester as 👨‍🎓 Requester Student
    participant Frontend as 🖥️ React Frontend
    participant ES as 🤝 Exchange Service (:5002)
    participant RS as 📦 Resource Service (:5001)
    actor Owner as 👩‍🎓 Resource Owner

    Note over Requester, RS: Phase 1: Request Creation & Verification
    Requester->>Frontend: Clicks "Request Resource" & submits message
    Frontend->>ES: POST /api/exchanges (with JWT & resourceId)
    
    rect rgb(240, 253, 250)
        Note over ES, RS: Server-to-Server REST Call
        ES->>RS: GET /api/resources/:id (Header: x-service-api-key)
        RS-->>ES: 200 OK (Returns resource details, owner ID, availabilityStatus)
    end

    ES->>ES: Verify: Resource exists, status == 'available',<br/>requester != owner, no duplicate pending requests
    ES->>ES: Insert Exchange document (Status: 'Pending')
    ES-->>Frontend: 201 Created (Request logged)
    Frontend-->>Requester: Display success confirmation

    Note over Owner, RS: Phase 2: Owner Approval & Availability Lock
    Owner->>Frontend: Opens Received Requests & clicks "Approve"
    Frontend->>ES: PATCH /api/exchanges/:id/status (status: 'Approved')
    
    rect rgb(240, 253, 250)
        Note over ES, RS: Server-to-Server REST Call
        ES->>RS: GET /api/resources/:id (Verify current availability)
        RS-->>ES: 200 OK (status == 'available')
        ES->>RS: PATCH /api/resources/:id/availability<br/>{ availabilityStatus: 'reserved' } (Header: x-service-api-key)
        RS-->>ES: 200 OK (Availability locked to 'reserved')
    end

    ES->>ES: Update status to 'Approved', auto-reject conflicting pending requests
    ES-->>Frontend: 200 OK (Request marked Approved)
    Frontend-->>Owner: Display approval confirmed & contact details

    Note over Requester, RS: Phase 3: Cancellation & Availability Restoration
    Requester->>Frontend: Clicks "Cancel Request"
    Frontend->>ES: PATCH /api/exchanges/:id/cancel
    rect rgb(254, 242, 242)
        Note over ES, RS: Server-to-Server REST Call
        ES->>RS: PATCH /api/resources/:id/availability<br/>{ availabilityStatus: 'available' } (Header: x-service-api-key)
        RS-->>ES: 200 OK (Availability restored to 'available')
    end
    ES->>ES: Update status to 'Cancelled'
    ES-->>Frontend: 200 OK (Request Cancelled)
```

---

### 4. Database Schema & Isolation

Each microservice communicates exclusively with its own database:

#### A. Resource Service Database (`resource_exchange_resources`)
- **`users` Collection**:
  - `_id`: ObjectId
  - `name`: String
  - `email`: String (Unique, Indexed)
  - `password`: String (Bcrypt salted hash)
  - `collegeName`: String
  - `department`: String
  - `profileImage`: String
  - `createdAt`, `updatedAt`: Timestamps
- **`resources` Collection**:
  - `_id`: ObjectId
  - `title`: String (Text Indexed)
  - `description`: String (Text Indexed)
  - `category`: Enum (`Textbooks`, `Notes & Study Materials`, `Lab Equipment`, `Stationery`, `Calculators & Tools`, `Electronics & Hardware`, `Other`)
  - `listingType`: Enum (`Lend`, `Exchange`, `Donate`, `Give Away`)
  - `condition`: Enum (`New`, `Like New`, `Good`, `Fair`)
  - `owner`: `{ id, name, email, collegeName, department }`
  - `imageUrl`: String
  - `exchangePreference`: String (for Exchange listings)
  - `lendingDuration`: String (for Lend listings)
  - `location`: String (Campus pickup point)
  - `availabilityStatus`: Enum (`available`, `reserved`, `exchanged`, `unavailable`)
  - Compound Indexes: `(category, listingType, availabilityStatus)`, `(owner.id)`

#### B. Exchange Service Database (`resource_exchange_exchanges`)
- **`exchanges` Collection**:
  - `_id`: ObjectId
  - `resourceId`: String (Indexed reference to Resource Service resource)
  - `resourceTitle`: String
  - `resourceCategory`: String
  - `resourceImageUrl`: String
  - `requesterId`: String (Indexed reference to student User)
  - `requesterName`: String
  - `requesterEmail`: String
  - `requesterCollege`: String
  - `requesterDepartment`: String
  - `ownerId`: String (Indexed reference to resource owner User)
  - `ownerName`: String
  - `ownerEmail`: String
  - `requestMessage`: String
  - `requestType`: Enum (`Lend`, `Exchange`, `Donate`, `Give Away`)
  - `exchangeItemOffered`: String
  - `durationRequested`: String
  - `status`: Enum (`Pending`, `Approved`, `Rejected`, `Cancelled`, `Completed`)
  - `statusHistory`: Array of `{ status, changedAt, changedBy, note }`
  - Compound Indexes: `(requesterId, status)`, `(ownerId, status)`, `(resourceId, requesterId, status)`

---

### 5. Inter-Service Security & Network Reliability

1. **Authentication Guard**:
   - Outbound REST calls originating from `exchange-service` transmit the header `x-service-api-key`.
   - The `resource-service` inspects this key using `serviceAuthMiddleware.js`. If valid, it grants privileged access to update availability status on behalf of the exchange engine without requiring an interactive student session.
2. **Network Timeout & Circuit Handling**:
   - In `resourceClient.js`, outbound REST requests utilize an explicit `7000ms` connection timeout.
   - Handlers specifically differentiate between `ECONNREFUSED` (Service down), `ECONNABORTED` (Timeout), and `4xx/5xx` HTTP responses, avoiding hanging thread pools and returning actionable HTTP error messages to clients.

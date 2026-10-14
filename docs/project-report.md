# Academic Project Report
## Resource Exchange Platform for College Students
**Course**: Full Stack Application Lab (CAT 2)  
**Architecture Style**: Microservices Architecture  
**Technology Stack**: MERN (MongoDB, Express, React, Node.js) with Tailwind CSS  

---

### 1. Problem Statement
In higher education institutions, students invest thousands of dollars each semester acquiring physical textbooks, specialized scientific calculators, engineering drawing drafters, and hardware lab kits (e.g., Arduino kits, microcontrollers, breadboards). Once course examinations conclude, these expensive academic resources typically sit idle in hostel rooms or get discarded, while incoming cohorts are forced to repurchase the same items at full price. Existing platforms (such as generic classifieds or group chats) lack structured verification, campus-specific categorization, listing type distinctions (Lend vs. Exchange vs. Donate), conflict resolution, and privacy-preserving student authentication.

### 2. Project Objectives
1. **Centralize Campus Resource Discovery**: Provide a unified platform where students can search, filter, and discover available academic supplies.
2. **Implement Real Microservices Architecture**: Decouple the system into two independent backend Node.js/Express services (`resource-service` and `exchange-service`) with isolated databases.
3. **Establish Genuine Inter-Service REST Communication**: Implement server-to-server HTTP REST calls between the services for resource verification and state synchronization.
4. **Enforce Academic Business Rules**:
   - Prevent students from requesting their own resources.
   - Prevent duplicate pending requests for the same item.
   - Automatically lock resource availability to "reserved" when a request is approved.
   - Restore availability when approved requests are cancelled or rejected.
5. **Deliver a Production-Grade Responsive Frontend**: Build a modern, accessible interface in React (Vite) and Tailwind CSS with light navy/teal aesthetic, 13 functional pages, and no static placeholders.
6. **Ensure Cloud Deployment Readiness**: Enable independent deployment on Vercel (frontend), Render (both backend microservices), and MongoDB Atlas (isolated databases).

---

### 3. Technologies Utilized

- **Frontend**: React 19, Vite 6, Tailwind CSS 3.4, Lucide React Icons, React Router v7, Axios.
- **Microservice 1 (Resource Service)**: Node.js, Express.js, Mongoose ODM, JSON Web Tokens (JWT), Bcrypt.js, Helmet, Morgan, Express Rate Limit.
- **Microservice 2 (Exchange Service)**: Node.js, Express.js, Mongoose ODM, Axios (Inter-Service REST client), Helmet, Morgan, Express Rate Limit.
- **Databases**: MongoDB (MongoDB Atlas in cloud / isolated local databases with in-memory fallback).
- **Automated Testing**: Node.js Native Test Runner (`node:test`), Supertest, Vite Bundler validation.
- **Deployment Targets**: Vercel (Frontend SPA), Render (Independent Web Services), Git/GitHub (Version Control).

---

### 4. Microservices Architecture & Data Flow

#### Independent Services
- **`resource-service` (Port 5001)**: Owns student authentication, user profiles, and the resource inventory (`/api/auth/*` and `/api/resources/*`). Connected to database `resource_exchange_resources`.
- **`exchange-service` (Port 5002)**: Owns request negotiations, approval states, and exchange history (`/api/exchanges/*`). Connected to database `resource_exchange_exchanges`.

#### Server-to-Server REST Bridge
When a student creates or updates an exchange request, the `exchange-service` does NOT access the Resource database directly. Instead, it issues genuine HTTP REST requests to the `resource-service` using `resourceClient.js`:
1. `GET /api/resources/:id`: Verifies existence, ownership, and availability.
2. `PATCH /api/resources/:id/availability`: Automatically transitions status between `'available'` and `'reserved'`/`'exchanged'` when requests are Approved or Cancelled.
Calls are secured using the internal header `x-service-api-key`.

---

### 5. Implementation Highlights

1. **Clean Separation of Concerns**: Zero collection sharing between services. Entities in the Exchange Service reference Resources and Users by IDs.
2. **Robust Error Handling**: Centralized error middleware in both services translates Mongoose `CastError`, duplicate key errors (11000), and validation errors into friendly client responses.
3. **Resilient Inter-Service Client**: The HTTP client incorporates a 7-second timeout and catches connection drops (`ECONNREFUSED`), returning clear `503 Service Unavailable` statuses instead of hanging.
4. **1-Click Evaluation Accounts**: Seed script generates 3 realistic student accounts (Priya Sharma - CSE, Rahul Verma - ECE, Ananya Iyer - Mech) and 8 realistic items across Textbooks, Lab Equipment, Calculators, Notes, and Stationery. The login screen features 1-click credential filling for immediate evaluation.
5. **Zero-Setup Database Fallback**: If an external MongoDB Atlas cluster is not configured, both services automatically fall back to an internal in-memory database instance, guaranteeing that the application and test suites run out of the box on any machine.

---

### 6. Testing & Results

- **Automated Tests**: 22 automated integration tests executed (13 in Resource Service, 9 in Exchange Service).
- **Pass Rate**: 100% (22/22 passed).
- **Production Bundle**: Successfully built in 5.33 seconds with zero lint or bundling errors.
- **Verified Edge Cases**:
  - Duplicate registration prevention.
  - Non-owner edit and delete blocking (`403 Forbidden`).
  - Self-request prevention (`400 Bad Request`).
  - Duplicate pending request prevention (`400 Bad Request`).
  - Real-time availability lock and restore via inter-service REST calls.

---

### 7. Limitations

1. **Distributed Transactions**: While status updates are synchronized via REST, partial failures (e.g., Exchange Service successfully approves request but network drops before Resource Service updates availability) are handled through application-level logging and retry logic rather than a distributed Two-Phase Commit (2PC) or Saga orchestrator.
2. **In-Person Physical Exchange**: The platform coordinates digital approval and records meeting points on campus; physical verification relies on student honor code.

---

### 8. Future Enhancements

1. **Real-Time WebSockets / Push Notifications**: Integrate Socket.io for immediate alerts when requests are received or approved.
2. **Event-Driven Messaging via RabbitMQ / Kafka**: Transition inter-service REST updates to asynchronous message queues for eventual consistency under high traffic.
3. **In-App Direct Chat**: Allow student pairs to chat directly within the platform once a request is approved to coordinate campus pickup times.
4. **Barcode / QR Code Handover Verification**: Generate a one-time QR code upon request approval that the lender scans on handover to mark the exchange completed.

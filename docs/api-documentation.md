# API Documentation
## Resource Exchange Platform Microservices

This document details all REST endpoints provided by the two microservices: **Resource Service** (Default Port `5001`) and **Exchange Service** (Default Port `5002`).

---

## 1. Resource Service Endpoints

Base URL: `http://localhost:5001` or Deployed Cloud URL

### 1.1 Health Check
- **Endpoint**: `GET /health`
- **Access**: Public
- **Description**: Returns microservice status, database readiness, and uptime.
- **Response `200 OK`**:
```json
{
  "service": "resource-service",
  "status": "OK",
  "dbStatus": "connected",
  "timestamp": "2026-10-14T10:35:00.000Z",
  "uptimeSeconds": 340,
  "environment": "production"
}
```

---

### 1.2 Student Registration
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "name": "Priya Sharma",
  "email": "priya.sharma@apex.edu",
  "password": "Password@123",
  "collegeName": "Apex Engineering Institute",
  "department": "Computer Science and Engineering"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Student registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67aef0011122334455667788",
      "name": "Priya Sharma",
      "email": "priya.sharma@apex.edu",
      "collegeName": "Apex Engineering Institute",
      "department": "Computer Science and Engineering",
      "createdAt": "2026-10-14T10:30:00.000Z"
    }
  }
}
```
- **Error Codes**: `400 Bad Request` (Missing fields, password < 6 chars, email already registered).

---

### 1.3 Student Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "priya.sharma@apex.edu",
  "password": "Password@123"
}
```
- **Response `200 OK`**: Returns JWT access token and user profile object.
- **Error Codes**: `401 Unauthorized` (Account not found or password incorrect).

---

### 1.4 Get Current Student Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Private (Requires `Authorization: Bearer <token>`)
- **Response `200 OK`**: Returns logged in student's profile without password.

---

### 1.5 Create Resource Listing
- **Endpoint**: `POST /api/resources`
- **Access**: Private (Student)
- **Request Body**:
```json
{
  "title": "Introduction to Algorithms (CLRS 3rd Edition)",
  "description": "Standard algorithms reference textbook. Great condition.",
  "category": "Textbooks",
  "listingType": "Lend",
  "condition": "Like New",
  "imageUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
  "lendingDuration": "14 days",
  "location": "Central Campus Library, Floor 2"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Resource listed successfully",
  "data": {
    "_id": "67aef112233445566778899a",
    "title": "Introduction to Algorithms (CLRS 3rd Edition)",
    "category": "Textbooks",
    "listingType": "Lend",
    "condition": "Like New",
    "availabilityStatus": "available",
    "owner": {
      "id": "67aef0011122334455667788",
      "name": "Priya Sharma",
      "email": "priya.sharma@apex.edu"
    },
    "createdAt": "2026-10-14T10:32:00.000Z"
  }
}
```

---

### 1.6 Get All Resources (Paginated & Filtered)
- **Endpoint**: `GET /api/resources`
- **Access**: Public
- **Query Parameters**:
  - `page`: Page number (Default: `1`)
  - `limit`: Items per page (Default: `12`)
  - `category`: Category name (`Textbooks`, `Notes & Study Materials`, etc.)
  - `listingType`: `Lend`, `Exchange`, `Donate`, `Give Away`
  - `availability`: `available`, `reserved`, `exchanged`
  - `ownerId`: Filter by owner's student ID
  - `sort`: `newest`, `oldest`, `title_asc`
- **Response `200 OK`**:
```json
{
  "success": true,
  "count": 8,
  "total": 8,
  "page": 1,
  "totalPages": 1,
  "data": [ ... ]
}
```

---

### 1.7 Search Resources
- **Endpoint**: `GET /api/resources/search?q=Algorithms`
- **Access**: Public
- **Query Parameters**: `q` (Search query string), `category`, `listingType`
- **Response `200 OK`**: Array of matched resource listings.

---

### 1.8 Get Resource by ID
- **Endpoint**: `GET /api/resources/:id`
- **Access**: Public
- **Response `200 OK`**: Returns full resource listing object.
- **Error Codes**: `404 Not Found` (Resource with given ID does not exist).

---

### 1.9 Update Resource Listing
- **Endpoint**: `PUT /api/resources/:id`
- **Access**: Private (Owner Only)
- **Request Body**: Partial or complete resource update attributes.
- **Error Codes**: `403 Forbidden` (Requester is not the owner), `404 Not Found`.

---

### 1.10 Delete Resource Listing
- **Endpoint**: `DELETE /api/resources/:id`
- **Access**: Private (Owner Only)
- **Response `200 OK`**: Returns `{ success: true, message: "Resource listing removed successfully" }`.

---

### 1.11 Update Availability Status (Inter-Service / Owner)
- **Endpoint**: `PATCH /api/resources/:id/availability`
- **Access**: Private (Resource Owner OR Microservice with `x-service-api-key`)
- **Request Body**:
```json
{
  "availabilityStatus": "reserved"
}
```
- **Permitted Values**: `'available'`, `'reserved'`, `'exchanged'`, `'unavailable'`.
- **Response `200 OK`**: Updated resource with new availability.

---

## 2. Exchange Service Endpoints

Base URL: `http://localhost:5002` or Deployed Cloud URL

### 2.1 Health Check
- **Endpoint**: `GET /health`
- **Access**: Public
- **Response `200 OK`**: Returns status and target Resource Service connection URL.

---

### 2.2 Create Exchange / Borrow Request
- **Endpoint**: `POST /api/exchanges`
- **Access**: Private (Student)
- **Request Body**:
```json
{
  "resourceId": "67aef112233445566778899a",
  "requestMessage": "Hi! I am preparing for exams and need this book for 2 weeks.",
  "exchangeItemOffered": "Optional item offered in trade",
  "durationRequested": "14 days"
}
```
- **Business Logic Validated**:
  1. Calls Resource Service via REST (`GET /api/resources/:id`).
  2. Ensures resource exists and is in `'available'` status.
  3. Rejects if requester is the resource owner (`400 Bad Request`).
  4. Rejects if requester already has an active `'Pending'` request for this resource (`400 Bad Request`).
- **Response `201 Created`**: Returns created Exchange record with status `'Pending'`.

---

### 2.3 Get Sent Requests
- **Endpoint**: `GET /api/exchanges/sent`
- **Access**: Private (Student)
- **Response `200 OK`**: Returns array of all requests submitted by the student.

---

### 2.4 Get Received Requests
- **Endpoint**: `GET /api/exchanges/received`
- **Access**: Private (Student)
- **Response `200 OK`**: Returns array of all requests received for resources owned by the student.

---

### 2.5 Get Single Request by ID
- **Endpoint**: `GET /api/exchanges/:id`
- **Access**: Private (Requester or Owner only)
- **Response `200 OK`**: Full exchange request details and audit history.

---

### 2.6 Update Request Status (Approve, Reject, Complete)
- **Endpoint**: `PATCH /api/exchanges/:id/status`
- **Access**: Private (Resource Owner Only)
- **Request Body**:
```json
{
  "status": "Approved",
  "note": "Approved! We can meet at the library to exchange."
}
```
- **Allowed Statuses**: `'Approved'`, `'Rejected'`, `'Completed'`
- **Coordinated REST Behavior**:
  - When status changes to `'Approved'`:
    1. Re-verifies resource availability with Resource Service.
    2. Sends REST `PATCH /api/resources/:id/availability` with `{ availabilityStatus: 'reserved' }` (or `'exchanged'`).
    3. Automatically updates any other pending requests for this same resource to `'Rejected'`.
  - When status changes to `'Completed'`:
    - Synchronizes availability status upon completion.
- **Response `200 OK`**: Updated exchange record.

---

### 2.7 Cancel Exchange Request
- **Endpoint**: `PATCH /api/exchanges/:id/cancel`
- **Access**: Private (Requester Only)
- **Request Body**:
```json
{
  "reason": "Found another copy, no longer needed."
}
```
- **Coordinated REST Behavior**:
  - If request was previously in `'Approved'` state, automatically issues REST `PATCH /api/resources/:id/availability` with `{ availabilityStatus: 'available' }` to unlock the resource for other campus peers.
- **Response `200 OK`**: Request updated to `'Cancelled'`.

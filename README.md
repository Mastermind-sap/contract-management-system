# Contract Management Platform

A robust, full-stack Contract Management Platform built with **Go (Golang)** and **Next.js**.
Designed for high performance, ease of use, and premium aesthetics.

## Features
- **Blueprint Management**: Create reusable contract templates with dynamic fields (Text, Number, Date, Boolean).
- **Contract Lifecycle**: Managed state machine: `Created` -> `Approved` -> `Sent` -> `Signed` -> `Locked`.
- **Dashboard**: Real-time overview of all contracts and their statuses.
- **Premium UI**: Glassmorphism design, smooth transitions, and responsive layout.

## Architecture
![Architecture Diagram](/frontend/public/assets/architecture.png)

## Tech Stack
### Backend
- **Language**: Go 1.21+
- **Framework**: Gin (HTTP Web Framework)
- **Database**: SQLite (via GORM)
- **Architecture**: MVC (Models, Controllers)

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules (Vanilla CSS) with CSS Variables for theming.

## Getting Started

### Prerequisites
- Node.js 18+
- Go 1.21+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mastermind-sap/contract-management-system.git
   cd contract-management-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   go mod tidy
   go run main.go
   ```
   Server will run on `http://localhost:8080`.

3. **Frontend Setup**
   Open a new terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   App will run on `http://localhost:3000`.

## API Design Summary
The backend exposes a RESTful API to manage resources.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/blueprints` | List all available contract templates |
| `POST` | `/api/blueprints` | Create a new blueprint (`{ title, description, schema }`) |
| `GET` | `/api/contracts` | List all contracts with current status |
| `POST` | `/api/contracts` | Initialize a contract from a blueprint |
| `GET` | `/api/contracts/:id` | Get full details of a specific contract |
| `PATCH` | `/api/contracts/:id/status` | Transition contract state (e.g., `APPROVED`, `SIGNED`) |

**API Documentation**: Swagger UI is available at `http://localhost:8080/swagger/index.html` when the backend is running.

### Lifecycle State Machine
Strict transitions are enforced by the backend:
- `CREATED` → `APPROVED`
- `APPROVED` → `SENT`
- `SENT` → `SIGNED`
- `SIGNED` → `LOCKED` (Final State)
- `REVOKED` is allowed from any non-final state.

## Assumptions and Trade-offs

### Assumptions
1.  **Single Tenant**: The system assumes a single organization usage; no multi-tenancy or user authentication was required for this MVP (as per "Authentication: Optional").
2.  **Schema Flexibility**: Blueprints store their field definitions as a JSON string (`schema`). This allows extreme flexibility without complex EAV (Entity-Attribute-Value) tables, assuming SQLite's JSON capabilities are sufficient.
3.  **Local Persistence**: SQLite is used for simplicity and portability. For production, this can be swapped for PostgreSQL by changing the GORM driver.

### Trade-offs
1.  **JSON Storage for Fields**: Storing contract data as a JSON blob (`data` field) simplifies the schema but makes querying by specific field values (e.g., "Find all contracts with Party A = Acme") less efficient compared to relational columns.
2.  **No Websockets**: The dashboard refreshes on load. Real-time updates (Websockets) were omitted to keep the architecture simple and robust within the timeframe.
3.  **Validation**: Frontend validation depends on the Blueprint schema. Backend validation currently checks for existence but could be expanded to validate types strictly against the JSON schema.

## Visual Showcase
### Dashboard
![Dashboard](/frontend/public/assets/dashboard.png)

### Blueprint Creation
![Blueprint Builder](/frontend/public/assets/blueprint_creation.png)

### Contract Lifecycle
![Contract Details](/frontend/public/assets/contract_details.png)

### Video Walkthrough
![Walkthrough](./frontend/public/assets/flow.webp)


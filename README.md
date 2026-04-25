# Femma Bank — Digital Banking Backend System

A production-grade RESTful banking API built with Node.js, Express, and MongoDB,
integrated with the NibssByPhoenix financial infrastructure for real-time
identity verification and core banking operations.

---

## Overview

Femma Bank is a core banking backend system that supports the full customer
lifecycle — from identity verification and onboarding to account management,
funds transfer, and transaction tracking. The system enforces strict data
isolation to ensure no customer can access another customer's financial data.

---

## Architecture
├── config/         # Database connection
├── middleware/     # JWT authentication guard
├── models/         # MongoDB schemas (Customer, Transaction)
├── routes/         # API route handlers (auth, account, transfer)
├── server.js       # Application entry point

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Password Security | bcryptjs |
| External API | NibssByPhoenix Banking API |
| HTTP Client | Axios |

---

## Features

- **Customer Onboarding** — BVN/NIN identity verification via NibssByPhoenix
- **Account Creation** — One account per customer, prefunded with ₦15,000
- **JWT Authentication** — Stateless, secure token-based auth system
- **Balance Enquiry** — Real-time account balance via NibssByPhoenix
- **Name Enquiry** — Recipient verification before transfer
- **Intra-Bank Transfer** — Instant transfers within Femma Bank
- **Inter-Bank Transfer** — Transfers to external banks via NibssByPhoenix
- **Transaction History** — Per-customer transaction records
- **Data Privacy** — Strict account-level data isolation

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- NibssByPhoenix API credentials

### Installation
git clone https://github.com/oluwoleferanmi15-lang/Femma_Bank.git
cd Femma_Bank
npm install

### Environment Variables

Create a `.env` file in the root directory:
PORT=5000
MONGO_URI=mongodb://localhost:27017/fembank
JWT_SECRET=your_jwt_secret
API_KEY=your_nibssbyPhoenix_api_key
API_SECRET=your_nibssbyPhoenix_api_secret
BANK_CODE=822
BANK_NAME=FEM Bank
BASE_URL=https://nibssbyphoenix.onrender.com

### Run the Server
node server.js

Server will start on http://localhost:5000

---

## API Reference

### Authentication

#### Register Customer
POST /api/auth/register

#### Login
POST /api/auth/login

---

### Account (Protected — requires Bearer token)

#### Check Balance
GET /api/account/balance

#### Name Enquiry
GET /api/account/name-enquiry/:accountNumber

#### Transaction History
GET /api/account/transactions

---

### Transfer (Protected — requires Bearer token)

#### Transfer Funds
POST /api/transfer

#### Check Transaction Status
GET /api/transfer/:reference

---

## Security

- Passwords are hashed using **bcryptjs** before storage
- All protected routes require a valid **JWT token**
- Each customer can only access their **own data**
- `.env` file is excluded from version control via `.gitignore`

---

## Testing

A Postman collection is included in the repository for testing all endpoints.
Import `FemmaBank.postman_collection.json` into Postman to get started.

---

## Bank Details

| Detail | Value |
|---|---|
| Bank Name | FEM Bank |
| Bank Code | 822 |
| Infrastructure | NibssByPhoenix |

---

## Author

Oluwole Feranmi
Backend Engineering Student — TS Academy
April 2026
<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
</p>

<h1 align="center">🏦 Femma Bank — Digital Banking Backend System</h1>

<p align="center">
  A <b>production-grade RESTful banking API</b> built with <code>Node.js</code>, <code>Express</code>, and <code>MongoDB</code>,<br>
  integrated with the <strong>NibssByPhoenix</strong> financial infrastructure for real-time<br>
  identity verification and core banking operations.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/status-active-success?style=flat-square" />
</p>

<p align="center">
  🌐 <b>Live API:</b> <a href="https://femma-bank.vercel.app">https://femma-bank.vercel.app</a>
</p>

---

## 📋 Overview

**Femma Bank** is a core banking backend system that supports the full customer lifecycle — from identity verification and onboarding to account management, funds transfer, and transaction tracking. The system enforces **strict data isolation** to ensure no customer can access another customer's financial data.

---

## 🏗️ Architecture

```
├── config/         # Database connection
├── middleware/     # JWT authentication guard
├── models/         # MongoDB schemas (Customer, Transaction)
├── routes/         # API route handlers (auth, account, transfer)
├── server.js       # Application entry point
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| ⚙️ Runtime | Node.js |
| 🚀 Framework | Express.js |
| 🍃 Database | MongoDB + Mongoose |
| 🔐 Authentication | JSON Web Tokens (JWT) |
| 🔒 Password Security | bcryptjs |
| 🌐 External API | NibssByPhoenix Banking API |
| 📡 HTTP Client | Axios |

---

## ✨ Features

| Feature | Description |
|:---|:---|
| 👤 **Customer Onboarding** | BVN/NIN identity verification via NibssByPhoenix |
| 💳 **Account Creation** | One account per customer, prefunded with ₦15,000 |
| 🔑 **JWT Authentication** | Stateless, secure token-based auth system |
| 💰 **Balance Enquiry** | Real-time account balance via NibssByPhoenix |
| 🔍 **Name Enquiry** | Recipient verification before transfer |
| 🔄 **Intra-Bank Transfer** | Instant transfers within Femma Bank |
| 🏦 **Inter-Bank Transfer** | Transfers to external banks via NibssByPhoenix |
| 📜 **Transaction History** | Per-customer transaction records |
| 🛡️ **Data Privacy** | Strict account-level data isolation |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- NibssByPhoenix API credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/oluwoleferanmi15-lang/Femma_Bank.git

# Navigate into the directory
cd Femma_Bank

# Install dependencies
npm install
```

### 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
API_KEY=your_nibssbyPhoenix_api_key
API_SECRET=your_nibssbyPhoenix_api_secret
BANK_CODE=822
BANK_NAME=FEM Bank
BASE_URL=https://nibssbyphoenix.onrender.com
```

### ▶️ Run the Server

```bash
node server.js
```

🌐 Server will start on `http://localhost:5000`

---

## 📚 API Reference

### 🔓 Authentication

| Endpoint | Method | Description |
|:---|:---|:---|
| /api/auth/register | POST | Register a new customer |
| /api/auth/login | POST | Login and receive JWT token |

### 🔒 Account (Protected — requires Bearer token)

| Endpoint | Method | Description |
|:---|:---|:---|
| /api/account/balance | GET | Check account balance |
| /api/account/name-enquiry/:accountNumber | GET | Verify recipient name |
| /api/account/transactions | GET | View transaction history |

### 💸 Transfer (Protected — requires Bearer token)

| Endpoint | Method | Description |
|:---|:---|:---|
| /api/transfer | POST | Transfer funds |
| /api/transfer/:reference | GET | Check transaction status |

---

## 🔒 Security

- ✅ Passwords are hashed using **bcryptjs** before storage
- ✅ All protected routes require a valid **JWT token**
- ✅ Each customer can only access their **own data**
- ✅ `.env` file is excluded from version control via `.gitignore`

---

## 🧪 Testing

A Postman collection is included in the repository for testing all endpoints.
Import `FemmaBank.postman_collection.json` into Postman to get started.

---

## 🏦 Bank Details

| Detail | Value |
|:---|:---|
| 🏛️ Bank Name | FEM Bank |
| 🔢 Bank Code | 822 |
| 🔗 Infrastructure | NibssByPhoenix |
| 🌐 Live URL | https://femma-bank.vercel.app |

---

## 👨‍💻 Author

**Oluwole Feranmi**  
Backend Engineering Student — TS Academy  
📅 April 2026

<p align="center">
  <sub>Built with 💚 and ☕ by Oluwole Feranmi</sub>
</p>
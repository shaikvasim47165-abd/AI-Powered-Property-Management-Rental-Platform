# PropAI — AI-Powered Property Management & Rental Platform (MVP)

A professional, modern, serverless-ready property rental platform connecting **tenants** with **verified property owners**. Built with strict adherence to architectural separation: **MongoDB is the single source of truth**, and **Google Gemini API** serves as an intelligent reasoning and natural-language understanding layer.

---

## 🚀 Key Features

### For Tenants
- **Property Discovery**: Filter by city, budget slider, bedrooms (BHK), property type, furnishing, and amenities.
- **Conversational AI Search**: Ask naturally: *"Show me a 2BHK near metro with parking in Chennai under 25k"*. The AI parses criteria into structured database filters.
- **Grounded Listing Q&A**: Ask listing-specific questions (*"Is parking included?"*, *"What is the deposit?"*). Answers are strictly derived from real database facts with zero hallucinations.
- **Property Comparison Matrix**: Side-by-side spec and amenities comparison for up to 4 selected homes.
- **Shortlisting**: 1-click save/unsave to personal favorites.
- **Direct Enquiries**: Instant zero-brokerage enquiry submission directly to the property owner.
- **Tenant Dashboard**: Track saved homes, active enquiries, and status updates.

### For Property Owners
- **Portfolio Management**: Add, view, edit, and delete rental listings.
- **Media Manager**: High-resolution image upload & URL management.
- **Availability Toggle**: Switch listings between *Available* and *Rented* with 1 click.
- **Enquiries Management**: Direct inbox of prospective tenants with status controls (*Mark Contacted*, *Close*, notes).
- **Owner Dashboard**: Real-time KPIs for total listings, active units, and received inquiries.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Axios, React Router 6 |
| **Backend** | Node.js, Express.js, REST API, Helmet, Rate Limiting, Multer, JWT Auth, BcryptJS |
| **Database** | MongoDB & Mongoose (with automated in-memory MongoDB fallback for instant zero-setup dev) |
| **AI Intelligence** | Google Gemini API (`@google/generative-ai`) with heuristic query fallback |

---

## 📦 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Run Locally
Clone the repository and run the concurrently configured scripts:

```bash
# Install all root, server, and client dependencies
npm run install-all

# Start both backend and frontend concurrently in development mode
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 🔑 Demo Evaluator Accounts (1-Click Test Credentials)

You can use the **"Quick Demo Login"** button in the top navigation bar or enter credentials manually:

| Persona | Email | Password | Role |
|---|---|---|---|
| **Priya Patel (Tenant)** | `tenant@example.com` | `password123` | Tenant |
| **Rajesh Sharma (Owner)** | `owner@example.com` | `password123` | Property Owner |

---

## ⚙️ Environment Variables

### Server (`server/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI= # Leave blank for auto in-memory MongoDB, or paste your MongoDB Atlas URI
JWT_SECRET=prop_ai_super_secret_jwt_key_2026_rental_platform
GEMINI_API_KEY= # Optional: Provide your Google Gemini API Key for live AI responses
```

> **Note**: Even if `GEMINI_API_KEY` is not provided, PropAI includes a built-in intelligent regex and rule-based fallback parser so that natural-language queries and listing questions work smoothly out-of-the-box!

---

## 🏛️ System Architecture

```text
                    ┌─────────────────────────┐
                    │       Gemini API        │
                    │  (Query & Q&A Reasoning)│
                    └───────────┬─────────────┘
                                │
                         Understands Query
                                │
                                ▼
USER ──────────────► BACKEND (Node/Express) ───► MONGODB (Atlas / Local)
(React + Vite)             │                               │
                           ▼                               ▼
                      Rate Limiter &                   REAL LISTINGS
                     Input Validation               (Single Source of Truth)
```

1. **MongoDB is the single source of truth**: Gemini is never asked to invent listings.
2. **Graceful Degradation**: If AI limits are reached or the service is offline, normal search, filtering, shortlisting, and enquiries remain 100% operational.
3. **Safety & Scope Boundary**: Refuses and redirects out-of-scope requests (e.g. legal contracts, investment speculation, financial advice).

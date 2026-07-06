# 🚀 AI Placement Recommendation System - Backend

> 💡 An AI-powered backend that helps students discover the best placement opportunities through resume analysis, skill-gap detection, and personalized job recommendations.

---

## 📖 Overview

The **AI Placement Recommendation System - Backend** is a RESTful API built to power the placement platform. It securely manages authentication, resume parsing, AI-driven recommendations, job scraping, skill-gap analysis, learning roadmap generation, and email notifications.

---

## ✨ Features

- 🔐 Secure User Authentication
- 📄 Resume Upload & Parsing
- 🤖 AI Resume Analysis
- 💼 Smart Job Recommendations
- 📊 Skill Gap Analysis
- 🛣️ Personalized Learning Roadmaps
- 🌐 Job Scraping & Aggregation
- 📧 Email Notifications
- ⚡ RESTful APIs
- 🗄️ PostgreSQL Database Integration

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| 🟢 Node.js | Runtime Environment |
| ⚡ Express.js | Backend Framework |
| 📘 TypeScript | Programming Language |
| 🐘 PostgreSQL | Database |
| 🔷 Prisma ORM | Database ORM |
| 🔑 Better Auth | Authentication |
| 🤖 Google Gemini | AI Services |
| 🧠 OpenAI | AI Processing |
| 🚀 Groq | AI Inference |
| 🐳 Docker | Containerization |
| 📦 pnpm | Package Manager |

---

## 📂 Project Structure

```text
placement-recommendation-backend/
│
├── 📁 prisma/
├── 📁 scripts/
├── 📁 src/
├── 📁 uploads/
├── 🐳 Dockerfile
├── 🐳 docker-compose.yml
├── 📦 package.json
├── ⚙️ tsconfig.json
└── 📘 README.md
```

---

## ⚙️ Prerequisites

Before running the project, install:

- ✅ Git
- ✅ Node.js (LTS)
- ✅ pnpm
- ✅ PostgreSQL
- ✅ Docker (Optional)

---

## 📥 Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Deepakccc/placement-recommendation-backend.git
```

---

### 2️⃣ Navigate to the Project

```bash
cd placement-recommendation-backend
```

---

### 3️⃣ Install Dependencies

```bash
pnpm install
```

---

### 4️⃣ Configure Environment Variables

Create a `.env` file in the project root and add all the required environment variables.

---

### 5️⃣ Generate Prisma Client

```bash
pnpm prisma generate
```

---

### 6️⃣ Run Database Migration

```bash
pnpm prisma migrate dev
```

or

```bash
pnpm prisma db push
```

---

### 7️⃣ Start Development Server

```bash
pnpm run dev
```

---

## 📡 API Modules

- 🔐 Authentication
- 👤 User Management
- 📄 Resume Management
- 🤖 AI Recommendation Engine
- 📊 Skill Gap Analysis
- 🛣️ Learning Roadmap
- 💼 Job Management
- 📧 Email Notifications

---

## 🌍 Environment Variables

Create a `.env` file with the required values:

```env
DATABASE_URL=

PORT=3000

BETTER_AUTH_SECRET=

GOOGLE_API_KEY=

OPENAI_API_KEY=

GROQ_API_KEY=

RESEND_API_KEY=

EMAIL_USER=

EMAIL_PASS=
```

---

## 🤝 Contributors

- 👨‍💻 Deepak
- 👨‍💻 Jaswanth Sai Tangudu
- 👨‍💻 Vijaya Sai Akula
- 👨‍💻 Raunak Rai
- 👩‍💻 Sneha Kedari
- 👨‍💻 Jai Ram Maddukuri
- 👨‍💻 Yaswanth Vinnakota

---

## 📜 License

This project is developed for **academic and educational purposes**.

---

## ⭐ Support

If you find this project helpful, consider giving it a **⭐ Star** on GitHub.

> 🚀 *Built with passion by Team AI Placement Recommendation System.*

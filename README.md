# 🚀 Forge Path

> Track. Analyze. Grow.

Forge Path is a full-stack web application designed for developers to document, track, and analyze their learning experiments in a structured and data-driven way.

---

## 📌 Problem Statement

Developers frequently experiment with new technologies, frameworks, and tools, but often lack a structured way to document their learnings and track progress over time.

---

## 💡 Solution

Forge Path provides a centralized platform where users can:

* Document experiments with detailed logs
* Analyze outcomes through a dashboard
* Track consistency and growth
* Stay motivated using gamification

---

## ✨ Key Features

* 🔐 Secure Authentication (JWT + OAuth)
* 🧪 Experiment Management (Create, Read, Update, Delete)
* 📊 Data-driven Dashboard with insights
* 🎮 Gamification System (XP-based Levels & Milestones)
* 🏅 Skill-based Badge (Node Explorer)
* 🛡️ Rate Limiting & Security
* 🔎 Search & Filter experiments

---

## 🧠 How It Works

1. User logs in using email or OAuth
2. Creates and manages experiments
3. Data is stored in MongoDB
4. Dashboard visualizes progress
5. Gamification tracks XP, levels, and milestones

---

## 🏗️ System Architecture

```text
Frontend (Vercel) → Backend API (Render) → MongoDB Atlas
```

* Frontend handles UI and user interaction
* Backend manages logic, authentication, and APIs
* Database stores user data, experiments, and activity

---

## 📡 API Endpoints

### Authentication

```bash
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### Experiments

```bash
POST /api/experiments
GET /api/experiments
GET /api/experiments/:id
PUT /api/experiments/:id
DELETE /api/experiments/:id
```

---

## 🧪 Example Use Case

Example Experiment:

* Title: Building a REST API using Node.js and Express
* Technology: Node
* Status: Success
* Outcome: Successfully built and tested API endpoints with MongoDB integration

This demonstrates how users can track their real learning progress.

---

## 🛠️ Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Frontend       | HTML, CSS, JavaScript               |
| Backend        | Node.js, Express.js                 |
| Database       | MongoDB                             |
| Authentication | JWT + OAuth                         |
| Deployment     | Vercel (Frontend), Render (Backend) |

---

## 📂 Project Structure

```bash
Forge Path/
├── .env
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── vercel.json
├── fix.js
├── replacer.js

├── api/
│   └── index.js

├── client/
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── dashboard.html
│   ├── experiments.html
│   ├── add-experiment.html
│   ├── edit-experiment.html
│   ├── experiment-details.html
│   ├── profile.html
│   ├── roadmap.html
│   ├── compare.html
│   ├── about-us.html
│   ├── manual.html
│
│   ├── css/
│   │   ├── style.css
│   │   ├── auth.css
│   │   ├── dashboard.css
│   │   ├── experiment.css
│   │   └── roadmap.css
│
│   ├── js/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── experiment.js
│   │   ├── profile.js
│   │   ├── roadmap.js
│   │   └── compare.js
│
│   └── assets/

└── server/
    ├── server.js
    ├── app.js
    ├── seed.js
    ├── seedBadges.js
    │
    ├── api/
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── dashboardController.js
    │   │   ├── experimentController.js
    │   │   └── compareController.js
    │   │
    │   ├── routes/
    │   │   ├── authRoutes.js
    │   │   ├── dashboardRoutes.js
    │   │   ├── experimentRoutes.js
    │   │   └── compareRoutes.js
    │   │
    │   ├── middleware/
    │   │   ├── auth.js
    │   │   └── rateLimit.middleware.js
    │   │
    │   └── services/
    │       └── gamification.js
    │
    ├── config/
    │   ├── db.js
    │   └── passport.js
    │
    └── models/
        ├── User.js
        ├── Experiment.js
        ├── Badge.js
        └── Activity.js
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/forge-path.git
cd forge-path
```

---

### 2. Install dependencies

```bash
cd server
npm install
```

---

### 3. Setup environment variables

Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GITHUB_CLIENT_ID=your_github_client_id
```

---

### 4. Run the backend server

```bash
npm start
```

---

### 5. Run frontend

Open `client/login.html` using Live Server
OR deploy frontend on Vercel

---

## 🌐 Live Demo

 Frontend: https://forge-path.vercel.app
 Backend: https://forge-path-v3.onrender.com

---


## 🎯 Learning Outcomes

* Backend architecture design
* MongoDB data modeling & aggregation
* Secure authentication implementation
* Full-stack integration
* Real-world system design

---

## 👨‍💻 Team Members

* Himesh
* Ansh
* Pratham

---

## 📌 Conclusion

Forge Path is not just an experiment tracker — it is a complete system that enables structured learning, progress tracking, and continuous improvement for developers.

# 🚀 TaskFlow

### Full-Stack Task Management System

TaskFlow is a full-stack task management application built with **React, FastAPI, and MongoDB**.

The application provides separate dashboards for **Users and Administrators**, secure authentication using **Email/Password, Google OAuth, and GitHub OAuth**, and complete task management with role-based access control.

---

## 📌 Project Overview

TaskFlow is designed to simplify task assignment and tracking between administrators and users.

An administrator can create tasks, assign them to users, monitor task progress, and manage users.

Normal users can view only their assigned tasks and update their task status.

The application follows a **React → FastAPI → MongoDB** architecture.

---

# ✨ Features

## 🔐 Authentication

- Email & Password Registration
- Email & Password Login
- Google OAuth Login
- GitHub OAuth Login
- JWT Authentication
- HttpOnly Cookie Authentication
- OAuth State Validation
- GitHub PKCE
- Secure Logout

---

## 👤 User Features

Normal users can:

- View their dashboard
- View assigned tasks
- Search tasks
- Filter tasks
- View completed tasks
- Mark tasks as completed
- Move completed tasks back to pending
- Update profile
- Upload profile picture
- Change password
- Logout

Users **cannot**:

- Create tasks
- Edit tasks
- Delete tasks
- Assign tasks
- View other users' tasks
- Access the Admin Dashboard

---

## 👨‍💼 Admin Features

Administrators can:

- View all tasks
- Create tasks
- Assign tasks to users
- Edit tasks
- Delete tasks
- Update task status
- Search tasks
- Filter tasks
- View task statistics
- View registered users
- Manage profile
- Upload profile picture
- Change password
- Logout

---

# 🛠️ Technology Stack

| Layer             | Technology                  |
| ----------------- | --------------------------- |
| Frontend          | React                       |
| Language          | JavaScript                  |
| Styling           | CSS                         |
| Build Tool        | Vite                        |
| Backend           | FastAPI                     |
| Backend Language  | Python                      |
| Database          | MongoDB                     |
| Database Driver   | PyMongo                     |
| Authentication    | JWT                         |
| Password Hashing  | bcrypt                      |
| OAuth             | Google OAuth + GitHub OAuth |
| HTTP Client       | HTTPX                       |
| API Documentation | Swagger / OpenAPI           |

---

# 🏗️ System Architecture

````text
                         ┌─────────────────────┐
                         │       USER          │
                         │                     │
                         │ Browser             │
                         └──────────┬──────────┘
                                    │
                                    │
                                    ▼
                    ┌───────────────────────────┐
                    │      React Frontend       │
                    │                           │
                    │  Login / Register         │
                    │  User Dashboard           │
                    │  Admin Dashboard          │
                    │  Tasks / Settings         │
                    └─────────────┬─────────────┘
                                  │
                                  │ REST API
                                  │ HTTP Requests
                                  ▼
                    ┌───────────────────────────┐
                    │      FastAPI Backend      │
                    │                           │
                    │ Authentication            │
                    │ Authorization / RBAC       │
                    │ Task Management            │
                    │ User Management            │
                    │ Profile Management         │
                    │ Google OAuth               │
                    │ GitHub OAuth               │
                    └─────────────┬─────────────┘
                                  │
                                  │ PyMongo
                                  ▼
                    ┌───────────────────────────┐
                    │          MongoDB          │
                    │                           │
                    │       users collection    │
                    │       tasks collection    │
                    └───────────────────────────┘


##Authentication Flow

User Login
    ↓
FastAPI validates authentication
    ↓
User verified
    ↓
JWT generated
    ↓
JWT stored in HttpOnly Cookie
    ↓
Browser sends cookie automatically
    ↓
FastAPI validates JWT
    ↓
Current user identified
    ↓
Role checked
    ↓
User Dashboard / Admin Dashboard


👥 Role-Based Access Control
                    ┌───────────────┐
                    │ Authenticated │
                    │     User      │
                    └───────┬───────┘
                            │
                            ▼
                     ┌─────────────┐
                     │ Check Role  │
                     └──────┬──────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
              role=user            role=admin
                 │                     │
                 ▼                     ▼
        ┌────────────────┐    ┌────────────────┐
        │ User Dashboard │    │ Admin Dashboard│
        └────────────────┘    └────────────────┘

📁 Project Structure

TaskFlow/
│
├── README.md
├── .gitignore
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   │
│   │   ├── components/
│   │   │   │
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskModal.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── package-lock.json
│
└── backend/
    │
    ├── routes/
    │   ├── auth.py
    │   ├── social_auth.py
    │   ├── tasks.py
    │   ├── users.py
    │   └── profile.py
    │
    ├── auth.py
    ├── database.py
    ├── models.py
    ├── schemas.py
    ├── main.py
    ├── create_admin.py
    ├── requirements.txt
    └── .env.example


🔄 Task Management Flow

                    ┌────────────────┐
                    │     Admin      │
                    └───────┬────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │ Create Task    │
                    └───────┬────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │ Assign User    │
                    └───────┬────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │    MongoDB     │
                    │     Task       │
                    └───────┬────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │ User Dashboard │
                    └───────┬────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │ View Task      │
                    └───────┬────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │ Update Status  │
                    └───────┬────────┘
                            │
                            ▼
                    ┌────────────────┐
                    │    MongoDB     │
                    └────────────────┘



📌 Final Project Flow
                         TASKFLOW
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
          Email          Google         GitHub
          Login           OAuth          OAuth
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                         FastAPI
                            │
                            ▼
                    JWT HttpOnly Cookie
                            │
                            ▼
                      Role Validation
                       /          \
                      /            \
                     ▼              ▼
                  USER            ADMIN
                    │                │
                    ▼                ▼
             User Dashboard    Admin Dashboard
                    │                │
                    ▼                ▼
             View Tasks        Create Tasks
             Update Status     Assign Tasks
                              Edit Tasks
                              Delete Tasks
                                   │
                                   ▼
                                MongoDB


 ---

# ⚙️ How to Run the Project

Follow the steps below to run TaskFlow locally.

## 📋 Prerequisites

Make sure the following are installed on your system:

- Python 3.10+
- Node.js 18+
- npm
- MongoDB
- Git

Check the installed versions:

```bash
python --version
node --version
npm --version
git --version


🚀 How to Run Backend:___

cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload

🚀 How to Run frontend:___
cd frontend
npm install
npm run dev
````

<div align="center">

# 🚀 Team Task Manager

### Real-Time Collaborative Project Management Platform

[![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**A full-stack, real-time task management application built with modern technologies.**

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Installation](#-installation)

</div>

---

## 📋 Overview

**Team Task Manager** is a production-ready, full-stack web application that enables teams to collaborate on projects in real-time. Inspired by tools like Trello and Monday.com, this application demonstrates advanced software engineering practices including:

- 🔄 **Real-Time Synchronization** - Instant updates across all connected clients using WebSockets
- 🔐 **Secure Authentication** - JWT-based auth with protected routes and role-based access
- 🎨 **Modern UI/UX** - Responsive design with Dark/Light mode and smooth animations
- 📦 **Clean Architecture** - Modular, scalable codebase following industry best practices

---

## ✨ Key Features

### 🔐 Authentication & Security
- JWT-based authentication with secure token management
- Automatic token refresh and session management
- Protected routes with Angular Guards
- Role-based access control (Owner/Member permissions)

### 📊 Kanban Board
- **Drag & Drop** functionality using Angular CDK
- Three-column layout: TODO → IN PROGRESS → DONE
- Real-time position updates across all clients
- Visual priority indicators (Low/Medium/High)

### ⚡ Real-Time Collaboration
- WebSocket integration with Socket.IO
- Instant task updates without page refresh
- Automatic reconnection handling
- Room-based broadcasting for efficient data sync

### 🎨 User Experience
- Dark/Light mode with persistent preferences
- Fully responsive design (Mobile, Tablet, Desktop)
- Smooth CSS animations and transitions
- Intuitive task management with labels and priorities

### 📅 Additional Modules
- **Calendar View** - Visualize tasks and deadlines
- **Project Management** - Organize boards into projects
- **User Profiles** - Customizable user settings

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Angular 18** | Modern SPA framework with Standalone Components |
| **Angular Signals** | Reactive state management |
| **Angular CDK** | Drag & Drop functionality |
| **RxJS** | Reactive programming and async operations |
| **Socket.IO Client** | Real-time WebSocket communication |
| **CSS3** | Custom styling with CSS Variables for theming |

### Backend
| Technology | Purpose |
|------------|---------|
| **NestJS** | Enterprise-grade Node.js framework |
| **MongoDB + Mongoose** | NoSQL database with ODM |
| **Passport.js** | Authentication middleware |
| **JWT** | Stateless token-based authentication |
| **Socket.IO** | Bi-directional real-time communication |
| **bcrypt** | Secure password hashing |

### DevOps & Tools
| Technology | Purpose |
|------------|---------|
| **TypeScript** | Type-safe development |
| **Render/Vercel** | Cloud deployment |
| **MongoDB Atlas** | Cloud database hosting |
| **Git** | Version control |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Angular 18)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Features  │  │    Core     │  │        Shared           │  │
│  │  ─────────  │  │  ─────────  │  │     ───────────         │  │
│  │  • Auth     │  │  • Guards   │  │  • Header Component     │  │
│  │  • Boards   │  │  • Services │  │  • Dialog Components    │  │
│  │  • Tasks    │  │  • Models   │  │  • Reusable UI          │  │
│  │  • Calendar │  │  • HTTP     │  │                         │  │
│  │  • Projects │  │    Intercep │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTP REST + WebSocket
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       SERVER (NestJS)                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Modules   │  │  Gateway    │  │       Security          │  │
│  │  ─────────  │  │  ─────────  │  │     ───────────         │  │
│  │  • Auth     │  │  • Socket.IO│  │  • JWT Strategy         │  │
│  │  • Boards   │  │  • Events   │  │  • Local Strategy       │  │
│  │  • Tasks    │  │  • Rooms    │  │  • Guards               │  │
│  │  • Calendar │  │             │  │  • Decorators           │  │
│  │  • Projects │  │             │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                           Mongoose
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                          │
├─────────────────────────────────────────────────────────────────┤
│     Users    │    Boards    │    Tasks    │   Calendar Events   │
└─────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
TeamTaskManager/
├── client/                    # Angular Frontend
│   └── src/
│       └── app/
│           ├── core/          # Guards, Interceptors, Services, Models
│           ├── features/      # Feature Modules (Auth, Boards, Tasks, etc.)
│           └── shared/        # Reusable Components
│
├── server/                    # NestJS Backend
│   └── src/
│       ├── auth/             # Authentication Module
│       ├── boards/           # Boards CRUD Module
│       ├── tasks/            # Tasks CRUD Module
│       ├── calendar/         # Calendar Module
│       ├── projects/         # Projects Module
│       └── app.gateway.ts    # WebSocket Gateway
│
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Quick Start

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/TeamTaskManager.git
cd TeamTaskManager
```

**2. Setup Backend**
```bash
cd server
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

`.env` configuration:
```env
PORT=3000
JWT_SECRET=your-secure-secret-key
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb://localhost:27017/teamtaskmanager
```

**3. Setup Frontend**
```bash
cd client
npm install
```

**4. Run the Application**

```bash
# Terminal 1 - Backend
cd server
npm run start:dev

# Terminal 2 - Frontend
cd client
ng serve
```

**5. Access the Application**
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000`

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| GET | `/auth/profile` | Get current user profile |

### Boards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/boards` | Get all user boards |
| GET | `/boards/:id` | Get specific board |
| POST | `/boards` | Create new board |
| PATCH | `/boards/:id` | Update board |
| DELETE | `/boards/:id` | Delete board |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks?boardId=:id` | Get board tasks |
| POST | `/tasks` | Create new task |
| PATCH | `/tasks/:id` | Update task |
| PATCH | `/tasks/:id/move` | Move task (Drag & Drop) |
| DELETE | `/tasks/:id` | Delete task |

### WebSocket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| `join-board` | Client → Server | Join board room |
| `leave-board` | Client → Server | Leave board room |
| `task-update` | Server → Client | Task created/updated/deleted |
| `board-update` | Server → Client | Board updated |

---

## 🎯 Technical Highlights

This project demonstrates proficiency in:

- **Full-Stack Development** - End-to-end implementation from database to UI
- **Real-Time Applications** - WebSocket implementation for live collaboration
- **Modern Angular** - Signals, Standalone Components, and reactive patterns
- **RESTful API Design** - Clean, documented API endpoints
- **Authentication & Security** - JWT implementation with best practices
- **Database Design** - MongoDB schema design with relationships
- **Clean Code** - Modular architecture, separation of concerns
- **TypeScript** - Strong typing throughout the entire stack

---

## 🔮 Future Enhancements

- [ ] Comments on tasks
- [ ] File attachments
- [ ] Due dates with reminders
- [ ] Push notifications
- [ ] Analytics dashboard
- [ ] Export to PDF/Excel
- [ ] Third-party integrations (Slack, GitHub)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**⭐ If you found this project interesting, please consider giving it a star!**

</div>

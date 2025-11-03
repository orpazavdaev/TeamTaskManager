# 🧠 Team Task Manager - מערכת ניהול משימות חכמה לצוותים

מערכת ניהול משימות מלאה עם תכונות מתקדמות של Real-Time Collaboration, Drag & Drop, ו-Authentication מלא.

## 🎯 מה זה?

אפליקציה לניהול משימות בסגנון Trello/Monday.com אבל בגרסה קלה, נקייה ומותאמת אישית, עם:

- ✅ JWT Authentication (התחברות/הרשמה)
- ✅ Kanban Board עם Drag & Drop
- ✅ Real-Time Updates באמצעות WebSockets
- ✅ Dark/Light Mode
- ✅ State Management עם Angular Signals

## 🏗️ טכנולוגיות

### Backend

- **NestJS** - Framework Node.js מודרני
- **MongoDB** - מסד נתונים NoSQL
- **JWT** - Authentication
- **Socket.IO** - Real-Time Communication
- **Passport** - Authentication Strategies

### Frontend

- **Angular 18** - Framework מודרני עם Standalone Components
- **Angular CDK Drag & Drop** - Drag & Drop פונקציונליות
- **Socket.IO Client** - חיבור Real-Time
- **Angular Signals** - State Management מובנה
- **RxJS** - Reactive Programming

## 📁 מבנה הפרויקט

```
teamtaskmanager/
├── server/              # Backend (NestJS)
│   ├── src/
│   │   ├── auth/       # Authentication Module
│   │   ├── boards/     # Boards Management
│   │   ├── tasks/      # Tasks Management
│   │   └── main.ts     # Entry Point
│   └── package.json
│
└── client/             # Frontend (Angular)
    └── src/
        └── app/
            ├── core/           # Core Services, Guards, Models
            ├── features/       # Feature Modules
            │   ├── auth/      # Login/Register
            │   ├── boards/    # Boards List & Detail
            │   └── tasks/     # Task Management
            └── shared/        # Shared Components
```

## 🚀 התקנה והרצה

### דרישות מקדימות

- Node.js 18+
- MongoDB (מותקן או Atlas)
- npm או yarn

### הגדרת Backend

```bash
cd server
npm install

# יצירת קובץ .env
cp .env.example .env
# ערוך את .env והוסף את המחרוזות המתאימות

# הרץ את השרת
npm run start:dev
```

השרת יעלה על `http://localhost:3000`

**קובץ .env צריך לכלול:**

```env
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb://localhost:27017/teamtaskmanager
```

### הגדרת Frontend

```bash
cd client
npm install

# הרץ את האפליקציה
ng serve
```

האפליקציה תעלה על `http://localhost:4200`

## 📚 API Endpoints

### Authentication

- `POST /auth/register` - הרשמה
- `POST /auth/login` - התחברות
- `GET /auth/profile` - פרופיל משתמש (מוגן)

### Boards

- `GET /boards` - קבלת כל הלוחות
- `GET /boards/:id` - קבלת לוח ספציפי
- `POST /boards` - יצירת לוח חדש
- `PATCH /boards/:id` - עדכון לוח
- `DELETE /boards/:id` - מחיקת לוח

### Tasks

- `GET /tasks?boardId=:id` - קבלת כל המשימות של לוח
- `GET /tasks/:id` - קבלת משימה ספציפית
- `POST /tasks` - יצירת משימה חדשה
- `PATCH /tasks/:id` - עדכון משימה
- `PATCH /tasks/:id/move` - הזזת משימה (Drag & Drop)
- `DELETE /tasks/:id` - מחיקת משימה

## 🔌 WebSocket Events

### Client → Server

- `join-board` - הצטרפות ללוח
- `leave-board` - עזיבת לוח

### Server → Client

- `task-update` - עדכון משימה (create/update/delete)
- `board-update` - עדכון לוח (create/update/delete)

## ✨ תכונות

### 1. Authentication & Authorization

- ✅ הרשמה והתחברות עם JWT
- ✅ Guards להגנה על Routes
- ✅ Token נשמר ב-LocalStorage
- ✅ Auto-logout כשהטוקן פג תוקף

### 2. Boards Management

- ✅ יצירה, עריכה ומחיקה של לוחות
- ✅ הצגת כל הלוחות של המשתמש
- ✅ חיפוש לוחות
- ✅ הרשאות (Owner/Members)

### 3. Kanban Board

- ✅ 3 עמודות: TODO, IN PROGRESS, DONE
- ✅ Drag & Drop בין עמודות
- ✅ מיון אוטומטי בתוך עמודה
- ✅ עדכון Real-Time

### 4. Task Management

- ✅ יצירת משימה עם:
  - כותרת ותיאור
  - סטטוס
  - עדיפות (Low/Medium/High)
  - תגיות (Labels)
- ✅ עריכת משימות
- ✅ מחיקת משימות
- ✅ הצגה ויזואלית לפי עדיפות

### 5. Real-Time Collaboration

- ✅ עדכונים בזמן אמת לכל המשתמשים
- ✅ WebSocket connection אוטומטי
- ✅ Reconnection אוטומטי

### 6. UI/UX

- ✅ Dark/Light Mode עם שמירה ב-LocalStorage
- ✅ עיצוב מודרני ו-responsive
- ✅ אנימציות חלקות
- ✅ חווית משתמש מעולה

### 7. State Management

- ✅ Angular Signals לניהול State
- ✅ Reactive Forms עם Validation
- ✅ RxJS Observables

## 🔐 הרשאות

- **Owner** - בעל הלוח, יכול לערוך ולמחוק
- **Member** - משתמש עם גישה ללוח, יכול לצפות ולערוך משימות

## 📝 דוגמת שימוש

### יצירת לוח חדש

```typescript
boardsService
  .create({
    name: "My Project",
    description: "Project description",
    color: "#4285F4",
  })
  .subscribe((board) => {
    console.log("Board created:", board);
  });
```

### יצירת משימה

```typescript
tasksService
  .create({
    title: "New Task",
    description: "Task description",
    boardId: "board-id",
    priority: TaskPriority.HIGH,
    labels: ["Bug", "Urgent"],
  })
  .subscribe((task) => {
    console.log("Task created:", task);
  });
```

### הזזת משימה (Drag & Drop)

```typescript
tasksService
  .move(taskId, {
    status: TaskStatus.IN_PROGRESS,
    order: 0,
  })
  .subscribe((updatedTask) => {
    console.log("Task moved:", updatedTask);
  });
```

## 🛠️ פיתוח

### הרצת Backend בפיתוח

```bash
cd server
npm run start:dev  # עם hot-reload
```

### הרצת Frontend בפיתוח

```bash
cd client
ng serve  # עם hot-reload
```

### Build לייצור

```bash
# Backend
cd server
npm run build
npm start

# Frontend
cd client
ng build --configuration production
```

## 📦 תלות עיקריות

### Backend

- @nestjs/core, @nestjs/common
- @nestjs/mongoose
- @nestjs/jwt, @nestjs/passport
- @nestjs/websockets, socket.io
- mongoose
- bcrypt

### Frontend

- @angular/core, @angular/common
- @angular/cdk
- socket.io-client
- rxjs

## 🎨 עיצוב

האפליקציה משתמשת ב:

- CSS Variables לנושאים (Dark/Light Mode)
- Grid Layout ל-Kanban Board
- Flexbox לLayout
- CSS Transitions לאנימציות

## 🔄 מה הלאה?

תכונות אפשריות לעתיד:

- [ ] הערות על משימות (Comments)
- [ ] קבצים מצורפים
- [ ] תאריכי יעד (Due Dates)
- [ ] התראות (Notifications)
- [ ] Dashboard עם סטטיסטיקות
- [ ] Export ל-PDF/Excel
- [ ] Integration עם כלים נוספים

## 👨‍💻 פיתוח

פרויקט זה נבנה עם:

- **NestJS** - עבור Backend חזק ומודולרי
- **Angular 18** - עבור Frontend מודרני
- **MongoDB** - עבור אחסון גמיש
- **Socket.IO** - עבור Real-Time Communication

## 📄 רישיון

פרויקט זה הוא Open Source.

---

**נהנית מהפרויקט? ⭐ תן כוכב!**

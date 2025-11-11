# הסבר מפורט על הקוד - Team Task Manager

## 📁 מבנה הפרויקט

הפרויקט מחולק לשני חלקים עיקריים:

- **Client** (Frontend) - Angular application
- **Server** (Backend) - NestJS application

---

## 🎨 CLIENT (Angular Frontend)

### 📄 קבצים בסיסיים

#### 1. `src/index.html`

**מה זה?** הקובץ הראשי של HTML - נקודת הכניסה של האפליקציה.

**מה קורה כאן?**

- הגדרות בסיסיות של HTML (charset, viewport)
- הגדרת favicon
- `<app-root></app-root>` - כאן Angular יטען את האפליקציה

**למה זה חשוב?** זה הקובץ הראשון שהדפדפן טוען.

---

#### 2. `src/main.ts`

**מה זה?** נקודת הכניסה של Angular - הקובץ שמתחיל את האפליקציה.

**מה קורה כאן?**

```typescript
bootstrapApplication(App, appConfig);
```

- `bootstrapApplication` - פונקציה של Angular שמתחילה את האפליקציה
- `App` - הקומפוננט הראשי (app.ts)
- `appConfig` - ההגדרות של האפליקציה (app.config.ts)

**למה זה חשוב?** זה הקובץ הראשון ש-Angular מריץ.

---

#### 3. `src/environments/environment.ts` ו-`environment.prod.ts`

**מה זה?** קבצי הגדרות סביבה - משתנים ששונים בין development ל-production.

**מה קורה כאן?**

- `environment.ts` - לסביבת פיתוח (localhost)
  - `apiUrl: 'http://localhost:3001'` - השרת המקומי
- `environment.prod.ts` - לסביבת production (Vercel)
  - `apiUrl: 'https://teamtaskmanager-mrac.onrender.com'` - השרת ב-Render

**למה זה חשוב?** מאפשר להשתמש בכתובות שונות לפי הסביבה.

---

#### 4. `src/app/app.config.ts`

**מה זה?** קובץ הגדרות גלובליות של האפליקציה.

**מה קורה כאן?**

```typescript
providers: [
  provideBrowserGlobalErrorListeners(), // טיפול בשגיאות גלובליות
  provideZoneChangeDetection(), // זיהוי שינויים ב-Angular
  provideRouter(routes), // ניתוב (routing)
  provideHttpClient(
    withInterceptors([
      // HTTP client עם interceptors
      authInterceptor, // מוסיף token לכל בקשה
      errorInterceptor, // מטפל בשגיאות
    ])
  ),
  provideAnimations(), // אנימציות
];
```

**למה זה חשוב?** מגדיר את כל השירותים הגלובליים שהאפליקציה משתמשת בהם.

---

#### 5. `src/app/app.ts`

**מה זה?** הקומפוננט הראשי של האפליקציה.

**מה קורה כאן?**

```typescript
export class App implements OnInit {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  ngOnInit(): void {
    this.authService.checkAuth(); // בודק אם המשתמש מחובר
  }
}
```

**מה זה עושה?**

- `inject(AuthService)` - מזריק את שירות האימות
- `inject(ThemeService)` - מזריק את שירות הערכת נושא
- `checkAuth()` - בודק אם יש token שמור (משתמש מחובר)

**למה זה חשוב?** זה הקומפוננט הראשי שמופיע בכל דף.

---

#### 6. `src/app/app.html`

**מה זה?** התבנית (template) של הקומפוננט הראשי.

**מה קורה כאן?**

```html
<app-header></app-header>
<!-- Header עם תפריט ניווט -->
<router-outlet></router-outlet>
<!-- כאן יופיעו הקומפוננטים לפי הניתוב -->
```

**למה זה חשוב?** מגדיר את המבנה הבסיסי של כל דף.

---

#### 7. `src/app/app.routes.ts`

**מה זה?** קובץ הניתוב (routing) - מגדיר איזה קומפוננט יופיע בכל URL.

**מה קורה כאן?**

```typescript
{
  path: 'projects',                    // URL: /projects
  loadComponent: () => import(...),    // טוען את הקומפוננט רק כשיש צורך
  canActivate: [authGuard],           // דורש התחברות
}
```

**הנתיבים:**

- `/auth` - דפי התחברות/הרשמה (loginGuard - רק אם לא מחובר)
- `/projects` - רשימת פרויקטים (authGuard - רק אם מחובר)
- `/projects/:id` - פרטי פרויקט (authGuard)
- `/projects/:projectId/boards/:id` - פרטי בורד (authGuard)
- `/boards` - רשימת בורדים (authGuard)
- `/profile` - פרופיל משתמש (authGuard)
- `/calendar` - לוח שנה (authGuard)
- `/` - מפנה ל-`/projects`

**למה זה חשוב?** מגדיר את המבנה של האפליקציה ואיזה דף יופיע בכל URL.

---

## 🔐 CORE - Guards (שומרי נתיב)

### `src/app/core/guards/auth.guard.ts`

**מה זה?** Guard שמגן על נתיבים - בודק אם המשתמש מחובר.

**מה קורה כאן?**

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  if (authService.isAuthenticated()) {
    return true; // מותר להיכנס
  }
  // מפנה לדף התחברות
  inject(Router).navigate(["/auth/login"], {
    queryParams: { returnUrl: state.url },
  });
  return false; // אסור להיכנס
};
```

**למה זה חשוב?** מונע גישה לדפים שדורשים התחברות.

---

## 🔄 CORE - Interceptors (מתערבים)

### `src/app/core/interceptors/auth.interceptor.ts`

**מה זה?** Interceptor שמוסיף את ה-token לכל בקשה HTTP.

**מה קורה כאן?**

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`, // מוסיף את ה-token
      },
    });
  }
  return next(req);
};
```

**למה זה חשוב?** השרת יודע מי המשתמש בכל בקשה.

---

### `src/app/core/interceptors/error.interceptor.ts`

**מה זה?** Interceptor שמטפל בשגיאות HTTP.

**מה קורה כאן?**

- אם יש שגיאת 401 (לא מורשה) - מפנה לדף התחברות
- אם יש שגיאת 403 (אסור) - מציג הודעת שגיאה
- אם יש שגיאה אחרת - מציג הודעת שגיאה כללית

**למה זה חשוב?** מטפל בשגיאות בצורה אחידה בכל האפליקציה.

---

## 📦 CORE - Models (מודלים)

המודלים מגדירים את המבנה של הנתונים.

### `src/app/core/models/user.model.ts`

**מה זה?** מגדיר את מבנה המשתמש.

**מה יש כאן?**

- `_id` - מזהה ייחודי
- `name` - שם
- `email` - אימייל
- `password` - סיסמה (רק ל-DTOs)

---

### `src/app/core/models/project.model.ts`

**מה זה?** מגדיר את מבנה הפרויקט.

**מה יש כאן?**

- `_id` - מזהה
- `name` - שם
- `description` - תיאור
- `ownerId` - בעלים
- `members` - חברים
- `isPublic` - האם ציבורי
- `activeBoardId` - הבורד הפעיל
- `color` - צבע

---

### `src/app/core/models/board.model.ts`

**מה זה?** מגדיר את מבנה הבורד.

**מה יש כאן?**

- `_id` - מזהה
- `name` - שם
- `projectId` - הפרויקט
- `ownerId` - בעלים
- `members` - חברים
- `color` - צבע

---

### `src/app/core/models/task.model.ts`

**מה זה?** מגדיר את מבנה המשימה.

**מה יש כאן?**

- `_id` - מזהה
- `title` - כותרת
- `description` - תיאור
- `status` - סטטוס (TODO, IN_PROGRESS, DONE)
- `priority` - עדיפות
- `boardId` - הבורד
- `assignedTo` - מוקצה ל-
- `dueDate` - תאריך יעד

---

### `src/app/core/models/calendar-event.model.ts`

**מה זה?** מגדיר את מבנה אירוע הלוח שנה.

**מה יש כאן?**

- `_id` - מזהה
- `title` - כותרת
- `date` - תאריך התחלה
- `endDate` - תאריך סיום
- `isAllDay` - כל היום
- `type` - סוג אירוע
- `projectId` - הפרויקט
- `boardId` - הבורד
- `taskId` - המשימה

---

## 🔧 CORE - Services (שירותים)

השירותים מטפלים בתקשורת עם השרת.

### `src/app/core/services/auth.service.ts`

**מה זה?** שירות האימות - מטפל בהתחברות, הרשמה, וניהול משתמש.

**מה יש כאן?**

- `login()` - התחברות
- `register()` - הרשמה
- `logout()` - התנתקות
- `checkAuth()` - בדיקה אם מחובר
- `getToken()` - קבלת token
- `user` - signal של המשתמש הנוכחי
- `isAuthenticated` - computed signal שמחזיר true/false

**איך זה עובד?**

- שומר את ה-token ב-localStorage
- שומר את פרטי המשתמש ב-signal
- כל שינוי ב-user מעדכן את isAuthenticated

---

### `src/app/core/services/projects.service.ts`

**מה זה?** שירות פרויקטים - מטפל בכל הפעולות על פרויקטים.

**מה יש כאן?**

- `getAll()` - קבלת כל הפרויקטים
- `getById()` - קבלת פרויקט לפי ID
- `create()` - יצירת פרויקט
- `update()` - עדכון פרויקט
- `delete()` - מחיקת פרויקט
- `searchPublicProjects()` - חיפוש פרויקטים ציבוריים
- `addMember()` - הוספת חבר
- `removeMember()` - הסרת חבר

**איך זה עובד?**

- כל פונקציה עושה HTTP request לשרת
- מחזירה Observable (אסינכרוני)
- הקומפוננטים עושים subscribe כדי לקבל את הנתונים

---

### `src/app/core/services/boards.service.ts`

**מה זה?** שירות בורדים - מטפל בכל הפעולות על בורדים.

**מה יש כאן?**

- `getAll()` - קבלת כל הבורדים
- `getById()` - קבלת בורד לפי ID
- `getByProject()` - קבלת בורדים לפי פרויקט
- `create()` - יצירת בורד
- `update()` - עדכון בורד
- `delete()` - מחיקת בורד

---

### `src/app/core/services/tasks.service.ts`

**מה זה?** שירות משימות - מטפל בכל הפעולות על משימות.

**מה יש כאן?**

- `getByBoard()` - קבלת משימות לפי בורד
- `getById()` - קבלת משימה לפי ID
- `create()` - יצירת משימה
- `update()` - עדכון משימה
- `delete()` - מחיקת משימה
- `move()` - העברת משימה בין סטטוסים

---

### `src/app/core/services/calendar.service.ts`

**מה זה?** שירות לוח שנה - מטפל בכל הפעולות על אירועים.

**מה יש כאן?**

- `getAll()` - קבלת כל האירועים
- `getById()` - קבלת אירוע לפי ID
- `create()` - יצירת אירוע
- `update()` - עדכון אירוע
- `delete()` - מחיקת אירוע

---

### `src/app/core/services/websocket.service.ts`

**מה זה?** שירות WebSocket - מטפל בעדכונים בזמן אמת.

**מה יש כאן?**

- `connect()` - התחברות לשרת
- `disconnect()` - התנתקות
- `onTaskUpdate()` - מאזין לעדכוני משימות
- `onBoardUpdate()` - מאזין לעדכוני בורדים
- `onProjectUpdate()` - מאזין לעדכוני פרויקטים
- `onCalendarEventUpdate()` - מאזין לעדכוני אירועים

**איך זה עובד?**

- משתמש ב-Socket.IO
- מתחבר לשרת WebSocket
- מקבל עדכונים בזמן אמת כשמשהו משתנה

---

### `src/app/core/services/theme.service.ts`

**מה זה?** שירות ערכת נושא - מטפל במעבר בין light/dark mode.

**מה יש כאן?**

- `toggleTheme()` - מעבר בין מצבים
- `isDarkMode()` - בדיקה אם במצב כהה
- שומר את ההעדפה ב-localStorage

---

### `src/app/core/services/users.service.ts`

**מה זה?** שירות משתמשים - מטפל בקבלת רשימת משתמשים.

**מה יש כאן?**

- `getAll()` - קבלת כל המשתמשים
- משמש להוספת חברים לפרויקטים

---

## 🎨 FEATURES - Components (קומפוננטים)

### AUTH (אימות)

#### `src/app/features/auth/login/login.component.ts`

**מה זה?** קומפוננט התחברות.

**מה יש כאן?**

- Form עם email ו-password
- `login()` - שולח בקשה לשרת
- אחרי התחברות מוצלחת - מפנה ל-`/projects`

---

#### `src/app/features/auth/register/register.component.ts`

**מה זה?** קומפוננט הרשמה.

**מה יש כאן?**

- Form עם name, email, password
- `register()` - שולח בקשה לשרת
- אחרי הרשמה מוצלחת - מפנה ל-`/projects`

---

### PROJECTS (פרויקטים)

#### `src/app/features/projects/projects-list/projects-list.component.ts`

**מה זה?** קומפוננט רשימת פרויקטים.

**מה יש כאן?**

- `myProjects` - signal של הפרויקטים שלי
- `sharedProjects` - signal של הפרויקטים המשותפים
- `publicProjects` - signal של פרויקטים ציבוריים
- `loadProjects()` - טוען את הפרויקטים
- `createProject()` - יוצר פרויקט חדש
- `searchPublicProjects()` - מחפש פרויקטים ציבוריים

**איך זה עובד?**

- בטעינה ראשונית - טוען את כל הפרויקטים
- מפריד בין "שלי" ל"משותפים"
- מאפשר חיפוש פרויקטים ציבוריים

---

#### `src/app/features/projects/project-detail/project-detail.component.ts`

**מה זה?** קומפוננט פרטי פרויקט.

**מה יש כאן?**

- `project` - signal של הפרויקט
- `boards` - signal של הבורדים
- `loadProject()` - טוען את הפרויקט
- `loadBoards()` - טוען את הבורדים
- `createBoard()` - יוצר בורד חדש
- `addMember()` - מוסיף חבר
- `removeMember()` - מסיר חבר

---

### BOARDS (בורדים)

#### `src/app/features/boards/boards-list/boards-list.component.ts`

**מה זה?** קומפוננט רשימת בורדים.

**מה יש כאן?**

- `boards` - signal של הבורדים
- `loadBoards()` - טוען את הבורדים
- `createBoard()` - יוצר בורד חדש

---

#### `src/app/features/boards/board-detail/board-detail.component.ts`

**מה זה?** קומפוננט פרטי בורד.

**מה יש כאן?**

- `board` - signal של הבורד
- `tasks` - signal של המשימות
- `loadBoard()` - טוען את הבורד
- `loadTasks()` - טוען את המשימות
- `openTaskModal()` - פותח מודל ליצירת/עריכת משימה
- `moveTask()` - מעביר משימה בין סטטוסים

**איך זה עובד?**

- משתמש ב-CDK Drag & Drop להעברת משימות
- מאזין לעדכונים בזמן אמת דרך WebSocket

---

### TASKS (משימות)

#### `src/app/features/tasks/task-modal/task-modal.component.ts`

**מה זה?** קומפוננט מודל משימה.

**מה יש כאן?**

- Form ליצירת/עריכת משימה
- שדות: title, description, status, priority, assignedTo, dueDate
- `save()` - שומר את המשימה
- `delete()` - מוחק את המשימה

---

### PROFILE (פרופיל)

#### `src/app/features/profile/profile.component.ts`

**מה זה?** קומפוננט פרופיל משתמש.

**מה יש כאן?**

- `tasks` - signal של כל המשימות של המשתמש
- `loadTasks()` - טוען את כל המשימות מכל הפרויקטים
- `navigateToBoard()` - מנווט לבורד של משימה

---

### CALENDAR (לוח שנה)

#### `src/app/features/calendar/calendar.component.ts`

**מה זה?** קומפוננט לוח שנה.

**מה יש כאן?**

- `events` - signal של האירועים
- `currentMonth` - signal של החודש הנוכחי
- `loadEvents()` - טוען את האירועים
- `createEvent()` - יוצר אירוע חדש
- `updateEvent()` - מעדכן אירוע
- `deleteEvent()` - מוחק אירוע

**איך זה עובד?**

- מציג לוח שנה חודשי
- כל יום מציג את האירועים שלו
- מאפשר יצירה/עריכה/מחיקה של אירועים

---

## 🧩 SHARED - Components (קומפוננטים משותפים)

### `src/app/shared/components/header/header.component.ts`

**מה זה?** Header עם תפריט ניווט.

**מה יש כאן?**

- תפריט ניווט (Projects, Calendar, Profile)
- כפתור התחברות/התנתקות
- Dropdown עם שם המשתמש (Profile, Logout)

---

### `src/app/shared/components/input-dialog/input-dialog.component.ts`

**מה זה?** דיאלוג קלט - לשאילת שם (לפרויקט/בורד).

**מה יש כאן?**

- Form עם שדה קלט
- אפשרות לבחור public/private
- כפתורי Confirm/Cancel

---

### `src/app/shared/components/select-dialog/select-dialog.component.ts`

**מה זה?** דיאלוג בחירה - לבחירת משתמש.

**מה יש כאן?**

- רשימת משתמשים לבחירה
- אפשרות לסמן משתמשים כ-disabled

---

### `src/app/shared/components/confirm-dialog/confirm-dialog.component.ts`

**מה זה?** דיאלוג אישור - לאישור פעולות.

**מה יש כאן?**

- הודעת אישור
- כפתורי Confirm/Cancel

---

## 🎯 סיכום - Client

**המבנה הכללי:**

1. **main.ts** - מתחיל את האפליקציה
2. **app.config.ts** - הגדרות גלובליות
3. **app.ts** - קומפוננט ראשי
4. **app.routes.ts** - ניתוב
5. **Guards** - הגנה על נתיבים
6. **Interceptors** - טיפול בבקשות HTTP
7. **Services** - תקשורת עם השרת
8. **Components** - ממשק המשתמש

**זרימת הנתונים:**

1. משתמש עושה פעולה → Component
2. Component קורא ל-Service
3. Service עושה HTTP request → Server
4. Server מחזיר תשובה → Service
5. Service מעדכן signal → Component
6. Component מעדכן את ה-UI

**Signals:**

- Angular Signals - מערכת reactive state management
- כל שינוי ב-signal מעדכן את ה-UI אוטומטית
- `signal()` - יוצר signal
- `computed()` - יוצר computed signal (תלוי ב-signals אחרים)

**CDK (Component Dev Kit):**

- **מה זה?** Angular CDK - ספרייה של Angular שמספקת כלים ופונקציונליות לבניית קומפוננטים
- **למה זה חשוב?** מאפשר ליצור פיצ'רים מתקדמים בלי לכתוב הכל מאפס
- **מה משתמשים בו בפרויקט?**
  - **CDK Drag & Drop** - להעברת משימות בין סטטוסים (TODO → IN_PROGRESS → DONE)
  - מאפשר למשוך (drag) משימה ולשחרר (drop) אותה בעמודה אחרת
- **איך זה עובד?**
  - `cdkDropList` - מגדיר אזור שאפשר לשחרר בו (כמו עמודת TODO)
  - `cdkDrag` - מגדיר אלמנט שאפשר למשוך (כמו כרטיס משימה)
  - `cdkDropListDropped` - event שקורה כשמשהו משוחרר
  - `transferArrayItem()` - מעביר משימה בין מערכים (בין סטטוסים)

---

## 🖥️ SERVER (NestJS Backend)

### 📄 קבצים בסיסיים

#### 1. `src/main.ts`

**מה זה?** נקודת הכניסה של השרת - הקובץ שמתחיל את השרת.

**מה קורה כאן?**

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS - מאפשר בקשות מה-Frontend
  app.enableCors({ ... });

  // Validation - בודק את הנתונים שנשלחים
  app.useGlobalPipes(new ValidationPipe({ ... }));

  // מאזין על פורט
  await app.listen(port);
}
```

**מה זה עושה?**

- `NestFactory.create(AppModule)` - יוצר את האפליקציה
- `enableCors()` - מאפשר בקשות מה-Frontend (Vercel)
- `useGlobalPipes()` - בודק את הנתונים שנשלחים (validation)
- `listen(port)` - מתחיל להאזין על פורט (3000 או מה שמוגדר)

**למה זה חשוב?** זה הקובץ הראשון ש-NestJS מריץ.

---

#### 2. `src/app.module.ts`

**מה זה?** המודול הראשי - מגדיר את כל המודולים של האפליקציה.

**מה קורה כאן?**

```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),           // משתני סביבה
    MongooseModule.forRoot(...),      // חיבור ל-MongoDB
    GatewayModule,                    // WebSocket
    AuthModule,                       // אימות
    BoardsModule,                     // בורדים
    TasksModule,                      // משימות
    ProjectsModule,                   // פרויקטים
    CalendarModule,                   // לוח שנה
  ],
})
```

**למה זה חשוב?** מגדיר את כל המודולים שהאפליקציה משתמשת בהם.

---

#### 3. `src/app.gateway.ts`

**מה זה?** WebSocket Gateway - מטפל בעדכונים בזמן אמת.

**מה קורה כאן?**

```typescript
@WebSocketGateway()
export class AppGateway {
  @WebSocketServer()
  server: Server;

  // כשמשהו משתנה - שולח עדכון לכל הלקוחות
  broadcastTaskUpdate(boardId, task, action) {
    this.server.to(`board-${boardId}`).emit("task-update", { action, task });
  }
}
```

**מה זה עושה?**

- `handleConnection()` - כשמשתמש מתחבר
- `handleDisconnect()` - כשמשתמש מתנתק
- `handleJoinBoard()` - כשמשתמש נכנס לבורד
- `broadcastTaskUpdate()` - שולח עדכון על משימה
- `broadcastBoardUpdate()` - שולח עדכון על בורד
- `broadcastProjectUpdate()` - שולח עדכון על פרויקט
- `broadcastCalendarEventUpdate()` - שולח עדכון על אירוע

**למה זה חשוב?** מאפשר עדכונים בזמן אמת - כשמישהו משנה משהו, כולם רואים את זה מיד.

---

## 🔐 AUTH (אימות)

### `src/auth/auth.module.ts`

**מה זה?** המודול של האימות - מגדיר את כל מה שקשור לאימות.

**מה יש כאן?**

- `AuthService` - הלוגיקה של האימות
- `AuthController` - ה-endpoints של האימות
- `JwtModule` - JWT tokens
- `PassportModule` - Passport strategies

---

### `src/auth/auth.service.ts`

**מה זה?** השירות של האימות - מטפל בהרשמה, התחברות, ואימות.

**מה יש כאן?**

- `register()` - הרשמה
  - בודק אם האימייל כבר קיים
  - מצפין את הסיסמה עם bcrypt
  - יוצר משתמש חדש
  - מחזיר JWT token
- `validateUser()` - אימות משתמש
  - בודק אם האימייל והסיסמה נכונים
  - משווה סיסמה מוצפנת
- `login()` - התחברות
  - בודק את האימייל והסיסמה
  - מחזיר JWT token

**איך זה עובד?**

- משתמש ב-bcrypt להצפנת סיסמאות
- משתמש ב-JWT ליצירת tokens
- ה-token מכיל את פרטי המשתמש (email, id, role)

---

### `src/auth/auth.controller.ts`

**מה זה?** Controller של האימות - מגדיר את ה-endpoints.

**מה יש כאן?**

- `POST /auth/register` - הרשמה
- `POST /auth/login` - התחברות
- `GET /auth/profile` - פרטי משתמש (דורש token)
- `GET /auth/users` - רשימת משתמשים (דורש token)

**איך זה עובד?**

- `@Controller("auth")` - כל ה-endpoints מתחילים ב-`/auth`
- `@UseGuards(JwtAuthGuard)` - דורש token
- `@Request() req` - מקבל את פרטי המשתמש מה-token

---

### `src/auth/schemas/user.schema.ts`

**מה זה?** Schema של משתמש - מגדיר את מבנה המשתמש ב-MongoDB.

**מה יש כאן?**

- `email` - אימייל (unique, required)
- `password` - סיסמה (required)
- `name` - שם (required)
- `role` - תפקיד (default: "member")

**למה זה חשוב?** מגדיר את המבנה של המשתמש ב-database.

---

### `src/auth/guards/jwt-auth.guard.ts`

**מה זה?** Guard שמגן על endpoints - בודק אם יש token תקין.

**מה קורה כאן?**

- קורא את ה-token מה-header
- בודק אם ה-token תקין
- אם תקין - מאפשר גישה
- אם לא - מחזיר 401 (Unauthorized)

**למה זה חשוב?** מגן על endpoints שדורשים התחברות.

---

### `src/auth/strategies/jwt.strategy.ts`

**מה זה?** Passport Strategy - מטפל באימות JWT tokens.

**מה קורה כאן?**

- קורא את ה-token
- מפענח את ה-token
- מחזיר את פרטי המשתמש

**למה זה חשוב?** מאפשר לזהות את המשתמש מה-token.

---

## 📦 PROJECTS (פרויקטים)

### `src/projects/projects.module.ts`

**מה זה?** המודול של פרויקטים.

**מה יש כאן?**

- `ProjectsService` - הלוגיקה
- `ProjectsController` - ה-endpoints
- `ProjectSchema` - ה-schema

---

### `src/projects/projects.service.ts`

**מה זה?** השירות של פרויקטים - מטפל בכל הפעולות על פרויקטים.

**מה יש כאן?**

- `create()` - יוצר פרויקט חדש
  - בודק הרשאות
  - יוצר פרויקט
  - שולח עדכון דרך WebSocket
- `findMyProjects()` - מוצא את הפרויקטים שלי
- `findSharedProjects()` - מוצא את הפרויקטים המשותפים
- `findOne()` - מוצא פרויקט לפי ID
  - בודק אם המשתמש בעלים או חבר
- `update()` - מעדכן פרויקט
  - בודק הרשאות (רק בעלים)
  - מעדכן את הפרויקט
  - שולח עדכון דרך WebSocket
- `delete()` - מוחק פרויקט
  - בודק הרשאות (רק בעלים)
  - מוחק את הפרויקט
  - שולח עדכון דרך WebSocket
- `searchPublicProjects()` - מחפש פרויקטים ציבוריים
- `addMemberToProject()` - מוסיף חבר לפרויקט
  - בודק הרשאות (רק בעלים)
- `removeMemberFromProject()` - מסיר חבר מפרויקט
  - בודק הרשאות (רק בעלים)

**איך זה עובד?**

- משתמש ב-Mongoose לעבודה עם MongoDB
- בודק הרשאות לפני כל פעולה
- שולח עדכונים דרך WebSocket

---

### `src/projects/projects.controller.ts`

**מה זה?** Controller של פרויקטים - מגדיר את ה-endpoints.

**מה יש כאן?**

- `POST /projects` - יוצר פרויקט
- `GET /projects` - מוצא את כל הפרויקטים (שלי + משותפים)
- `GET /projects/my-projects` - מוצא את הפרויקטים שלי
- `GET /projects/shared-projects` - מוצא את הפרויקטים המשותפים
- `GET /projects/public/search?q=...` - מחפש פרויקטים ציבוריים
- `GET /projects/:id` - מוצא פרויקט לפי ID
- `PATCH /projects/:id` - מעדכן פרויקט
- `DELETE /projects/:id` - מוחק פרויקט
- `POST /projects/:id/members` - מוסיף חבר
- `DELETE /projects/:id/members/:userId` - מסיר חבר

**איך זה עובד?**

- `@Controller("projects")` - כל ה-endpoints מתחילים ב-`/projects`
- `@UseGuards(JwtAuthGuard)` - דורש token
- `@Request() req` - מקבל את פרטי המשתמש

---

### `src/projects/schemas/project.schema.ts`

**מה זה?** Schema של פרויקט - מגדיר את מבנה הפרויקט ב-MongoDB.

**מה יש כאן?**

- `name` - שם (required)
- `description` - תיאור
- `ownerId` - בעלים (required)
- `members` - חברים (array)
- `boards` - בורדים (array)
- `activeBoardId` - הבורד הפעיל
- `color` - צבע (default: "#2A6F97")
- `isPublic` - האם ציבורי (default: false)
- `timestamps: true` - מוסיף `createdAt` ו-`updatedAt` אוטומטית

---

### `src/projects/dto/create-project.dto.ts`

**מה זה?** DTO (Data Transfer Object) - מגדיר את הנתונים שנשלחים ביצירת פרויקט.

**מה יש כאן?**

- `name` - שם (required, string)
- `description` - תיאור (optional, string)
- `members` - חברים (optional, array)
- `isPublic` - האם ציבורי (optional, boolean)

**למה זה חשוב?** בודק את הנתונים לפני שהם מגיעים ל-service.

---

### `src/projects/dto/update-project.dto.ts`

**מה זה?** DTO לעדכון פרויקט.

**מה יש כאן?**

- כל השדות הם optional
- משתמש ב-`PartialType` מ-NestJS

---

## 📋 BOARDS (בורדים)

### `src/boards/boards.service.ts`

**מה זה?** השירות של בורדים - מטפל בכל הפעולות על בורדים.

**מה יש כאן?**

- `create()` - יוצר בורד חדש
- `findAll()` - מוצא את כל הבורדים של המשתמש
- `findOne()` - מוצא בורד לפי ID
  - בודק אם המשתמש בעלים או חבר
  - או אם המשתמש חבר בפרויקט
- `update()` - מעדכן בורד
- `delete()` - מוחק בורד
- `findSharedBoards()` - מוצא בורדים משותפים

---

### `src/boards/boards.controller.ts`

**מה זה?** Controller של בורדים.

**מה יש כאן?**

- `POST /boards` - יוצר בורד
- `GET /boards` - מוצא את כל הבורדים
- `GET /boards/:id` - מוצא בורד לפי ID
- `PATCH /boards/:id` - מעדכן בורד
- `DELETE /boards/:id` - מוחק בורד

---

### `src/boards/schemas/board.schema.ts`

**מה זה?** Schema של בורד.

**מה יש כאן?**

- `name` - שם
- `projectId` - הפרויקט
- `ownerId` - בעלים
- `members` - חברים
- `color` - צבע

---

## ✅ TASKS (משימות)

### `src/tasks/tasks.service.ts`

**מה זה?** השירות של משימות - מטפל בכל הפעולות על משימות.

**מה יש כאן?**

- `create()` - יוצר משימה חדשה
- `findByBoard()` - מוצא משימות לפי בורד
- `findOne()` - מוצא משימה לפי ID
- `update()` - מעדכן משימה
- `delete()` - מוחק משימה
- `move()` - מעביר משימה בין סטטוסים

---

### `src/tasks/tasks.controller.ts`

**מה זה?** Controller של משימות.

**מה יש כאן?**

- `POST /tasks` - יוצר משימה
- `GET /tasks?boardId=...` - מוצא משימות לפי בורד
- `GET /tasks/:id` - מוצא משימה לפי ID
- `PATCH /tasks/:id` - מעדכן משימה
- `DELETE /tasks/:id` - מוחק משימה
- `PATCH /tasks/:id/move` - מעביר משימה

---

### `src/tasks/schemas/task.schema.ts`

**מה זה?** Schema של משימה.

**מה יש כאן?**

- `title` - כותרת
- `description` - תיאור
- `status` - סטטוס (TODO, IN_PROGRESS, DONE)
- `priority` - עדיפות (LOW, MEDIUM, HIGH)
- `boardId` - הבורד
- `assignedTo` - מוקצה ל-
- `dueDate` - תאריך יעד

---

## 📅 CALENDAR (לוח שנה)

### `src/calendar/calendar.service.ts`

**מה זה?** השירות של לוח שנה - מטפל בכל הפעולות על אירועים.

**מה יש כאן?**

- `create()` - יוצר אירוע חדש
- `findAll()` - מוצא את כל האירועים
- `findOne()` - מוצא אירוע לפי ID
- `update()` - מעדכן אירוע
- `remove()` - מוחק אירוע

---

### `src/calendar/calendar.controller.ts`

**מה זה?** Controller של לוח שנה.

**מה יש כאן?**

- `POST /calendar` - יוצר אירוע
- `GET /calendar` - מוצא את כל האירועים
- `GET /calendar/:id` - מוצא אירוע לפי ID
- `PATCH /calendar/:id` - מעדכן אירוע
- `DELETE /calendar/:id` - מוחק אירוע

---

### `src/calendar/schemas/calendar-event.schema.ts`

**מה זה?** Schema של אירוע לוח שנה.

**מה יש כאן?**

- `title` - כותרת
- `description` - תיאור
- `date` - תאריך התחלה
- `endDate` - תאריך סיום
- `startTime` - שעת התחלה
- `endTime` - שעת סיום
- `isAllDay` - כל היום
- `type` - סוג אירוע
- `projectId` - הפרויקט
- `boardId` - הבורד
- `taskId` - המשימה
- `color` - צבע

---

## 🎯 סיכום - Server

**המבנה הכללי:**

1. **main.ts** - מתחיל את השרת
2. **app.module.ts** - מגדיר את כל המודולים
3. **app.gateway.ts** - WebSocket לעדכונים בזמן אמת
4. **Modules** - כל מודול מכיל:
   - **Service** - הלוגיקה
   - **Controller** - ה-endpoints
   - **Schema** - מבנה ה-database
   - **DTOs** - בדיקת נתונים

**זרימת בקשה:**

1. Client שולח HTTP request → Controller
2. Controller קורא ל-Service
3. Service עובד עם MongoDB (Mongoose)
4. Service מחזיר תשובה → Controller
5. Controller מחזיר תשובה → Client
6. אם יש שינוי - Service שולח עדכון דרך WebSocket

**Guards:**

- `JwtAuthGuard` - בודק אם יש token תקין
- מגן על endpoints שדורשים התחברות

**DTOs:**

- `CreateXDto` - לבדיקת נתונים ביצירה
- `UpdateXDto` - לבדיקת נתונים בעדכון
- משתמש ב-class-validator לבדיקות

**Schemas:**

- מגדירים את מבנה ה-documents ב-MongoDB
- משתמשים ב-Mongoose decorators
- `@Prop()` - מגדיר שדה
- `timestamps: true` - מוסיף `createdAt` ו-`updatedAt`

---

## 🔄 זרימת נתונים מלאה

**דוגמה: יצירת פרויקט**

1. **Client (Angular):**

   - משתמש לוחץ על "Create Project"
   - `ProjectsListComponent.createProject()` נקרא
   - `ProjectsService.create()` שולח HTTP POST

2. **Server (NestJS):**

   - `ProjectsController.create()` מקבל את הבקשה
   - `JwtAuthGuard` בודק את ה-token
   - `ProjectsService.create()` יוצר את הפרויקט
   - `ProjectsService` שולח עדכון דרך `AppGateway`

3. **Database (MongoDB):**

   - הפרויקט נשמר ב-database

4. **WebSocket:**

   - כל הלקוחות המחוברים מקבלים עדכון
   - `WebSocketService.onProjectUpdate()` מעדכן את ה-UI

5. **Client (Angular):**
   - ה-UI מתעדכן אוטומטית
   - הפרויקט החדש מופיע ברשימה

---

## 📚 מושגים חשובים

**NestJS:**

- Framework ל-Node.js
- מבוסס על TypeScript
- משתמש ב-Dependency Injection
- מבנה מודולרי

**MongoDB:**

- NoSQL database
- משתמש ב-Mongoose (ODM)
- Documents במקום tables

**JWT:**

- JSON Web Token
- משמש לאימות
- מכיל פרטי משתמש

**WebSocket:**

- חיבור דו-כיווני
- עדכונים בזמן אמת
- Socket.IO

**DTOs:**

- Data Transfer Objects
- בודקים את הנתונים
- class-validator

**Guards:**

- מגנים על endpoints
- בודקים הרשאות
- NestJS Guards

**Interceptors:**

- מתערבים בבקשות
- מוסיפים headers
- מטפלים בשגיאות

**Signals:**

- Angular Signals
- Reactive state management
- עדכונים אוטומטיים

---

**זה הכל! 🎉**

עכשיו יש לך הבנה מלאה של כל הקוד בפרויקט.

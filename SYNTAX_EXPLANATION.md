# הסבר מפורט על הסינטקס - Team Task Manager

## 📚 מושגי יסוד

### Decorators (דקורטורים)

**מה זה?** פונקציות מיוחדות שמתחילות ב-`@` ומשנות את ההתנהגות של class, method, או property.

**איך זה עובד?**

- TypeScript/Angular/NestJS קוראים את ה-decorator לפני שהקוד רץ
- ה-decorator מוסיף metadata (מידע נוסף) לאובייקט

---

## 🎨 CLIENT (Angular) - סינטקס

### 1. `src/app/app.ts`

```typescript
import { Component, OnInit, inject } from "@angular/core";
```

**הסבר:**

- `import` - מייבא פונקציות/classes מ-module אחר
- `{ Component, OnInit, inject }` - מייבא את `Component`, `OnInit`, `inject` מ-`@angular/core`
- `@angular/core` - הספרייה הבסיסית של Angular

```typescript
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
```

**הסבר:**

- `@Component` - **Decorator** שמגדיר שזה Angular Component
  - `selector: 'app-root'` - השם ב-HTML (`<app-root></app-root>`)
  - `imports: [...]` - רשימת קומפוננטים/modules שצריך לייבא
  - `templateUrl` - קובץ ה-HTML של הקומפוננט
  - `styleUrl` - קובץ ה-CSS של הקומפוננט

```typescript
export class App implements OnInit {
```

**הסבר:**

- `export` - מייצא את ה-class כך שאפשר לייבא אותו מקובץ אחר
- `class` - מגדיר class (מבנה נתונים עם methods)
- `implements OnInit` - מבטיח שה-class מיישם את הממשק `OnInit`
  - `OnInit` - ממשק עם method `ngOnInit()` שמופעל כשהקומפוננט נטען

```typescript
private authService = inject(AuthService);
```

**הסבר:**

- `private` - משתנה פרטי (נגיש רק בתוך ה-class)
- `authService` - שם המשתנה
- `=` - השמה
- `inject(AuthService)` - **Dependency Injection** - Angular מזריק את `AuthService` אוטומטית
  - `inject()` - פונקציה של Angular שמחפשת את השירות ומזריקה אותו

```typescript
ngOnInit(): void {
  this.authService.checkAuth();
}
```

**הסבר:**

- `ngOnInit()` - method שמופעל אוטומטית כשהקומפוננט נטען
- `: void` - סוג החזרה (אין החזרה)
- `this` - מצביע לאובייקט הנוכחי (ה-class עצמו)
- `this.authService.checkAuth()` - קורא ל-method `checkAuth()` ב-`authService`

---

### 2. `src/app/core/guards/auth.guard.ts`

```typescript
import { inject } from "@angular/core";
import { Router, CanActivateFn } from "@angular/router";
```

**הסבר:**

- `CanActivateFn` - **Type** של פונקציה שיכולה לבדוק אם מותר להיכנס לנתיב

```typescript
export const authGuard: CanActivateFn = (route, state) => {
```

**הסבר:**

- `export const` - מייצא קבוע (לא משתנה)
- `authGuard` - שם הקבוע
- `: CanActivateFn` - **Type annotation** - אומר שזה פונקציה מסוג `CanActivateFn`
- `= (route, state) => {` - **Arrow Function** (פונקציית חץ)
  - `(route, state)` - פרמטרים
  - `=>` - סימון arrow function
  - `{` - תחילת גוף הפונקציה

```typescript
const authService = inject(AuthService);
const router = inject(Router);
```

**הסבר:**

- `const` - משתנה קבוע (לא ניתן לשנות)
- `inject()` - מזריק את השירות

```typescript
if (token || authenticated) {
  return true;
}
```

**הסבר:**

- `if` - תנאי
- `token || authenticated` - **OR operator** - אם אחד מהם true
- `return true` - מחזיר `true` (מותר להיכנס)

```typescript
router.navigate(["/auth/login"], { queryParams: { returnUrl: state.url } });
```

**הסבר:**

- `router.navigate()` - מנווט לדף אחר
- `['/auth/login']` - **Array** עם הנתיב
- `{ queryParams: { returnUrl: state.url } }` - **Object** עם query parameters
  - `queryParams` - פרמטרים ב-URL (למשל: `?returnUrl=/projects`)

---

### 3. `src/app/core/interceptors/auth.interceptor.ts`

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
```

**הסבר:**

- `HttpInterceptorFn` - **Type** של פונקציה שמתערבת בבקשות HTTP
- `req` - הבקשה (HttpRequest)
- `next` - פונקציה שממשיכה את הבקשה

```typescript
req = req.clone({
  setHeaders: {
    Authorization: `Bearer ${token}`,
  },
});
```

**הסבר:**

- `req.clone()` - יוצר עותק חדש של הבקשה (HttpRequest הוא immutable)
- `setHeaders` - מוסיף headers חדשים
- `` `Bearer ${token}` `` - **Template Literal** (string עם משתנים)
  - `` `...` `` - backticks (לא גרשיים רגילים)
  - `${token}` - interpolation (הכנסת משתנה)

```typescript
return next(req);
```

**הסבר:**

- `next(req)` - ממשיך את הבקשה עם ה-headers החדשים
- `return` - מחזיר את התוצאה

---

### 4. `src/app/core/services/auth.service.ts`

```typescript
@Injectable({
  providedIn: 'root',
})
```

**הסבר:**

- `@Injectable` - **Decorator** שמגדיר שזה Angular Service
- `providedIn: 'root'` - Service זמין בכל האפליקציה (Singleton)
  - רק instance אחד קיים בכל האפליקציה

```typescript
private readonly API_URL = `${environment.apiUrl}/auth`;
```

**הסבר:**

- `private readonly` - משתנה פרטי שלא ניתן לשנות אחרי השמה ראשונית
- `readonly` - לא ניתן לעשות `API_URL = ...` אחרי ההשמה הראשונה
- `` `${environment.apiUrl}/auth` `` - Template Literal

```typescript
private currentUser = signal<User | null>(this.getStoredUser());
```

**הסבר:**

- `signal()` - **Angular Signal** - יוצר reactive value
- `<User | null>` - **Generic Type** - Signal שמכיל `User` או `null`
- `|` - **Union Type** - "או" - יכול להיות `User` או `null`
- `this.getStoredUser()` - קורא ל-method ומחזיר את הערך הראשוני

```typescript
public user = this.currentUser.asReadonly();
```

**הסבר:**

- `public` - נגיש מחוץ ל-class
- `asReadonly()` - יוצר read-only version של ה-signal
  - אפשר לקרוא אבל לא לשנות

```typescript
public isAuthenticated = computed(() => this.currentUser() !== null);
```

**הסבר:**

- `computed()` - **Computed Signal** - signal שתלוי ב-signals אחרים
- `() => ...` - Arrow Function
- `this.currentUser()` - קורא את הערך של ה-signal (הסוגריים חשובים!)
- `!== null` - **Strict inequality** - בודק אם לא null
- כל פעם ש-`currentUser` משתנה, `isAuthenticated` מתעדכן אוטומטית

```typescript
login(credentials: LoginCredentials): Observable<AuthResponse> {
```

**הסבר:**

- `login()` - method
- `(credentials: LoginCredentials)` - פרמטר מסוג `LoginCredentials`
- `: Observable<AuthResponse>` - **Return Type** - מחזיר `Observable` של `AuthResponse`
  - `Observable` - RxJS - ערך אסינכרוני שיכול לחזור בעתיד

```typescript
return this.http
  .post<AuthResponse>(`${this.API_URL}/login`, credentials)
  .pipe(tap((response) => this.handleAuthResponse(response)));
```

**הסבר:**

- `this.http.post()` - שולח HTTP POST request
- `<AuthResponse>` - **Generic Type** - אומר שהתשובה תהיה מסוג `AuthResponse`
- `.pipe()` - **RxJS Pipe** - מאפשר להוסיף operators
- `tap()` - **RxJS Operator** - עושה משהו בלי לשנות את הערך
  - `(response) => ...` - Arrow Function עם פרמטר `response`

---

### 5. `src/app/features/projects/projects-list/projects-list.component.ts`

```typescript
myProjects = signal<Project[]>([]);
```

**הסבר:**

- `signal<Project[]>` - Signal שמכיל **Array** של `Project`
- `[]` - **Array Literal** - מערך ריק
- `Project[]` - **Array Type** - מערך של `Project`

```typescript
isLoading = signal(true);
```

**הסבר:**

- `signal(true)` - Signal עם ערך boolean (`true`)

```typescript
ngOnInit(): void {
  const token = this.authService.getToken();
  if (token) {
    // ...
  }
}
```

**הסבר:**

- `const token = ...` - משתנה קבוע
- `if (token)` - בודק אם `token` הוא truthy (לא null, לא undefined, לא empty string)

```typescript
this.projectsService.updateAllColors().subscribe({
  next: () => {
    // Colors updated
  },
  error: (err) => {
    console.error("Failed to update project colors:", err);
  },
});
```

**הסבר:**

- `.subscribe()` - **RxJS Subscribe** - מתחיל להאזין ל-Observable
- `{ next: ..., error: ... }` - **Object** עם callbacks
  - `next` - נקרא כשיש ערך חדש
  - `error` - נקרא כשיש שגיאה
- `(err) => { ... }` - Arrow Function עם פרמטר `err`

```typescript
filteredProjects = projects.filter((project) => {
  // ...
  return true;
});
```

**הסבר:**

- `.filter()` - **Array Method** - מסנן את המערך
- `(project) => { ... }` - Arrow Function שמופעלת על כל פריט
- `return true` - אם מחזיר `true`, הפריט נשאר במערך

```typescript
const myProjectIds = new Set([...this.myProjects().map((p) => p._id)]);
```

**הסבר:**

- `new Set()` - יוצר **Set** (מערך ללא כפילויות)
- `[...]` - **Spread Operator** - מפרק את המערך
- `.map((p) => p._id)` - **Array Method** - יוצר מערך חדש עם `_id` של כל פרויקט
  - `(p) => p._id` - Arrow Function שמחזירה את `_id`

---

## 🖥️ SERVER (NestJS) - סינטקס

### 1. `src/auth/auth.service.ts`

```typescript
@Injectable()
export class AuthService {
```

**הסבר:**

- `@Injectable()` - **Decorator** של NestJS - מגדיר שזה Service
- `export class` - מייצא class

```typescript
constructor(
  @InjectModel(User.name) private userModel: Model<UserDocument>,
  private jwtService: JwtService
) {}
```

**הסבר:**

- `constructor()` - **Constructor** - מופעל כשיוצרים instance חדש
- `@InjectModel(User.name)` - **Decorator** של NestJS/Mongoose - מזריק את ה-Model
  - `User.name` - שם ה-class (string)
- `private userModel` - משתנה פרטי
- `: Model<UserDocument>` - **Type Annotation** - מסוג `Model` של `UserDocument`
- `private jwtService: JwtService` - מזריק את `JwtService`

```typescript
async register(registerDto: RegisterDto) {
```

**הסבר:**

- `async` - **Async Function** - פונקציה אסינכרונית
  - מאפשרת להשתמש ב-`await`
- `(registerDto: RegisterDto)` - פרמטר מסוג `RegisterDto`

```typescript
const existingUser = await this.userModel.findOne({
  email: registerDto.email,
});
```

**הסבר:**

- `await` - **Await** - מחכה שהפונקציה האסינכרונית תסתיים
- `this.userModel.findOne()` - **Mongoose Method** - מוצא document אחד
- `{ email: registerDto.email }` - **Object** עם תנאי חיפוש
  - `email` - שם השדה
  - `registerDto.email` - הערך

```typescript
if (existingUser) {
  throw new UnauthorizedException("Email already exists");
}
```

**הסבר:**

- `throw` - **Throw** - זורק exception (שגיאה)
- `new UnauthorizedException(...)` - יוצר exception חדש
  - `UnauthorizedException` - class של NestJS

```typescript
const hashedPassword = await bcrypt.hash(registerDto.password, 10);
```

**הסבר:**

- `bcrypt.hash()` - מצפין סיסמה
- `10` - מספר rounds (כמה חזקה ההצפנה)

```typescript
const user = new this.userModel({
  ...registerDto,
  password: hashedPassword,
});
```

**הסבר:**

- `new this.userModel()` - יוצר instance חדש של Model
- `{ ...registerDto, password: hashedPassword }` - **Spread Operator** + **Object Property**
  - `...registerDto` - מפרק את כל השדות מ-`registerDto`
  - `password: hashedPassword` - משכתב את `password` עם הערך החדש

```typescript
await user.save();
```

**הסבר:**

- `user.save()` - **Mongoose Method** - שומר את ה-document ב-database
- `await` - מחכה שהשמירה תסתיים

```typescript
const payload = { email: user.email, sub: user._id, role: user.role };
```

**הסבר:**

- `{ email: ..., sub: ..., role: ... }` - **Object Literal**
- `sub` - standard claim של JWT (subject - מי המשתמש)

```typescript
return {
  access_token: this.jwtService.sign(payload),
  user: {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  },
};
```

**הסבר:**

- `return` - מחזיר ערך
- `this.jwtService.sign(payload)` - יוצר JWT token
- `{ access_token: ..., user: ... }` - **Object** עם שני שדות

```typescript
async validateUser(email: string, password: string): Promise<any> {
```

**הסבר:**

- `: Promise<any>` - **Return Type** - מחזיר Promise
  - `Promise` - ערך אסינכרוני
  - `<any>` - Generic Type - כל סוג

```typescript
const { password, ...result } = user.toObject();
```

**הסבר:**

- **Destructuring Assignment** - מפרק object
- `const { password, ...result }` - לוקח את `password` ומשאיר את השאר ב-`result`
- `user.toObject()` - ממיר Mongoose document ל-plain JavaScript object

---

### 2. `src/auth/auth.controller.ts`

```typescript
@Controller("auth")
export class AuthController {
```

**הסבר:**

- `@Controller("auth")` - **Decorator** של NestJS - מגדיר שזה Controller
  - `"auth"` - כל ה-endpoints מתחילים ב-`/auth`

```typescript
constructor(private authService: AuthService) {}
```

**הסבר:**

- **Dependency Injection** - NestJS מזריק את `AuthService` אוטומטית
- `private authService` - יוצר משתנה פרטי ומזריק אליו

```typescript
@Post("register")
async register(@Body() registerDto: RegisterDto) {
```

**הסבר:**

- `@Post("register")` - **Decorator** - מגדיר HTTP POST endpoint
  - `"register"` - ה-endpoint יהיה `POST /auth/register`
- `@Body()` - **Decorator** - לוקח את ה-body של הבקשה
  - NestJS ממיר את ה-JSON ל-`RegisterDto` אוטומטית

```typescript
try {
  return await this.authService.register(registerDto);
} catch (error) {
```

**הסבר:**

- `try { ... } catch (error) { ... }` - **Try-Catch** - טיפול בשגיאות
  - `try` - מנסה להריץ קוד
  - `catch` - תופס שגיאות

```typescript
if (error instanceof HttpException) {
  throw error;
}
```

**הסבר:**

- `instanceof` - **Instanceof Operator** - בודק אם `error` הוא instance של `HttpException`
- `throw error` - זורק את השגיאה מחדש

```typescript
throw new HttpException(
  "Database connection error...",
  HttpStatus.SERVICE_UNAVAILABLE
);
```

**הסבר:**

- `new HttpException(...)` - יוצר exception חדש
- `HttpStatus.SERVICE_UNAVAILABLE` - **Enum** - קוד HTTP (503)

```typescript
@UseGuards(JwtAuthGuard)
@Get("profile")
getProfile(@Request() req) {
```

**הסבר:**

- `@UseGuards(JwtAuthGuard)` - **Decorator** - מגן על ה-endpoint
  - `JwtAuthGuard` - בודק אם יש token תקין
- `@Get("profile")` - **Decorator** - מגדיר HTTP GET endpoint
- `@Request() req` - **Decorator** - לוקח את כל הבקשה
  - `req.user` - מכיל את פרטי המשתמש (מה-token)

---

### 3. `src/projects/schemas/project.schema.ts`

```typescript
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
```

**הסבר:**

- `Prop` - **Decorator** - מגדיר property ב-schema
- `Schema` - **Decorator** - מגדיר שזה Mongoose Schema
- `SchemaFactory` - **Class** - יוצר schema

```typescript
export type ProjectDocument = Project & Document;
```

**הסבר:**

- `type` - **Type Alias** - מגדיר type חדש
- `Project & Document` - **Intersection Type** - שילוב של שני types
  - `&` - "וגם" - צריך להיות גם `Project` וגם `Document`

```typescript
@Schema({ timestamps: true })
export class Project {
```

**הסבר:**

- `@Schema({ timestamps: true })` - **Decorator** - מגדיר Mongoose Schema
  - `timestamps: true` - מוסיף `createdAt` ו-`updatedAt` אוטומטית

```typescript
@Prop({ required: true })
name: string;
```

**הסבר:**

- `@Prop({ required: true })` - **Decorator** - מגדיר property ב-schema
  - `required: true` - שדה חובה
- `name: string` - **Type Annotation** - מסוג string

```typescript
@Prop()
description: string;
```

**הסבר:**

- `@Prop()` - ללא options - שדה אופציונלי

```typescript
@Prop({ required: true })
ownerId: MongooseSchema.Types.ObjectId;
```

**הסבר:**

- `MongooseSchema.Types.ObjectId` - **Type** - ObjectId של MongoDB
  - מזהה ייחודי

```typescript
@Prop({ type: [MongooseSchema.Types.ObjectId], default: [] })
members: MongooseSchema.Types.ObjectId[];
```

**הסבר:**

- `type: [MongooseSchema.Types.ObjectId]` - **Array Type** - מערך של ObjectId
- `default: []` - ערך ברירת מחדל (מערך ריק)

```typescript
@Prop({ type: [MongooseSchema.Types.ObjectId], ref: "Board", default: [] })
boards: MongooseSchema.Types.ObjectId[];
```

**הסבר:**

- `ref: "Board"` - **Reference** - קישור ל-schema אחר
  - מאפשר `populate()` - לטעון את ה-Board המלא

```typescript
export const ProjectSchema = SchemaFactory.createForClass(Project);
```

**הסבר:**

- `SchemaFactory.createForClass()` - יוצר Mongoose Schema מה-class
- `export const` - מייצא את ה-schema

---

### 4. `src/projects/dto/create-project.dto.ts`

```typescript
import { IsString, IsOptional, IsArray, IsBoolean } from "class-validator";
```

**הסבר:**

- `class-validator` - ספרייה לבדיקת נתונים
- `IsString` - **Decorator** - בודק אם זה string
- `IsOptional` - **Decorator** - אומר שהשדה אופציונלי
- `IsArray` - **Decorator** - בודק אם זה array
- `IsBoolean` - **Decorator** - בודק אם זה boolean

```typescript
export class CreateProjectDto {
  @IsString()
  name: string;
```

**הסבר:**

- `@IsString()` - **Decorator** - בודק שהערך הוא string
  - אם לא - NestJS מחזיר שגיאת validation

```typescript
@IsString()
@IsOptional()
description?: string;
```

**הסבר:**

- `@IsOptional()` - אומר שהשדה לא חובה
- `description?: string` - **Optional Property** - ה-`?` אומר שהשדה אופציונלי
  - `?:` - TypeScript syntax לשדה אופציונלי

```typescript
@IsArray()
@IsOptional()
members?: string[];
```

**הסבר:**

- `@IsArray()` - בודק שזה array
- `string[]` - מערך של strings

---

### 5. `src/auth/guards/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
```

**הסבר:**

- `extends AuthGuard("jwt")` - **Inheritance** - יורש מ-`AuthGuard`
  - `extends` - מורש
  - `AuthGuard("jwt")` - class עם פרמטר `"jwt"`

```typescript
handleRequest(err: any, user: any, info: any) {
```

**הסבר:**

- `handleRequest()` - **Method Override** - משכתב method מה-parent
- `any` - **Any Type** - כל סוג (לא מומלץ, אבל כאן זה OK)

```typescript
if (err || !user) {
  throw err || new Error(info?.message || "Unauthorized");
}
```

**הסבר:**

- `!user` - **Negation Operator** - `!` הופך את הערך
  - `!user` = "אם אין user"
- `err || new Error(...)` - **OR Operator** - אם `err` קיים, זורק אותו, אחרת יוצר Error חדש
- `info?.message` - **Optional Chaining** - `?.` בודק אם `info` קיים לפני גישה ל-`message`
  - אם `info` הוא `null` או `undefined`, מחזיר `undefined` במקום שגיאה

---

## 🔑 מושגי TypeScript חשובים

### Types (סוגים)

```typescript
// Primitive Types
let name: string = "John";
let age: number = 30;
let isActive: boolean = true;

// Array Types
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["John", "Jane"]; // אותו דבר

// Object Types
let user: { name: string; age: number } = { name: "John", age: 30 };

// Union Types
let value: string | number = "hello"; // יכול להיות string או number
value = 42; // גם OK

// Optional Types
let email?: string; // יכול להיות string או undefined

// Generic Types
function identity<T>(arg: T): T {
  return arg;
}
// T - type parameter (משתנה סוג)
```

### Interfaces (ממשקים)

```typescript
interface User {
  name: string;
  age: number;
  email?: string; // optional
}

let user: User = { name: "John", age: 30 };
```

### Classes (מחלקות)

```typescript
class User {
  private name: string; // private - רק בתוך ה-class
  public age: number; // public - נגיש מחוץ ל-class
  readonly id: string; // readonly - לא ניתן לשנות

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  getName(): string {
    return this.name;
  }
}
```

### Functions (פונקציות)

```typescript
// Regular Function
function add(a: number, b: number): number {
  return a + b;
}

// Arrow Function
const add = (a: number, b: number): number => {
  return a + b;
};

// Shorthand Arrow Function
const add = (a: number, b: number) => a + b;
```

### Async/Await

```typescript
async function fetchData(): Promise<string> {
  const response = await fetch("/api/data");
  return response.text();
}
```

### Destructuring (פירוק)

```typescript
// Object Destructuring
const { name, age } = user;
// אותו דבר כמו:
// const name = user.name;
// const age = user.age;

// Array Destructuring
const [first, second] = [1, 2, 3];
// first = 1, second = 2

// Spread Operator
const newUser = { ...user, age: 31 };
// יוצר object חדש עם כל השדות מ-user, אבל age = 31
```

---

## 🎯 סיכום - סינטקס חשוב

### Angular:

- `@Component` - מגדיר component
- `@Injectable` - מגדיר service
- `inject()` - Dependency Injection
- `signal()` - Angular Signal
- `computed()` - Computed Signal
- `Observable` - RxJS
- `.subscribe()` - מאזין ל-Observable
- `.pipe()` - מוסיף operators

### NestJS:

- `@Controller` - מגדיר controller
- `@Injectable` - מגדיר service
- `@Get`, `@Post`, `@Patch`, `@Delete` - HTTP methods
- `@Body()`, `@Param()`, `@Request()` - לוקח נתונים מהבקשה
- `@UseGuards` - מגן על endpoint
- `@Schema`, `@Prop` - Mongoose schema
- `async/await` - פונקציות אסינכרוניות

### TypeScript:

- `: Type` - Type Annotation
- `<Type>` - Generic Type
- `|` - Union Type
- `&` - Intersection Type
- `?` - Optional
- `!` - Non-null assertion
- `?.` - Optional Chaining
- `...` - Spread Operator
- `=>` - Arrow Function

---

**זה הכל! 🎉**

עכשיו יש לך הבנה מלאה של הסינטקס בכל הקוד.

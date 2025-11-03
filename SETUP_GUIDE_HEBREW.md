# 🚀 מדריך התקנה מפורט - Team Task Manager

מדריך שלב-אחר-שלב להקמת הפרויקט עם כל הכלים החינמיים הנדרשים.

---

## 📋 תוכן עניינים

1. [דרישות מקדימות](#1-דרישות-מקדימות)
2. [הקמת MongoDB Atlas (חינמי)](#2-הקמת-mongodb-atlas-חינמי)
3. [הגדרת Backend](#3-הגדרת-backend)
4. [הגדרת Frontend](#4-הגדרת-frontend)
5. [הרצת הפרויקט](#5-הרצת-הפרויקט)
6. [בדיקה שהכל עובד](#6-בדיקה-שהכל-עובד)
7. [פתרון בעיות נפוצות](#7-פתרון-בעיות-נפוצות)

---

## 1️⃣ דרישות מקדימות

### התקנת Node.js (חינמי)

1. **הורד Node.js:**

   - לך לאתר: https://nodejs.org/
   - הורד את הגרסה LTS (Long Term Support) - הגרסה היציבה ביותר
   - זה חינמי לחלוטין! ✅

2. **התקן את Node.js:**

   - הרץ את קובץ ההתקנה שהורדת
   - לחץ "Next" על כל המסכים (הגדרות ברירת המחדל טובות)
   - **חשוב:** סמן את התיבה "Automatically install the necessary tools"

3. **בדוק שההתקנה הצליחה:**
   - פתח PowerShell או Command Prompt
   - הקלד:
     ```bash
     node --version
     ```
   - אמור להופיע משהו כמו: `v20.x.x` או `v18.x.x`
   - הקלד גם:
     ```bash
     npm --version
     ```
   - אמור להופיע משהו כמו: `10.x.x`

**✅ אם אתה רואה מספרי גרסאות - כל טוב! אפשר להמשיך.**

---

## 2️⃣ הקמת MongoDB Atlas (חינמי)

MongoDB Atlas הוא שירות חינמי לאחסון מסד נתונים בענן. **זה 100% חינמי** ו-זה לא יגמר!

### שלב 1: יצירת חשבון

1. לך לאתר: https://www.mongodb.com/cloud/atlas/register
2. לחץ על **"Try Free"** או **"Sign Up"**
3. מלא פרטים:
   - **Email** - הכנס כתובת אימייל שלך
   - **Password** - צור סיסמה חזקה
   - **First Name** ו-**Last Name**
   - **Company** - יכול להיות "Personal" או להשאיר ריק
   - **Country** - בחר מדינה
4. לחץ **"Create Account"**
5. **אימות אימייל:** תצטרך לאשר את החשבון באימייל שלך

### שלב 2: יצירת Database

**⚠️ חשוב: לפעמים האופציה החינמית לא מופיעה מיד. הנה כמה דרכים למצוא אותה:**

**דרך א' - אם אתה במסך "Deploy your cluster":**

1. **גלול למטה!** האופציה החינמית לפעמים מופיעה בתחתית הדף
2. חפש את **"M0 Free"** או **"Free"** או **"Shared"**
3. אם אתה רואה רק M30, M10, Flex - זה לא נכון! לחץ **"Cancel"** או **"← Back"**

**דרך ב' - גישה ישירה לאופציה החינמית:**

1. במסך הראשי, לחץ על **"Build a Database"** (לא "Deploy a cluster")
2. או לחץ על **"Database"** בתפריט השמאלי → **"Browse Collections"** → **"Create"**
3. בחר **"M0 FREE"** או **"Free Shared"** - זה האופציה החינמית!

**דרך ג' - אם אתה כבר במסך deployment:**

1. אם אתה במסך עם M30, M10, Flex - **זה לא נכון!**
2. לחץ על **"← Back"** או **"Cancel"**
3. לך ל-**"Database"** בתפריט השמאלי
4. לחץ על **"Create"** או **"Build a Database"**
5. עכשיו תבחר **"M0 FREE"** - זה חינמי! ✅

**לאחר שתמצא את M0 Free:**

1. **Cloud Provider:** בחר מה שאתה רוצה (AWS, Google Cloud, או Azure) - לא משנה, הכל חינמי
2. **Region:** בחר את האזור הקרוב ביותר אליך (למשל: `eu-central-1` לאירופה)
3. **Cluster Name:** השאר את השם הברירת מחדל או שנה (לא משנה)
4. לחץ **"Create Deployment"** או **"Create"**
5. זה ייקח כמה דקות... ⏳

**⚠️ אם עדיין לא מופיעה לך אופציה חינמית:**

- ודא שהרשמת עם חשבון אישי (לא ארגוני עם תשלום)
- נסה ליצור Project חדש: **"New Project"** → בחר **"M0 Free"**

### שלב 3: יצירת משתמש Database

1. תראה מסך **Security Quickstart**
2. **בחר:** "Username and Password" (לא "Atlas API Keys")
3. **יצירת משתמש:**
   - **Username:** הכנס שם משתמש (למשל: `admin` או `teamtaskmanager`)
   - **Password:** לחץ על **"Autogenerate Secure Password"** 🔐
   - **⚠️ חשוב מאוד:** העתק את הסיסמה לשמור אותה! תצטרך אותה!
   - אם לא העתקת, תוכל לראות אותה שוב - לחץ על העין 👁️
4. לחץ **"Create Database User"**

### שלב 4: הגדרת Network Access (IP Whitelist)

1. ב-**Security** → **Network Access**
2. לחץ **"Add IP Address"**
3. **בחר:** **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ זה לא הכי בטוח, אבל זה הכי פשוט לפיתוח
   - לייצור תצטרך להגביל רק ל-IP שלך
4. לחץ **"Confirm"**

### שלב 5: קבלת Connection String

1. לחץ על **"Database"** בצד השמאלי
2. לחץ על **"Connect"** ליד ה-Deployment שלך
3. בחר: **"Drivers"** (לא "MongoDB for VS Code")
4. תחת **"Connection string only"** יש לך אפשרויות:
   - **Node.js** - זה מה שאנחנו צריכים!
5. **העתק את ה-Connection String** - זה נראה כמו:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **החלף את `<username>` ו-`<password>`:**
   - `<username>` ← שם המשתמש שיצרת בשלב 3
   - `<password>` ← הסיסמה שיצרת בשלב 3
   - ⚠️ אם יש בסיסמה תווים מיוחדים כמו `@`, `#`, `!` - צריך להמיר אותם:
     - `@` → `%40`
     - `#` → `%23`
     - `!` → `%21`
     - `/` → `%2F`
     - `:` → `%3A`
7. **הוסף שם למסד הנתונים בסוף:**
   - בסוף ה-String, לפני ה-`?`, הוסף: `/teamtaskmanager`
   - זה אמור להיראות כך:
   ```
   mongodb+srv://admin:MyPassword123@cluster0.xxxxx.mongodb.net/teamtaskmanager?retryWrites=true&w=majority
   ```

**✅ שים את ה-Connection String הזה בצד - נצטרך אותו בקובץ .env!**

---

## 3️⃣ הגדרת Backend

### שלב 1: יצירת קובץ .env

1. פתח את תיקיית הפרויקט ב-VSCode או Explorer
2. לך לתיקייה `server/`
3. צור קובץ חדש בשם: `.env` (**בדיוק עם הנקודה בתחילה!**)
4. **איך ליצור ב-Windows:**

   - ב-VSCode: לחץ על כפתור "New File" והקלד `.env`
   - או ב-Explorer: הקלד `.env.` (עם נקודה בסוף) - Windows יסיר את הנקודה האחרונה
   - או ב-PowerShell:
     ```powershell
     cd server
     New-Item -Path .env -ItemType File
     ```

5. **פתח את הקובץ והעתק את התוכן הבא:**

```env
PORT=3000
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production-but-its-ok-for-development
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/teamtaskmanager?retryWrites=true&w=majority
```

6. **החלף:**
   - `YOUR_USERNAME` ← שם המשתמש שיצרת ב-Atlas
   - `YOUR_PASSWORD` ← הסיסמה שיצרת ב-Atlas (עם תווים מיוחדים מקודדים אם צריך)
   - `cluster0.xxxxx.mongodb.net` ← חלק ה-Connection String שלך מ-Atlas

**דוגמה:**

```env
PORT=3000
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production-but-its-ok-for-development
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb+srv://admin:MyPassword123@cluster0.abc123.mongodb.net/teamtaskmanager?retryWrites=true&w=majority
```

### שלב 2: התקנת חבילות (Packages)

1. פתח **PowerShell** או **Command Prompt**
2. לך לתיקיית ה-server:

   ```bash
   cd C:\work\teamtaskmanager\server
   ```

   (התאם את הנתיב לנתיב שלך)

3. התקן את כל החבילות:

   ```bash
   npm install
   ```

   זה ייקח כמה דקות... ⏳

   **אם אתה רואה שגיאות:**

   - בדוק שיש לך אינטרנט
   - נסה שוב: `npm install`
   - אם יש בעיה עם הרשאות, רץ את PowerShell כ-Administrator

**✅ אם אתה רואה "added XXX packages" - כל טוב!**

### שלב 3: הרצת Backend

```bash
npm run start:dev
```

**אמור להופיע:**

```
🚀 Server is running on: http://localhost:3000
[Nest] ... Application successfully started
```

**✅ אם אתה רואה את ההודעה הזו - ה-Backend עובד!**

**⚠️ השאר את החלון הזה פתוח!**

---

## 4️⃣ הגדרת Frontend

### שלב 1: פתח חלון PowerShell/Command Prompt חדש

(לא לסגור את ה-Backend! פתח חלון **נוסף**)

### שלב 2: התקנת חבילות

1. לך לתיקיית ה-client:

   ```bash
   cd C:\work\teamtaskmanager\client
   ```

2. התקן את החבילות:

   ```bash
   npm install
   ```

   זה ייקח כמה דקות... ⏳

**✅ אם אתה רואה "added XXX packages" - כל טוב!**

### שלב 3: הרצת Frontend

**⚠️ אם אתה מקבל שגיאה "ng: command not found" - זה בסדר!**

**פתרון - השתמש ב-npm start:**

```bash
npm start
```

או:

```bash
npx ng serve
```

**הסבר:**

- `npm start` - זה עושה את אותו דבר כמו `ng serve` אבל דרך npm (עובד תמיד!)
- `npx ng serve` - זה משתמש ב-Angular CLI מהחבילות המקומיות (גם עובד)
- `ng serve` - זה דורש התקנה גלובלית של Angular CLI (לא הכרחי)

**אמור להופיע:**

```
✔ Browser application bundle generation complete.
** Angular Live Development Server is listening on localhost:4200 **
```

**✅ אם אתה רואה את ההודעה הזו - ה-Frontend עובד!**

**⚠️ השאר גם את החלון הזה פתוח!**

---

## 5️⃣ הרצת הפרויקט

עכשיו יש לך **שני חלונות פתוחים:**

1. **Backend** - רץ על `http://localhost:3000`
2. **Frontend** - רץ על `http://localhost:4200`

---

## 6️⃣ בדיקה שהכל עובד

### שלב 1: פתיחת האפליקציה

1. פתח דפדפן (Chrome, Edge, Firefox)
2. נווט ל: **http://localhost:4200**
3. אתה אמור לראות את מסך ההתחברות

### שלב 2: הרשמה

1. לחץ על **"Register"** או **"הרשמה"**
2. מלא פרטים:
   - **Name** - השם שלך
   - **Email** - כתובת אימייל
   - **Password** - סיסמה (לפחות 6 תווים)
3. לחץ **"Register"**
4. אם הכל עובד, תועבר לרשימת הלוחות! 🎉

### שלב 3: יצירת לוח

1. לחץ על **"Create New Board"** או **"+ New Board"**
2. מלא:
   - **Name** - שם הלוח
   - **Description** - תיאור (אופציונלי)
   - **Color** - בחר צבע
3. לחץ **"Create"**
4. לחץ על הלוח שיצרת

### שלב 4: יצירת משימה

1. בתוך הלוח, לחץ על **"Add Task"** או **"+ Task"**
2. מלא:
   - **Title** - כותרת המשימה
   - **Description** - תיאור (אופציונלי)
   - **Priority** - בחר עדיפות (Low/Medium/High)
3. לחץ **"Create"**
4. **נסה לגרור** את המשימה בין העמודות (TODO → IN PROGRESS → DONE)

**✅ אם הכל עובד - מזל טוב! הפרויקט רץ בהצלחה! 🎉🎉🎉**

---

## 7️⃣ פתרון בעיות נפוצות

### ❌ בעיה: "MongoServerError" או "connect ECONNREFUSED"

**סיבה:** MongoDB לא מחובר או ה-Connection String לא נכון.

**פתרון:**

1. בדוק שה-`MONGODB_URI` ב-`.env` נכון
2. ודא שהסיסמה מקודדת נכון (תווים מיוחדים)
3. בדוק ב-Atlas ש-**Network Access** מוגדר ל-`0.0.0.0/0`
4. נסה להעתיק את ה-Connection String שוב מ-Atlas

### ❌ בעיה: Backend לא עולה / שגיאות TypeScript

**פתרון:**

1. ודא ש-`.env` קיים בתיקיית `server/`
2. ודא שכל הערכים ב-`.env` נכונים (אין רווחים מיותרים)
3. בדוק שהקובץ נקרא בדיוק `.env` (לא `.env.txt`)
4. נסה להריץ:
   ```bash
   cd server
   npm install
   npm run start:dev
   ```

### ❌ בעיה: Frontend לא עולה

**פתרון:**

1. ודא ש-Node.js מותקן (`node --version`)
2. נסה:
   ```bash
   cd client
   npm install
   ng serve
   ```
3. אם יש שגיאת "port already in use", נסה:
   ```bash
   ng serve --port 4201
   ```
   ואז פתח `http://localhost:4201`

### ❌ בעיה: דף ריק בדפדפן

**פתרון:**

1. פתח את **Developer Tools** (F12)
2. לך ל-**Console** ולבדוק אם יש שגיאות
3. לך ל-**Network** ובדוק אם יש בקשות שנכשלו (אדום)
4. ודא שה-Backend רץ (`http://localhost:3000`)
5. בדוק ב-Console אם יש שגיאות CORS

### ❌ בעיה: "Email already exists" גם כשלא

**פתרון:**

1. נסה להחליף אימייל
2. או למחוק את המשתמש הקיים מה-Database ב-Atlas:
   - לך ל-Atlas → **Database** → **Browse Collections**
   - מצא את collection בשם `users`
   - מחק את המשתמש הישן

### ❌ בעיה: שגיאת "JWT_SECRET" לא מוגדר

**פתרון:**

1. ודא ש-`.env` קיים בתיקיית `server/`
2. ודא שיש שורה: `JWT_SECRET=...` ב-`.env`
3. הפעל מחדש את ה-Backend (Ctrl+C ואז `npm run start:dev`)

### ❌ בעיה: "Cannot find module" או שגיאות חבילות

**פתרון:**

1. מחק את `node_modules`:
   ```bash
   # ב-Windows PowerShell:
   Remove-Item -Recurse -Force node_modules
   ```
2. מחק את `package-lock.json`:
   ```bash
   Remove-Item package-lock.json
   ```
3. התקן מחדש:
   ```bash
   npm install
   ```

### ❌ בעיה: MongoDB Atlas לא מתחבר

**פתרון:**

1. **בדוק את Network Access:**
   - לך ל-Atlas → **Security** → **Network Access**
   - ודא שיש כלל עם `0.0.0.0/0`
2. **בדוק את Database User:**
   - לך ל-Atlas → **Security** → **Database Users**
   - ודא שהמשתמש קיים
3. **נסה Connection String חדש:**
   - לך ל-Atlas → **Database** → **Connect** → **Drivers**
   - העתק את ה-String מחדש
   - ודא שהחלפת `<username>` ו-`<password>`

---

## 📝 הערות חשובות

### 🔐 אבטחה

- ה-`.env` מכיל סודות חשובים - **אל תעלה אותו ל-GitHub!**
- קובץ `.env` כבר צריך להיות ב-`.gitignore` (אמור להיות כבר)
- לייצור, תשנה את `JWT_SECRET` למשהו אקראי וחזק יותר

### 💾 שמירה על הנתונים

- כל הנתונים נשמרים ב-MongoDB Atlas
- **M0 Free** כולל **512MB** אחסון - זה מספיק להרבה שימושים!
- אם תגיעו לגבול, תוכלו לשדרג (אבל זה עדיין חינמי עבור רוב המקרים)

### 🚀 הפעלה מחדש

כל פעם שתפתח את הפרויקט מחדש, תצטרך:

1. לפתוח **שני חלונות טרמינל**
2. **Backend:**
   ```bash
   cd server
   npm run start:dev
   ```
3. **Frontend:**
   ```bash
   cd client
   ng serve
   ```

---

## ✅ סיכום - מה יש לך עכשיו

1. ✅ Node.js מותקן (חינמי)
2. ✅ MongoDB Atlas מוגדר (חינמי)
3. ✅ Backend רץ על `http://localhost:3000`
4. ✅ Frontend רץ על `http://localhost:4200`
5. ✅ האפליקציה עובדת בדפדפן!

**🎉 מזל טוב! כל הכלים החינמיים מוגדרים והפרויקט רץ!**

---

## 📞 עזרה נוספת

אם יש בעיות שלא נפתרו:

1. בדוק את הלוגים ב-Console של ה-Backend (חלון PowerShell)
2. בדוק את הלוגים ב-Console של הדפדפן (F12 → Console)
3. ודא שכל הקבצים קיימים והקוד לא שונה

**בהצלחה! 🚀**

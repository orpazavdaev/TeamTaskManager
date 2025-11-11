# מדריך העלאה לענן - Team Task Manager

מדריך מפורט להעלאת האפליקציה לענן בחינם, כך שכולם יוכלו לגשת אליה.

## 📋 תוכן עניינים

1. [הכנה](#הכנה)
2. [העלאת Backend ל-Railway](#העלאת-backend-ל-railway)
3. [העלאת Backend ל-Render (חלופה ל-Railway)](#העלאת-backend-ל-render-חלופה-ל-railway)
4. [העלאת Frontend ל-Vercel](#העלאת-frontend-ל-vercel)
5. [קישור Frontend ל-Backend](#קישור-frontend-ל-backend)
6. [פתרון בעיות](#פתרון-בעיות)

---

## הכנה

### 1. ודאי שהפרויקט במצב מוכן להעלאה

- ✅ הפרויקט עובד מקומית
- ✅ MongoDB Atlas מוגדר ופועל
- ✅ כל ה-`console.log` הוסרו
- ✅ הפרויקט נמצא ב-GitHub

### 2. ודא שיש לך חשבונות חינמיים

- **GitHub** - אם אין לך, צור חשבון חינמי ב-[github.com](https://github.com)
- **Railway** - חשבון חינמי עם 500 שעות בחודש
- **Vercel** - חשבון חינמי ללא הגבלה

---

## העלאת Backend ל-Railway

### שלב 1: הכנת הפרויקט

1. ודא ש-`.env` מופיע ב-`.gitignore` (לא נרצה להעלות אותו ל-GitHub)
2. ודא שהפרויקט ב-GitHub

### שלב 2: יצירת פרויקט ב-Railway

1. לך ל-[railway.app](https://railway.app)
2. לחץ על **"Login"** או **"Start a New Project"**
3. התחבר עם **GitHub** (התחברות עם GitHub)
4. לחץ על **"New Project"**
5. בחר **"Deploy from GitHub repo"**
6. בחר את ה-repository שלך
7. Railway יזהה את הפרויקט ויתחיל build

### שלב 3: הגדרת משתני סביבה (Environment Variables)

1. לחץ על הפרויקט שיצרת
2. לחץ על **"Variables"** או **"Settings"**
3. הוסף את המשתנים הבאים:

```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/teamtaskmanager?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-min-32-characters
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://YOUR_VERCEL_URL.vercel.app
PORT=3000
```

**⚠️ חשוב:**

- החלף את `YOUR_USERNAME` ו-`YOUR_PASSWORD` עם הפרטים שלך מ-MongoDB Atlas
- החלף את `cluster0.xxxxx` עם ה-cluster שלך
- החלף את `YOUR_VERCEL_URL` עם ה-URL של Vercel (נעדכן אחרי שנעלה את Frontend)
- `JWT_SECRET` צריך להיות מחרוזת ארוכה ומורכבת (לפחות 32 תווים)

### שלב 4: הגדרת Build Settings

1. לחץ על **"Settings"**
2. תחת **"Build Command"** הזן:
   ```
   cd server && npm install && npm run build
   ```
3. תחת **"Start Command"** הזן:
   ```
   cd server && npm start
   ```
4. תחת **"Root Directory"** השאר ריק (או השאר את ברירת המחדל)

### שלב 5: קבלת ה-URL של Backend

1. לאחר שה-deployment מסתיים, לך ל-**"Settings"** → **"Networking"**
2. לחץ על הכפתור **"Generate Domain"** (הכפתור הסגול עם אייקון הברק)
3. Railway ייצור URL אוטומטי (למשל: `https://your-app-name.up.railway.app`)
4. ה-URL יופיע מתחת לכפתורים
5. **שמור את ה-URL הזה** - נצטרך אותו להגדרת Frontend

**⚠️ חשוב:** אם ה-URL לא מופיע, ודאי שה-deployment הסתיים בהצלחה (בדוק ב-**"Deployments"**)

---

## העלאת Backend ל-Render (חלופה ל-Railway)

אם Railway לא עובד בגלל "Limited Access", השתמש ב-Render - שירות דומה עם 750 שעות חינם בחודש.

### שלב 1: יצירת פרויקט ב-Render

1. לך ל-[render.com](https://render.com)
2. לחץ על **"Get Started"** או **"Sign Up"**
3. התחבר עם **GitHub** (התחברות עם GitHub)
4. לחץ על **"New +"** → **"Web Service"**
5. בחר **"Connect GitHub"** אם עדיין לא חיברת
6. בחר את ה-repository שלך
7. Render יזהה את הפרויקט

### שלב 2: הגדרת Build Settings

1. תחת **"Name"** - הזן שם לשרת (למשל: `teamtaskmanager-backend`)
2. תחת **"Region"** - בחר את האזור הקרוב אליך (למשל: `Frankfurt (EU)` או `Oregon (US West)`)
3. תחת **"Branch"** - השאר `main` (או `master` אם זה ה-branch שלך)
4. תחת **"Root Directory"** - הזן: `server`
5. תחת **"Runtime"** - בחר `Node`
6. תחת **"Build Command"** - הזן:
   ```
   npm install && npm run build
   ```
7. תחת **"Start Command"** - הזן:
   ```
   npm start
   ```

### שלב 3: הגדרת Environment Variables

1. תחת **"Environment Variables"** לחץ על **"Add Environment Variable"**
2. הוסף את המשתנים הבאים (לחץ על **"Add"** אחרי כל אחד):

```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/teamtaskmanager?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-min-32-characters
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://YOUR_VERCEL_URL.vercel.app
PORT=3000
```

**⚠️ חשוב:**

- החלף את `YOUR_USERNAME` ו-`YOUR_PASSWORD` עם הפרטים שלך מ-MongoDB Atlas
- החלף את `cluster0.xxxxx` עם ה-cluster שלך
- החלף את `YOUR_VERCEL_URL` עם ה-URL של Vercel (נעדכן אחרי שנעלה את Frontend)
- `JWT_SECRET` צריך להיות מחרוזת ארוכה ומורכבת (לפחות 32 תווים)

### שלב 4: Deploy

1. לחץ על **"Create Web Service"**
2. Render יתחיל build (זה יכול לקחת כמה דקות)
3. לאחר שה-build מסתיים, Render יצור URL אוטומטי (למשל: `https://teamtaskmanager-backend.onrender.com`)
4. **שמור את ה-URL הזה** - נצטרך אותו להגדרת Frontend

**⚠️ חשוב:**

- ב-Render, השרת נכנס למצב שינה אחרי 15 דקות של חוסר פעילות (ב-Free Tier)
- הפעלה ראשונה אחרי שינה יכולה לקחת 30-60 שניות
- זה נורמלי ב-Free Tier

---

## העלאת Frontend ל-Vercel

### שלב 1: יצירת פרויקט ב-Vercel

1. לך ל-[vercel.com](https://vercel.com)
2. לחץ על **"Sign Up"** או **"Login"**
3. התחבר עם **GitHub**
4. לחץ על **"Add New..."** → **"Project"**
5. בחר את ה-repository שלך
6. Vercel יזהה שזה Angular project

### שלב 2: הגדרת Build Settings

1. תחת **"Framework Preset"** - בחר **"Angular"** (או השאר Auto)
2. תחת **"Root Directory"** - הזן `client`
3. תחת **"Build Command"** - השאר את ברירת המחדל או הזן:
   ```
   npm run build
   ```
4. תחת **"Output Directory"** - הזן:
   ```
   dist/client-app/browser
   ```

### שלב 3: הגדרת Environment Variables

1. תחת **"Environment Variables"** לחץ על **"Add"**
2. הוסף את המשתנה הבא:

   ```
   NG_APP_API_URL=https://YOUR_BACKEND_URL
   ```

   (החלף את `YOUR_BACKEND_URL` עם ה-URL שקיבלת מ-Railway או Render)

   **דוגמאות:**

   - אם השתמשת ב-Railway: `https://your-app.up.railway.app`
   - אם השתמשת ב-Render: `https://your-app.onrender.com`

**⚠️ חשוב:**

- ב-Vercel, משתני סביבה שמתחילים ב-`NG_APP_` נגישים ב-Angular
- לאחר הוספת המשתנה, תצטרך לעשות **redeploy** (לחץ על **"Redeploy"**)

### שלב 4: Deploy

1. לחץ על **"Deploy"**
2. חכה שה-build מסתיים (זה יכול לקחת כמה דקות)
3. לאחר הסיום, Vercel יצור URL אוטומטי (למשל: `https://your-app-name.vercel.app`)

### שלב 5: קבלת ה-URL של Frontend

1. לאחר ה-deployment, ה-URL יופיע בדף
2. **שמור את ה-URL הזה**

---

## קישור Frontend ל-Backend

### שלב 1: עדכון FRONTEND_URL ב-Railway

1. חזור ל-Railway
2. לחץ על הפרויקט שלך → **"Variables"**
3. עדכן את `FRONTEND_URL` ל-URL של Vercel:
   ```
   FRONTEND_URL=https://YOUR_VERCEL_URL.vercel.app
   ```
4. Railway יבצע restart אוטומטי

### שלב 2: עדכון NG_APP_API_URL ב-Vercel

1. חזור ל-Vercel
2. לחץ על הפרויקט → **"Settings"** → **"Environment Variables"**
3. ודא ש-`NG_APP_API_URL` מכיל את ה-URL הנכון של Railway
4. לחץ על **"Deployments"** → בחר את ה-deployment האחרון → **"Redeploy"**

### שלב 3: בדיקה

1. פתח את ה-URL של Vercel בדפדפן
2. נסה להתחבר או להירשם
3. אם הכל עובד - מזל טוב! 🎉

---

## פתרון בעיות

### בעיה: "CORS Error" ב-console

**פתרון:**

1. ודא ש-`FRONTEND_URL` ב-Railway מכיל את ה-URL הנכון של Vercel (כולל `https://`)
2. ודא שה-URL נכון ללא סלאש בסוף (`/`)
3. לאחר עדכון, Railway יבצע restart - חכה כמה שניות

### בעיה: "Cannot connect to API" או 404

**פתרון:**

1. ודא ש-`NG_APP_API_URL` ב-Vercel מכיל את ה-URL הנכון של Railway
2. ודא שה-URL נכון ללא סלאש בסוף
3. ודא שה-URL מתחיל עם `https://`
4. לאחר עדכון, בצע **Redeploy** ב-Vercel

### בעיה: "MongoDB connection error"

**פתרון:**

1. ודא ש-`MONGODB_URI` ב-Railway נכון
2. ודא שה-IP whitelist ב-MongoDB Atlas כולל את כל ה-IPs (0.0.0.0/0)

### בעיה: "JWT invalid signature"

**פתרון:**

1. ודא ש-`JWT_SECRET` ב-Railway זהה למה שהיה מקומית
2. ודא שה-`JWT_SECRET` ארוך מספיק (לפחות 32 תווים)

### בעיה: "Not Found" ב-Railway (דף שגיאה של Railway)

**פתרון:**

1. **בדוק את ה-Deployment:**

   - לך ל-Railway → הפרויקט → **"Deployments"**
   - בדוק אם ה-deployment האחרון הצליח (צריך להיות ירוק ✓)
   - אם יש שגיאה (אדום ✗), לחץ על ה-deployment ובדוק את ה-Logs

2. **בדוק את ה-Logs:**

   - לך ל-Railway → הפרויקט → **"Deployments"** → לחץ על ה-deployment האחרון
   - לחץ על **"Logs"** או **"View Logs"**
   - חפש שגיאות (אדום) או הודעות שגיאה
   - ודא שה-Server רץ: חפש הודעה כמו `🚀 Server is running on: http://localhost:3000`

3. **ודא שה-Build Settings נכונים:**

   - לך ל-Railway → הפרויקט → **"Settings"** → **"Build"**
   - ודא ש-`Build Command` = `cd server && npm install && npm run build`
   - ודא ש-`Start Command` = `cd server && npm start`
   - ודא ש-`Root Directory` = ריק (או לא מוגדר)

4. **ודא שה-Environment Variables מוגדרים:**

   - לך ל-Railway → הפרויקט → **"Variables"**
   - ודא שיש:
     - `MONGODB_URI` (עם ה-URI הנכון מ-MongoDB Atlas)
     - `JWT_SECRET` (לפחות 32 תווים)
     - `JWT_EXPIRES_IN=7d`
     - `PORT=3000` (או השאר ריק - Railway יקבע אוטומטית)
     - `FRONTEND_URL` (אפשר להשאיר ריק עד שנעלה את Frontend)

5. **בצע Redeploy:**

   - לך ל-Railway → הפרויקט → **"Deployments"**
   - לחץ על ה-deployment האחרון → **"Redeploy"**

6. **אם עדיין לא עובד:**
   - בדוק את ה-Logs שוב - חפש שגיאות MongoDB connection
   - ודא שה-IP whitelist ב-MongoDB Atlas כולל את כל ה-IPs (0.0.0.0/0)
   - ודא שה-MONGODB_URI נכון (כולל שם המשתמש והסיסמה)

### בעיה: Build נכשל ב-Railway

**פתרון:**

1. ודא ש-`Build Command` נכון: `cd server && npm install && npm run build`
2. ודא ש-`Start Command` נכון: `cd server && npm start`
3. בדוק את הלוגים ב-Railway לראות מה השגיאה המדויקת

### בעיה: Build נכשל ב-Vercel

**פתרון:**

1. ודא ש-`Root Directory` מוגדר ל-`client`
2. ודא ש-`Output Directory` מוגדר ל-`dist/client-app/browser`
3. בדוק את הלוגים ב-Vercel לראות מה השגיאה המדויקת

### בעיה: האתר לא נטען או מראה רק רקע תכלת

**פתרון שלב אחר שלב:**

#### שלב 1: בדוק את ה-Console בדפדפן

1. פתח את ה-URL של Vercel בדפדפן
2. לחץ **F12** (או קליק ימני → **Inspect**)
3. לך לטאב **Console**
4. בדוק אם יש שגיאות JavaScript (אדומות)
5. **העתק את כל השגיאות** - זה יעזור לנו לזהות את הבעיה

#### שלב 2: בדוק את ה-Build Settings ב-Vercel

1. לך ל-Vercel → הפרויקט → **Settings**
2. בדוק את ההגדרות הבאות:

   **אם יש לך `vercel.json` ב-root:**

   - **Root Directory** = ריק (או לא מוגדר)
   - **Build Command** = `cd client && npm install && npm run build` (או השאר Auto)
   - **Output Directory** = `client/dist/client-app/browser`

   **אם אין לך `vercel.json` או רוצה להגדיר ב-Vercel:**

   - **Root Directory** = `client`
   - **Build Command** = `npm run build` (או השאר Auto)
   - **Output Directory** = `dist/client-app/browser`

#### שלב 3: בדוק את ה-Environment Variables

1. לך ל-Vercel → הפרויקט → **Settings** → **Environment Variables**
2. ודא שיש משתנה:
   ```
   NG_APP_API_URL=https://YOUR_RENDER_URL.onrender.com
   ```
   (החלף `YOUR_RENDER_URL` עם ה-URL האמיתי של Render)
3. **ודא שה-URL:**
   - מתחיל עם `https://`
   - **ללא סלאש בסוף** (`/`)
   - נכון (העתק אותו מ-Render)

#### שלב 4: בדוק את ה-Logs ב-Vercel

1. לך ל-Vercel → הפרויקט → **Deployments**
2. לחץ על ה-deployment האחרון
3. לך לטאב **Logs**
4. בדוק אם יש שגיאות ב-build
5. חפש הודעות כמו:
   - `Build completed successfully` ✓
   - `Error:` ✗
   - `Failed to build` ✗

#### שלב 5: בצע Redeploy

1. לך ל-Vercel → הפרויקט → **Deployments**
2. לחץ על ה-deployment האחרון → **Redeploy**
3. חכה שה-build מסתיים
4. רענן את הדף בדפדפן

#### שלב 6: אם עדיין לא עובד

**בדוק את `vercel.json`:**

- ודא ש-`vercel.json` נמצא ב-**root** של הפרויקט (לא בתוך `client/`)
- ודא שהתוכן נכון (ראה את הקובץ במדריך)

**בדוק את ה-Console שוב:**

- פתח את ה-Console (F12)
- חפש שגיאות הקשורות ל:
  - `NG_APP_API_URL`
  - `environment.apiUrl`
  - `Failed to load`
  - `404 Not Found`

**אם יש שגיאה "Cannot find module" או "Failed to load":**

- זה אומר שה-Output Directory לא נכון
- נסה לשנות את ה-Output Directory ב-Vercel Settings

**אם יש שגיאת CORS:**

- ודא ש-`FRONTEND_URL` ב-Render מכיל את ה-URL של Vercel
- ודא שה-URL נכון ללא סלאש בסוף

---

## עלויות

### Railway (Backend)

- **חינמי:** 500 שעות CPU בחודש
- **מספיק ל:** אפליקציה קטנה-בינונית
- **אם נגמר:** השרת נכנס למצב שינה עד החודש הבא

### Vercel (Frontend)

- **חינמי:** ללא הגבלה
- **מספיק ל:** כל האפליקציות

### MongoDB Atlas

- **חינמי:** M0 Free Tier
- **מספיק ל:** 512MB storage

**סה"כ:** הכל חינמי! 🎉

---

## טיפים נוספים

1. **שמור את ה-URLs:** רשם את ה-URLs של Railway ו-Vercel במקום בטוח
2. **עדכן את ה-README:** הוסף קישור ל-URL הייצור ב-README
3. **מעקב:** Railway ו-Vercel מספקים dashboards לעקוב אחרי השימוש
4. **Backup:** ודא ש-MongoDB Atlas מוגדר עם backup (אפשרי גם ב-Free Tier)

---

## סיכום

לאחר שתסיים את כל השלבים:

✅ **Backend** רץ על Railway ב-URL: `https://your-app.railway.app`
✅ **Frontend** רץ על Vercel ב-URL: `https://your-app.vercel.app`
✅ **MongoDB** רץ על Atlas (כבר מוגדר)
✅ **כולם יכולים לגשת** לאפליקציה!

**בהצלחה! 🚀**

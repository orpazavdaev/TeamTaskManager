# מדריך העלאה לענן - Team Task Manager

מדריך מפורט להעלאת האפליקציה לענן בחינם, כך שכולם יוכלו לגשת אליה.

## 📋 תוכן עניינים

1. [הכנה](#הכנה)
2. [העלאת Backend ל-Railway](#העלאת-backend-ל-railway)
3. [העלאת Frontend ל-Vercel](#העלאת-frontend-ל-vercel)
4. [קישור Frontend ל-Backend](#קישור-frontend-ל-backend)
5. [פתרון בעיות](#פתרון-בעיות)

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

1. לאחר שה-deployment מסתיים, Railway יצור URL אוטומטי
2. לחץ על **"Settings"** → **"Domains"**
3. תוכל לראות את ה-URL (למשל: `https://your-app-name.up.railway.app`)
4. **שמור את ה-URL הזה** - נצטרך אותו להגדרת Frontend

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
   NG_APP_API_URL=https://YOUR_RAILWAY_URL.railway.app
   ```
   (החלף את `YOUR_RAILWAY_URL` עם ה-URL שקיבלת מ-Railway)

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

### בעיה: האתר לא נטען או מראה 404

**פתרון:**

1. ודא ש-`vercel.json` נמצא ב-root של הפרויקט
2. ודא ש-`rewrites` מוגדר נכון ב-`vercel.json`
3. בצע **Redeploy** ב-Vercel

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

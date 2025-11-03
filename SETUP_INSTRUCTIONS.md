# 🔧 הוראות התקנה והרצה

## שלבים להרצת הפרויקט

### 1️⃣ יצירת קובץ .env (חשוב!)

צור קובץ `.env` בתיקיית `server/` עם התוכן הבא:

```env
PORT=3000
JWT_SECRET=my-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb://localhost:27017/teamtaskmanager
```

**איך ליצור:**

1. פתח את תיקיית `server` ב-VSCode או Explorer
2. צור קובץ חדש בשם `.env` (בדיוק עם הנקודה בתחילה)
3. העתק את התוכן למעלה לקובץ

### 2️⃣ וידוא ש-MongoDB רץ

**אפשרות א' - MongoDB מקומי:**

- התקן MongoDB על המחשב שלך
- ודא שהוא רץ (בדרך כלל על `mongodb://localhost:27017`)

**אפשרות ב' - MongoDB Atlas (מומלץ):**

- הירשם ל-[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- צור Database חינמי
- העתק את ה-Connection String והחלף את `MONGODB_URI` ב-`.env`

**אפשרות ג' - Docker:**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3️⃣ הרצת Backend (Server)

```bash
cd server
npm install  # רק בפעם הראשונה
npm run start:dev
```

השרת צריך לרוץ על: http://localhost:3000

### 4️⃣ הרצת Frontend (Client)

```bash
cd client
npm install  # רק בפעם הראשונה
npm start    # או: npx ng serve
```

**⚠️ אם אתה מקבל שגיאה "ng: command not found":**

- השתמש ב-`npm start` במקום `ng serve` - זה עושה את אותו דבר!
- או השתמש ב-`npx ng serve`

האפליקציה תרוץ על: http://localhost:4200

## ✅ וידוא שהכל עובד

1. פתח דפדפן ונווט ל: **http://localhost:4200**
2. אתה אמור לראות מסך התחברות
3. לחץ על "Register" והירשם
4. לאחר ההתחברות תועבר לרשימת הלוחות

## 🐛 פתרון בעיות

### שגיאת MongoDB Connection

אם אתה רואה שגיאה "MongoServerError" או "connect ECONNREFUSED":

- ודא ש-MongoDB רץ
- בדוק שה-`MONGODB_URI` ב-`.env` נכון
- אם אתה משתמש ב-Atlas, ודא שה-IP שלך מופיע ב-Whitelist

### Backend לא עולה

- בדוק את הטרמינל של Backend - צריך לראות: `🚀 Server is running on: http://localhost:3000`
- אם יש שגיאות TypeScript, בדוק שה-`.env` קיים ונכון

### Frontend לא עולה

- בדוק את הטרמינל של Frontend - צריך לראות שהקומפילציה הסתיימה
- פתח את הקונסול בדפדפן (F12) ובדוק אם יש שגיאות

### דף ריק בדפדפן

- פתח את הקונסול (F12) → Console
- בדוק אם יש שגיאות JavaScript
- בדוק את Network tab - האם השרת מגיב

## 📝 הערות חשובות

1. **חייב** ליצור קובץ `.env` לפני הרצת Backend
2. **חייב** ש-MongoDB יהיה פעיל לפני ניסיון יצירת משתמש
3. שני השרתים (Backend + Frontend) צריכים לרוץ בו-זמנית
4. פתח את http://localhost:4200 בדפדפן

## 🚀 לאחר שהכל עובד

1. פתח: http://localhost:4200
2. הירשם/התחבר
3. צור לוח חדש
4. פתח את הלוח וראה את ה-Kanban Board
5. הוסף משימות וגרור אותן בין עמודות!

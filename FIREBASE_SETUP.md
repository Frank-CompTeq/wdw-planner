# 🔥 Firebase Setup Guide - WDW Planner

## ⚠️ CRITICAL SECURITY NOTICE

**The previous Firebase credentials were publicly exposed in the git history and MUST be regenerated immediately.**

### Steps to Secure Your Firebase Project

1. **Regenerate ALL Firebase credentials**
2. **Set up environment variables**
3. **Configure Firebase Security Rules**

---

## 📋 Prerequisites

- A Firebase project (create one at https://console.firebase.google.com)
- Node.js and npm installed
- Access to your Firebase project settings

---

## 🔐 Step 1: Regenerate Firebase Credentials

### Why Regenerate?

The old credentials were committed to git and are now public. Anyone with these credentials could:
- Access your Firebase project
- Read/write to your database
- Use your authentication system
- Incur costs on your Firebase account

### How to Regenerate

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (wdw-planner-3ee98)
3. Click on **Project Settings** (⚙️ icon)

#### Regenerate Web API Key

1. Go to **Project Settings > General**
2. Scroll to **Your apps** section
3. Find your Web app configuration
4. Click **Delete this app** (if it exists)
5. Click **Add app** > Web (</>) icon
6. Register a new web app:
   - App nickname: `WDW Planner Web`
   - ✅ Also set up Firebase Hosting (optional)
   - Click **Register app**
7. **Copy the new configuration** (you'll need these values)

#### Configure Firebase Authentication

1. Go to **Build > Authentication**
2. Click **Get Started** (if not already enabled)
3. Enable **Email/Password** sign-in method
4. (Optional) Enable other providers as needed

#### Restrict API Keys

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your Firebase project
3. Go to **APIs & Services > Credentials**
4. Find your API key (starts with `AIza...`)
5. Click **Edit** (pencil icon)
6. Under **Application restrictions**:
   - For development: Choose **HTTP referrers**
   - Add: `http://localhost:*` and `http://127.0.0.1:*`
   - For production: Add your actual domain
7. Under **API restrictions**:
   - Choose **Restrict key**
   - Select:
     - Firebase Authentication API
     - Cloud Firestore API
     - Firebase Cloud Messaging API
     - Firebase Storage API
8. Click **Save**

---

## 🔧 Step 2: Configure Environment Variables

### 1. Copy the Example File

```bash
cp .env.example .env
```

### 2. Fill in Your New Credentials

Open `.env` and replace all placeholders with your **new** Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy_YOUR_NEW_API_KEY_HERE
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ
```

### 3. Get Your Configuration Values

From Firebase Console > Project Settings > General > Your apps > Web app:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // → EXPO_PUBLIC_FIREBASE_API_KEY
  authDomain: "xxx.firebaseapp.com", // → EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "xxx",              // → EXPO_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "xxx.firebasestorage.app", // → EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123...",   // → EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123...:web:abc...",  // → EXPO_PUBLIC_FIREBASE_APP_ID
  measurementId: "G-XXX"         // → EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};
```

### 4. Verify .gitignore

Ensure `.env` is in your `.gitignore`:

```bash
grep -q "^.env$" .gitignore || echo ".env" >> .gitignore
```

---

## 🔒 Step 3: Configure Firebase Security Rules

### Firestore Security Rules

1. Go to **Build > Firestore Database > Rules**
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update, delete: if isOwner(userId);
    }

    // Trips collection
    match /trips/{tripId} {
      allow read: if isAuthenticated() && (
        resource.data.metadata.owner_id == request.auth.uid ||
        request.auth.uid in resource.data.metadata.shared_with
      );
      allow create: if isAuthenticated() &&
        request.resource.data.metadata.owner_id == request.auth.uid;
      allow update: if isAuthenticated() &&
        resource.data.metadata.owner_id == request.auth.uid;
      allow delete: if isAuthenticated() &&
        resource.data.metadata.owner_id == request.auth.uid;

      // Trip days subcollection
      match /days/{dayId} {
        allow read, write: if isAuthenticated() && (
          get(/databases/$(database)/documents/trips/$(tripId)).data.metadata.owner_id == request.auth.uid ||
          request.auth.uid in get(/databases/$(database)/documents/trips/$(tripId)).data.metadata.shared_with
        );
      }
    }

    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() &&
        resource.data.user_id == request.auth.uid;
      allow write: if false; // Only Cloud Functions can write
    }

    // Restaurants collection (read-only for all authenticated users)
    match /restaurants/{restaurantId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only admins via Cloud Functions
    }
  }
}
```

3. Click **Publish**

### Firebase Storage Rules

1. Go to **Build > Storage > Rules**
2. Replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **Publish**

---

## ✅ Step 4: Verify Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

### 3. Check for Errors

If you see this error:
```
🔥 Firebase Configuration Error:

Missing required environment variables:
  - EXPO_PUBLIC_FIREBASE_API_KEY
  - EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  ...
```

**Solution:** You haven't created the `.env` file or it's missing values. Follow Step 2 above.

### 4. Test Authentication

1. Open the app in Expo Go or web browser
2. Try to register a new account
3. Check Firebase Console > Build > Authentication > Users
4. Verify the new user appears

---

## 🚨 Security Checklist

- [x] `.env` file created and filled with NEW credentials
- [x] `.env` is in `.gitignore`
- [x] Old credentials regenerated/deleted from Firebase Console
- [x] API keys restricted in Google Cloud Console
- [x] Firestore Security Rules configured
- [x] Storage Security Rules configured
- [x] Authentication enabled in Firebase Console
- [x] Tested authentication works

---

## 📱 Platform-Specific Notes

### Web
- Environment variables work automatically with Expo
- Variables must start with `EXPO_PUBLIC_` to be accessible

### iOS/Android
- Restart the development server after changing `.env`
- Clear cache if needed: `npm start -- --clear`

---

## 🆘 Troubleshooting

### Error: "Firebase Configuration Error"

**Cause:** `.env` file missing or incomplete

**Solution:**
1. Verify `.env` exists: `ls -la .env`
2. Check all variables are filled: `cat .env`
3. Restart dev server: `npm start`

### Error: "Permission denied" when accessing Firestore

**Cause:** Security rules not configured or user not authenticated

**Solution:**
1. Verify Security Rules are published
2. Ensure user is signed in
3. Check user ID matches document owner_id

### API Key Restrictions Too Strict

**Cause:** Google Cloud Console API restrictions blocking requests

**Solution:**
1. Go to Google Cloud Console > Credentials
2. Edit your API key
3. Under "Application restrictions", add your domain/localhost
4. Under "API restrictions", ensure all Firebase APIs are enabled

---

## 📚 Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Google Cloud Console](https://console.cloud.google.com)

---

## 🔄 Rotating Credentials in Production

If you need to rotate credentials in production:

1. Generate new credentials in Firebase Console
2. Update `.env` files on all environments
3. Update CI/CD secrets (GitHub Actions, Vercel, etc.)
4. Deploy new version
5. Delete old credentials from Firebase

---

## ⚠️ Never Commit These Files

```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
firebase-adminsdk-*.json
serviceAccountKey.json
```

These should already be in `.gitignore`, but verify with:

```bash
git check-ignore .env
```

Should output: `.env` (meaning it's ignored)

---

**Last Updated:** 2025-01-26

**Version:** 1.0.0

**Author:** WDW Planner Team

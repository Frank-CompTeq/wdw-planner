# 🏰 WDW Planner

A magical Disney World trip planner built with React Native and Firebase.

## 🚨 CRITICAL SECURITY UPDATE

**If you're setting up this project, please read this first:**

Previous Firebase credentials were accidentally committed to the repository and are now public.

**⚠️ ACTION REQUIRED:**
1. **DO NOT use the old credentials**
2. **Follow the setup guide** in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
3. **Create your own Firebase project** with new credentials
4. **Configure environment variables** properly

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete instructions.

---

## ✨ Features

- 🏰 **Trip Planning**: Create and manage Disney World trips
- 📅 **Calendar View**: Visual trip calendar with date highlighting
- 🍽️ **Meal Planning**: Plan meals at Disney restaurants
- 💎 **DVC Integration**: Disney Vacation Club points tracking
- 📱 **Cross-Platform**: iOS, Android, and Web support
- 🌓 **Dark Mode**: Automatic theme switching
- 🔐 **Secure Authentication**: Firebase Auth with email/password

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Expo CLI
- A Firebase project (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/wdw-planner.git
   cd wdw-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase** (IMPORTANT)
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   # See FIREBASE_SETUP.md for detailed instructions
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your device**
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for Web
   - Scan QR code with Expo Go app

---

## 📁 Project Structure

```
wdw-planner/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── DatePickerInput.tsx
│   │   ├── MealPicker.tsx
│   │   ├── TripCard.tsx
│   │   └── ...
│   ├── screens/          # App screens
│   │   ├── auth/         # Login, Register
│   │   ├── trips/        # Trip management
│   │   ├── dvc/          # DVC features
│   │   ├── settings/     # Settings
│   │   └── LoadingScreen.tsx
│   ├── navigation/       # Navigation configuration
│   ├── services/         # Firebase services
│   │   ├── tripService.ts
│   │   └── dvcService.ts
│   ├── hooks/           # Custom React hooks
│   ├── config/          # App configuration
│   │   └── firebase.ts
│   └── types/           # TypeScript definitions
├── functions/           # Firebase Cloud Functions
├── .env.example        # Environment variables template
├── FIREBASE_SETUP.md   # 🔥 Setup instructions
└── package.json

```

---

## 🔧 Tech Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo** - Development toolchain
- **TypeScript** - Type safety
- **React Navigation** - Navigation library
- **React Native Paper** - Material Design components
- **React Query (TanStack Query)** - Data fetching and caching

### Backend
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database
- **Firebase Cloud Functions** - Serverless functions
- **Firebase Storage** - File storage

### Development Tools
- **Git** - Version control
- **ESLint** - Code linting
- **TypeScript** - Static typing

---

## 🎨 Key Features

### Trip Management
- Create trips with start/end dates
- Visual calendar with trip dates highlighted
- Day-by-day planning (parks, hotels, meals)
- Trip sharing with other users

### Meal Planning
- Select from Disney restaurants
- Plan breakfast, lunch, and dinner
- Track meal status (planned, reserved, confirmed)
- Reservation reminders

### DVC (Disney Vacation Club)
- Track multiple DVC contracts
- Calculate available points
- Validate booking windows (11-month/7-month)
- Points deduction tracking

### User Experience
- Beautiful loading screen with animations
- Dark mode support
- Responsive design (mobile & web)
- Offline-ready architecture
- Progress indicators

---

## 🔐 Security

This project uses environment variables for sensitive configuration.

**Never commit these files:**
- `.env`
- `.env.local`
- `firebase-adminsdk-*.json`
- `serviceAccountKey.json`

**Security features:**
- ✅ Firestore Security Rules
- ✅ API key restrictions
- ✅ Authentication required for all operations
- ✅ User-based access control
- ✅ Environment variables for credentials

See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete security setup.

---

## 📱 Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web browser
```

---

## 🧪 Testing

```bash
npm test           # Run tests (coming soon)
npm run lint       # Run ESLint
npm run type-check # Run TypeScript checks
```

---

## 📚 Documentation

- [Firebase Setup Guide](./FIREBASE_SETUP.md) - Complete Firebase configuration
- [Type Definitions](./src/types/index.ts) - TypeScript interfaces
- [Firebase Functions](./functions/README.md) - Cloud Functions documentation

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

---

## 🐛 Known Issues

- DVC contract selection not yet implemented in CreateTripScreen
- Restaurant database needs to be populated
- Push notifications not fully implemented
- Trip sharing feature incomplete

See [Issues](https://github.com/your-username/wdw-planner/issues) for full list.

---

## 🗺️ Roadmap

### Sprint 1 ✅ (Completed)
- [x] Type consistency fixes
- [x] Date picker implementation
- [x] Loading screen with animations
- [x] Firebase security improvements

### Sprint 2 (In Progress)
- [ ] DVC contract management UI
- [ ] Firebase Security Rules
- [ ] Restaurant database
- [ ] Notification system

### Sprint 3 (Planned)
- [ ] Trip sharing functionality
- [ ] Real-time collaboration
- [ ] Offline mode
- [ ] Analytics dashboard

### Future
- [ ] Restaurant reservation integration
- [ ] Park hours and wait times
- [ ] Budget tracking
- [ ] Photo gallery

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Frank-CompTeq** - Initial work
- **Claude Code** - AI pair programming assistant

---

## 🙏 Acknowledgments

- Disney for the magical inspiration
- Firebase for the backend infrastructure
- Expo team for the amazing development experience
- React Native Paper for beautiful UI components
- The open-source community

---

## 📞 Support

For issues and questions:
- Open an [Issue](https://github.com/your-username/wdw-planner/issues)
- Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for setup help
- Review existing Issues for common problems

---

**Made with ❤️ for Disney fans everywhere**

🏰 Happy planning your magical Disney World adventure! ✨

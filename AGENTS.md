# Repository Guidelines

## Project Structure & Module Organization
WDW Planner is an Expo-managed React Native app. `App.tsx` bootstraps QueryClient, SafeAreaProvider, PaperProvider, and `src/navigation/AppNavigator`. The `src` tree groups domain modules: `src/screens/**` for UI flows (auth, trips, DVC, settings), `src/components/**` for reusable UI, `src/services/**` for Firebase CRUD and notifications, `src/hooks/**` for Query/Zustand hooks, `src/types/**` for shared models, and `src/config/firebase.ts` for client config. Cloud Functions live in `functions/src/**`; generated JS is emitted to `functions/lib`. Assets, rules, and Expo config sit at the repo root. Keep new modules aligned with this layout so mobile, web, and backend pieces stay decoupled.

## Build, Test, and Development Commands
```
npm start            # Expo dev server + Metro bundler
npm run ios          # Launch iOS simulator via Expo
npm run android      # Launch Android emulator
npm run web          # Run the web target in Expo
(cd functions && npm install)   # First-time setup for Cloud Functions
(cd functions && npm run serve) # Build + Firebase emulator for functions
(cd functions && npm run deploy)# Deploy Cloud Functions to Firebase
```
Use Expo Go or simulators to validate UI + notifications; keep Metro running while editing.

## Coding Style & Naming Conventions
TypeScript is strict (`tsconfig.json`) and files use 2-space indentation, single quotes, and semicolons. Components, hooks, and services use PascalCase filenames (e.g., `TripCard.tsx`, `useTrips.ts`). Prefer functional components with React hooks, React Query for async state, Zustand stores for client state, and `async/await` in services. Keep navigation routes declared in `src/navigation`, and colocate feature-specific styles beside the component.

## Testing Guidelines
Automated tests are not wired up yet, so smoke-test every change on at least one mobile target plus web. When adding tests, follow the `*.test.ts[x]` pattern near the code under test or under `src/__tests__`, and cover service logic (Firestore queries, notification scheduling) plus hooks. Record repro steps and screenshots in PRs until Jest/RTL is introduced.

## Commit & Pull Request Guidelines
Recent history (`Trip days: enforce single-line display with inline text + ellipsis`) shows the preferred `<scope>: <imperative summary>` format; keep commits focused and reference files touched. PRs must describe the user-facing impact, list test devices/targets, link related issues, and add screenshots/GIFs for UI updates. Mention any Firebase or function deployments explicitly.

## Security & Configuration Tips
Never commit Firebase secrets; Expo reads runtime values from the `EXPO_PUBLIC_*` env vars referenced in `src/config/firebase.ts`. Update `firestore.rules` alongside data-access changes and run `firebase emulators:start` before deploying. For Cloud Functions, pin Node 18 dependencies and run `npm run build` prior to deploying so TypeScript output stays in sync.

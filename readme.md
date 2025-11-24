# The Tmocker App

The Tmocker app is a mobile-based community of Tumamoc Hill enthusiasts in Tucson, Arizona. This app is still under development and is not officially on the app stores yet. To use it in the meantime, you can download **Expo Go** on your phone.

**Expo Go** is a free mobile app that lets you instantly preview and test apps you’re building without needing to install anything complicated on your phone. It removes the technical hassle of building or installing full app files, so you can focus on designing and testing your app’s look and feel in real time.

## Get Started

### Download Expo Go
-   [Download for iOS](https://apps.apple.com/us/app/expo-go/id982107779)
-   [Download for Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

Once installed, scan the QR code provided at the trailhead (or by the developer) to launch the Tmocker App!

---

## Technical Summary

### App Overview
**Tmocker App** is a React Native mobile application designed for hiking enthusiasts on Tumamoc Hill. It features real-time location tracking, geofenced hike recording, a public profile system, and a competitive leaderboard.

### Tech Stack

#### Frontend
-   **Framework**: [React Native](https://reactnative.dev/) (v0.81.5) with [Expo](https://expo.dev/) (SDK 54).
-   **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (v6) for file-based navigation.
-   **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety.
-   **UI Styling**: `StyleSheet` (standard React Native) + `expo-linear-gradient`.
-   **Icons**: `@expo/vector-icons`.

#### Backend & Data
-   **Database**: [Supabase](https://supabase.com/) (PostgreSQL) for user data, profiles, and hike records.
-   **Authentication**: Supabase Auth (Email/Password).
-   **Storage**: Supabase Storage (for user avatars).

#### Key Libraries
-   **Location**: `expo-location` for real-time GPS tracking.
-   **Geofencing**: `geolib` for distance calculations (haversine formula).
-   **Maps**: `react-native-maps` (currently unused in UI but installed for future needs).
-   **Updates**: `expo-updates` for Over-The-Air (OTA) deployments.

### Key Features

#### 1. Geofenced Hike Tracking
-   **Logic**: Uses `useLocationTracker` hook to monitor user position.
-   **Geofencing**:
    -   **Start**: User must be within 5m of the trailhead to start.
    -   **Stop**: User must be within 5m of the summit to finish.
-   **Stats**: Tracks duration and distance in real-time.

#### 2. Public Profiles
-   **Data Model**: `profiles` table extends Supabase Auth user.
-   **Fields**: `full_name`, `hometown`, `favorite_quote`, `avatar_url`.
-   **UI**: Dedicated profile page (`app/(protected)/profile/[id].tsx`) viewable by anyone.

#### 3. Leaderboard
-   **Logic**: Fetches top hikes ordered by duration (fastest time).
-   **Interactivity**: Links directly to user profiles.
-   **Real-time**: Pull-to-refresh functionality.

### Architecture

#### Folder Structure
-   `app/`: Expo Router pages.
    -   `(public)/`: Auth screens (Sign In, Sign Up, Welcome).
    -   `(protected)/`: Authenticated screens.
        -   `(tabs)/`: Main tab navigation (Home, Leaderboard, Profile).
-   `components/`: Reusable UI components.
-   `hooks/`: Custom logic (e.g., `useLocationTracker`, `useSupabase`).
-   `lib/`: Configuration (Supabase client).
-   `assets/`: Images and fonts.

### Deployment
-   **EAS Update**: Configured for "preview" branch for rapid testing.
-   **EAS Build**: Ready for Android/iOS binary builds.
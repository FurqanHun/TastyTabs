# TastyTabs 🍌

**High-Performance Recipe Discovery & Vault**

## Project Overview

**TastyTabs** is a native mobile application built using **React Native** and **Expo SDK 54+**. By leveraging the **Expo Router (/app structure)**, the app implements a file-based routing system that inherently supports **Tabs**, **Stacks**, and **Drawer** navigation.

The app connects to **TheMealDB API** to fetch global culinary data and uses a local persistence layer to allow users to manage their own recipe vault with full **CRUD** (Create, Read, Update, Delete) capabilities.

---

## 🚀 Key Features

* **File-Based Navigation:** Zero-config routing using the `/app` directory.
* **Triple-Threat Navigation:**
* **(drawer):** Side-menu for User Settings and App Info.
* **(tabs):** Bottom navigation for *Home*, *Search*, and *Favorites*.
* **[id]:** Dynamic stack routing for detailed recipe views.


* **The Vault (Privacy-First CRUD):**
* **Create:** "Heart" a recipe to save it to local storage.
* **Read:** Access your saved collection instantly.
* **Update:** Add/Edit personal "Chef Notes" and ratings on saved meals.
* **Delete:** Remove recipes from the vault with a swipe.



---

## 🛠️ Technical Stack

* **Framework:** React Native + Expo (Managed Workflow).
* **Routing:** `expo-router` (Native Navigation).
* **API:** RESTful integration with [TheMealDB](https://www.themealdb.com/api.php).
* **Persistence:** `expo-sqlite` or `AsyncStorage` (Local-only, privacy-focused).
* **UI:** NativeWind (Tailwind CSS for Mobile) or StyleSheet for a lean, non-Electron feel.

---

## 📂 Project Structure (`/app` Pattern)

```text
TastyTabs/
├── app/                      # EXPO ROUTER CORE
│   ├── (drawer)/             # Drawer Navigation Group
│   │   ├── _layout.tsx       # Drawer config
│   │   ├── (tabs)/           # Tab Navigation (Nested in Drawer)
│   │   │   ├── _layout.tsx   # Tab config
│   │   │   ├── index.tsx     # Home Screen
│   │   │   ├── search.tsx    # Search Screen
│   │   │   └── vault.tsx     # CRUD / Favorites Screen
│   │   └── settings.tsx      # Settings Screen
│   ├── recipe/               # Stack Navigation Group
│   │   └── [id].tsx          # Dynamic Recipe Detail Page
│   └── _layout.tsx           # Root Layout (Providers)
├── components/               # Atomic UI Components
├── constants/                # Colors & API Keys
├── hooks/                    # Custom CRUD and API hooks
└── services/                 # API client (Axios/Fetch)

```

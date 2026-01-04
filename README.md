# TastyTabs 🍔

**High-Performance Recipe Discovery & Vault**

## Project Overview

**TastyTabs** is a native mobile application built using **React Native** and **Expo SDK 54+**. By leveraging the **Expo Router (/app structure)**, the app implements a file-based routing system that inherently supports **Tabs**, **Stacks**, and **Drawer** navigation.

The app connects to **TheMealDB API** to fetch global culinary data and uses a local persistence layer to allow users to manage their own recipe vault with full **CRUD** (Create, Read, Update, Delete) capabilities.

---

## Key Features

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

* Personal Recipe Creation (Privacy-First CRUD, Local Storage):
  * **Create:** Add a new recipe to your personal collection.
  * **Read:** View your saved personal recipes.
  * **Update:** Edit personal recipe details and ratings.
  * **Delete:** Remove personal recipes from your collection.

* Data Management (Selective):
  * **Backup:** Export your notes, vault or personal recipes data to a JSON file.
  * **Restore:** Import a JSON file to restore your data.
  * **Delete:** Remove all data from local storage.

---

## Technical Stack

* **Framework:** React Native + Expo (Managed Workflow).
* **Routing:** `expo-router` (Native Navigation).
* **API:** RESTful integration with [TheMealDB](https://www.themealdb.com/api.php).
* **Persistence:** `redux-persist` which uses `AsyncStorage` (Local-only, privacy-focused).
* **UI:** StyleSheet for a lean, non-Electron feel.

---

## Project Structure (`/app` Pattern)

```text
TastyTabs/
├── app/                      # EXPO ROUTER CORE
│   ├── (drawer)/             # Drawer Navigation Group
│   │   ├── _layout.jsx       # Drawer config
│   │   ├── (tabs)/           # Tab Navigation (Nested in Drawer)
│   │   │   ├── _layout.jsx   # Tab config
│   │   │   ├── index.jsx     # Home Screen
│   │   │   ├── search.jsx    # Search Screen
│   │   │   └── vault.jsx       # Favorites Screen
│   │   ├── mypersonalrecipe.jsx # My Personal Recipe Screen
│   │   ├── privacypolicy.jsx # Privacy Policy Screen
│   │   └── settings.jsx      # Settings Screen
│   ├── recipe/               # Stack Navigation Group
│   │   └── [id].tsx          # Dynamic Recipe Detail Page
│   └── _layout.tsx           # Root Layout (Providers)
├── Store/
│   ├── Slices/                      # Store configuration
│   │   ├── personalNotesSlice.js    # Personal Notes Slice
│   │   ├── personalrecipeSlice.js   # Personal Recipe Slice
│   │   ├── preferencesSlice.js      # Preferences Slice
│   │   ├── recipeSlice.js           # Recipe Slice
│   │   └── vaultSlice.js            # Vault Slice
│   └── store.js                     # Store
├── components/                      # Atomic UI Components
    └── MealCard.jsx                 # Meal Card Component
└── api/                             # API client (Axios/Fetch)
    ├── mealdetail.js                # Meal Detail API Client
    ├── listallmeals.js              # List All Meals API Client 
    ├── fetchcategory.js             # Fetch Category API Client
    └── search.js                    # Search API Client
```

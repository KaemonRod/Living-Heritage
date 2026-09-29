# 🏛️ Living Heritage Platform

> **Preserving cultural heritage, artisan crafts, and oral traditions through interactive maps, smart trails, and AI guidance.**

Living Heritage is a modern, interactive web application designed to connect people with tangible and intangible cultural heritage. Explore historical sites, discover local artisans, follow curated smart trails, engage with an AI Heritage Guide, and track your journeys with a Digital Heritage Passport.

---

## ✨ Features

- 🗺️ **Interactive Live Map**: Explore heritage monuments, cultural hubs, and historic sites on an interactive Leaflet map.
- 📍 **Near Me**: Discover historical sites and cultural points of interest near your current location using GPS.
- 🚶 **Smart Trails**: Follow curated walking routes and thematic cultural trails with rich multimedia points of interest.
- 🤖 **AI Heritage Guide**: Converse with an AI companion tailored to provide historical context, stories, and answers.
- 🎨 **Crafts & Living Voices**: Uncover intangible heritage, traditional artisans, oral histories, and folk art forms.
- 🎟️ **Digital Heritage Passport**: Earn stamps and achievements as you visit cultural sites and complete trails.
- 🤝 **Community Contributions**: Contribute local stories, historical photos, and heritage sites to preserve community history.
- 📱 **Offline Capable**: Built with PWA (Progressive Web App) service worker support for offline access.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Routing**: React Router DOM v7
- **Mapping**: Leaflet + React-Leaflet
- **Styling**: TailwindCSS v4 + Custom CSS
- **Icons**: Lucide React
- **Linter**: Oxlint

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KaemonRod/Living-Heritage.git
   cd Living-Heritage/Heritage/Heritage
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   # or in PowerShell: npm.cmd run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173` (or the port specified in terminal).

---

## 📁 Project Structure

```text
Living-Heritage/
└── Heritage/
    └── Heritage/
        ├── public/           # Static assets & PWA manifest
        ├── src/
        │   ├── components/   # UI Layout & shared components
        │   ├── data/         # Mock data & heritage site datasets
        │   ├── pages/        # Main application pages
        │   ├── services/     # API & AI Guide service handlers
        │   ├── types/        # TypeScript type definitions
        │   ├── App.tsx       # Main app component & routing
        │   └── main.tsx      # Application entry point
        ├── index.html
        ├── package.json
        └── vite.config.ts
```

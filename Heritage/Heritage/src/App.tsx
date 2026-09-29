import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { HeritageDetailPage } from './pages/HeritageDetailPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { NearMePage } from './pages/NearMePage';
import { SmartTrailsPage } from './pages/SmartTrailsPage';
import { AIGuidePage } from './pages/AIGuidePage';
import { CraftsAndVoicesPage } from './pages/CraftsAndVoicesPage';
import { PassportPage } from './pages/PassportPage';
import { ContributePage } from './pages/ContributePage';

export function App() {
  useEffect(() => {
    // Register PWA Service Worker for Offline Pack
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Living Heritage Service Worker registered:', reg.scope))
        .catch((err) => console.log('Service Worker registration failed:', err));
    }
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/site/:id" element={<HeritageDetailPage />} />
          <Route path="/map" element={<LiveMapPage />} />
          <Route path="/near-me" element={<NearMePage />} />
          <Route path="/trails" element={<SmartTrailsPage />} />
          <Route path="/trails/:id" element={<SmartTrailsPage />} />
          <Route path="/ai-guide" element={<AIGuidePage />} />
          <Route path="/crafts-voices" element={<CraftsAndVoicesPage />} />
          <Route path="/passport" element={<PassportPage />} />
          <Route path="/contribute" element={<ContributePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

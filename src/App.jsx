import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import UploadsPage from './pages/UploadsPage';
import PackagesPage from './pages/PackagesPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import UploadDetails from './pages/UploadDetails';
import PackageDetails from './pages/PackageDetails';
import { NotificationProvider } from './context/NotificationContext';
import DevToolsBlocker from './components/DevToolsBlocker';
import AnnouncementPopup from './components/AnnouncementPopup';
import ScrollToTop from './components/ScrollToTop';
import { useTracking } from './hooks/useTracking';
import './index.css';

// Inner component — lives INSIDE BrowserRouter so useLocation() works
function AppInner() {
  console.log("AppInner: Rendering");
  useTracking();
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/uploads" element={<UploadsPage />} />
        <Route path="/uploads/:slug" element={<UploadDetails />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/packages/:slug" element={<PackageDetails />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      <Footer />
      <AnnouncementPopup />
    </>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <DevToolsBlocker />
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
}

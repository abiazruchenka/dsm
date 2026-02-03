import './App.css';
import Header from './components/Header/Header';
import Home from './components/Home/Home';
import Startpage from './components/Startpage/Startpage';
import Events from './components/Events/Events';
import Gallery from './components/Gallery/Gallery';
import Login from './components/Login/Login';
import Admin from './components/Admin/Admin';
import Album from './components/Gallery/Album';
import Contact from './components/Contact/Contact';
import ContactMessages from './components/Contact/ContactMessages';
import Reenactment from './components/Reenactment/Reenactment';
import { Routes, Route, useLocation, Navigate  } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { isAdmin, isAuthenticated } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  const AdminContent = ({ userContent, adminContent }) => {
    return isAuthenticated ? adminContent : userContent;
  };

  
  return (
      <div className="App">
        <Header />
        <main className={`page-content ${isHome ? 'home-background' : 'page-background'}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/"  element={<Home />} />
            <Route path="/startpage" element={<Startpage />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<Gallery isAdmin={isAdmin} />} /> 
            <Route path="/reenactment" element={<Reenactment />} />
            <Route 
              path="/contact" 
              element={
                <AdminContent
                  userContent={<Contact />}
                  adminContent={<ContactMessages />}
                />
              }
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="/gallery/:galleryId" element={<Album isAdmin={isAdmin} />} />

            {/* 
            <Route path="/statute" element={<Statute />} />
            <Route path="/about" element={<About />} /> */}
          </Routes>
        </main>
      </div>   
  );
};

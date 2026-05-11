import './App.css';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
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
import EventDetail from './components/Events/EventDetail';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

function getContentBackground(pathname) {
  if (pathname === '/' || pathname === '/login') return 'home-background';
  if (pathname === '/contact' || pathname === '/admin') return 'page-background';
  return 'simple-background';
}

export default function App() {
  const { isAdmin, isAuthenticated } = useAuth();
  const location = useLocation();

  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  const AdminContent = ({ userContent, adminContent }) => {
    return isAuthenticated ? adminContent : userContent;
  };

  const showFooter = location.pathname !== '/';

  return (
      <div className="App">
        <Header />
        <div className={`content-area ${getContentBackground(location.pathname)}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/"  element={<Home />} />
            <Route path="/startpage" element={<Startpage />} />
            <Route path="/events" element={<Events isAdmin={isAdmin}/>} />
            <Route path="/gallery" element={<Gallery isAdmin={isAdmin} />} /> 
            <Route path="/reenactment" element={<Reenactment isAdmin={isAdmin} />} />
            <Route path="/reenactment/:blockId" element={<Reenactment isAdmin={isAdmin} />} />
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
            <Route path="/events/:eventId" element={<EventDetail isAdmin={isAdmin} />} />
            {/* 
            <Route path="/statute" element={<Statute />} />
            <Route path="/about" element={<About />} /> */}
          </Routes>
          {showFooter && <Footer />}
        </div>
      </div>   
  );
};

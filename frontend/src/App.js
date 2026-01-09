import './App.css';
import Header from './components/Header/Header';
import Home from './components/Home/Home';
import Startpage from './components/Startpage/Startpage';
import Events from './components/Events/Events';
import Gallery from './components/Gallery/Gallery';
import Login from './components/Login/Login';
import Admin from './components/Admin/Admin';
import Contact from './components/Contact/Contact';
import Reenactment from './components/Reenactment/Reenactment';
import { Routes, Route, useLocation, Navigate  } from 'react-router-dom';
import { authService } from './services/authService';

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const ProtectedRoute = ({ children }) => {
    const isAuthenticated = authService.isAuthenticated();
    return isAuthenticated ? children : <Navigate to="/login" />;
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
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/reenactment" element={<Reenactment />} />
            <Route path="/contact" element={<Contact />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />

            {/* 
            <Route path="/statute" element={<Statute />} />
            <Route path="/about" element={<About />} /> */}
          </Routes>
        </main>
      </div>   
  );
};

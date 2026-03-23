import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const [active, setActive] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Home", id: "home" },
    { name: "Features", id: "features" },
    { name: "About Us", id: "about" },
    { name: "Reviews", id: "reviews" },
    { name: "Contact Us", id: "contact" },
  ];

  // Check if current page is a dashboard page - MUST be after all hooks
  const isDashboard = location.pathname.includes('/dashboard') || 
                       location.pathname.includes('/admin') ||
                       location.pathname.includes('/profile') ||
                       location.pathname.includes('/history') ||
                       location.pathname.includes('/tracking') ||
                       location.pathname.includes('/browse') ||
                       location.pathname.includes('/messages') ||
                       location.pathname.includes('/needs') ||
                       location.pathname.includes('/donations') ||
                       location.pathname.includes('/create') ||
                       location.pathname.includes('/settings') ||
                       location.pathname.includes('/verifications') ||
                       location.pathname.includes('/reports') ||
                       location.pathname.includes('/users');

  // Handle scroll effect
  useEffect(() => {
    // Don't run scroll effects on dashboard pages
    if (isDashboard) return;
    
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDashboard]);

  // Set active menu item based on scroll position when on home page
  useEffect(() => {
    // Don't run on dashboard pages
    if (isDashboard) return;
    
    if (location.pathname === "/") {
      const handleScrollSpy = () => {
        const sections = menuItems.map(item => document.getElementById(item.id));
        const scrollPosition = window.scrollY + 150;

        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          if (section && section.offsetTop <= scrollPosition) {
            setActive(menuItems[i].id);
            break;
          }
        }
      };

      window.addEventListener("scroll", handleScrollSpy);
      return () => window.removeEventListener("scroll", handleScrollSpy);
    }
  }, [location.pathname, isDashboard]);

  const handleScroll = (id) => {
    setActive(id);
    
    // If we're not on the home page, navigate to home first then scroll
    if (location.pathname !== "/") {
      navigate("/");
      // Wait for navigation to complete then scroll
      setTimeout(() => {
        const section = document.getElementById(id);
        if (section) {
          section.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  const handleLogoClick = () => {
    navigate("/");
    setActive("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Don't render navbar on dashboard pages
  if (isDashboard) {
    return null;
  }

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-left" onClick={handleLogoClick}>
        <img src={logo} alt="Logo" className="nav-logo" />
        <span>ChariTree</span>
      </div>

      <ul className="nav-links">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={active === item.id ? "active" : ""}
            onClick={() => handleScroll(item.id)}
          >
            {item.name}
          </li>
        ))}
      </ul>

      <div className="nav-buttons">
        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>
        <button className="signup-btn" onClick={handleSignUp}>
          Sign Up
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
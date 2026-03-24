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

  // Only show navbar on landing page (home page)
  const showNavbar = location.pathname === "/";

  // Handle scroll effect
  useEffect(() => {
    if (!showNavbar) return;
    
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showNavbar]);

  // Set active menu item based on scroll position when on home page
  useEffect(() => {
    if (!showNavbar || location.pathname !== "/") return;
    
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
  }, [location.pathname, showNavbar]);

  const handleScroll = (id) => {
    setActive(id);
    
    if (location.pathname !== "/") {
      navigate("/");
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

  if (!showNavbar) {
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
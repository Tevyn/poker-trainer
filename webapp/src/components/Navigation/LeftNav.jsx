import { useNavigate, useLocation } from 'react-router-dom';

// LeftNav component with mobile support
export default function LeftNav({ appState, mobileMenuOpen, closeMobileMenu }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavItemClick = (path) => {
    navigate(path);
    
    // Close mobile menu on item click (for mobile)
    if (window.innerWidth <= 768 && closeMobileMenu) {
      closeMobileMenu();
    }
  };

  // Helper function to check if current route matches the nav item
  const isActive = (path) => {
    if (path === '/study') {
      return location.pathname === '/' || location.pathname === '/study';
    }
    return location.pathname === path;
  };

  return (
    <nav className={`left-nav ${mobileMenuOpen ? 'mobile-open' : ''}`} id="leftNav">
      <div className="nav-header">
        <h1>Poker Trainer</h1>
        {/* Mobile close button */}
        {mobileMenuOpen && (
          <button 
            className="mobile-close-btn"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            ×
          </button>
        )}
      </div>
      <div className="nav-content">
        <div className="nav-section">
          <div className="nav-section-header">
            <span className="section-title">Preflop</span>
          </div>
          <div className="nav-section-items">
            <button 
              className={`nav-item ${isActive('/study') ? 'active' : ''}`}
              onClick={() => handleNavItemClick('/study')}
            >
              <span className="nav-label">Study Ranges</span>
            </button>
            <button 
              className={`nav-item ${isActive('/test') ? 'active' : ''}`}
              onClick={() => handleNavItemClick('/test')}
            >
              <span className="nav-label">Test Ranges</span>
            </button>
            <button 
              className={`nav-item ${isActive('/handpractice') ? 'active' : ''}`}
              onClick={() => handleNavItemClick('/handpractice')}
            >
              <span className="nav-label">Hand Practice</span>
            </button>
          </div>
        </div>
      </div>
      <div className="nav-footer">
        <button 
          className={`nav-item ${isActive('/ranges') ? 'active' : ''}`}
          onClick={() => handleNavItemClick('/ranges')}
        >
          <span className="nav-label">Ranges</span>
        </button>
      </div>
    </nav>
  );
}

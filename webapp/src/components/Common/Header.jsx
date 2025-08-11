import { useEffect, useState } from 'react';

// Header component with situation and practice category selectors
export default function Header({ appState }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    currentMode,
    savedRanges,
    currentCategory,
    currentRangeId,
    switchToSituation,
    categoryTestMode,
    categoryTestData,
    currentPracticeCategory,
    setCurrentPracticeCategory
  } = appState;

  // Populate situation selector options
  const renderSituationOptions = () => {
    const options = [];
    
    Object.entries(savedRanges?.categories || {}).forEach(([categoryId, category]) => {
      // Add category option (for testing entire category)
      options.push(
        <option 
          key={`category:${categoryId}`}
          value={`category:${categoryId}`}
          style={{ fontWeight: 'bold', backgroundColor: '#2a2a2a' }}
        >
          {category.name}
        </option>
      );
      
      // Add individual situations in this category
      Object.entries(category.ranges || {}).forEach(([rangeId, range]) => {
        options.push(
          <option key={`${categoryId}:${rangeId}`} value={`${categoryId}:${rangeId}`}>
            &nbsp;&nbsp;{range.name}
          </option>
        );
      });
    });
    
    return options;
  };

  // Get current situation value for selector
  const getCurrentSituationValue = () => {
    if (categoryTestMode) {
      return `category:${categoryTestData.category}`;
    }
    return `${currentCategory}:${currentRangeId}`;
  };

  const handleSituationChange = (e) => {
    switchToSituation(e.target.value);
  };

  const handlePracticeCategoryChange = (e) => {
    setCurrentPracticeCategory(e.target.value);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    const leftNav = document.getElementById('leftNav');
    const navOverlay = document.getElementById('navOverlay');
    
    if (!mobileMenuOpen) {
      leftNav?.classList.add('mobile-open');
      navOverlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      leftNav?.classList.remove('mobile-open');
      navOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    const leftNav = document.getElementById('leftNav');
    const navOverlay = document.getElementById('navOverlay');
    
    leftNav?.classList.remove('mobile-open');
    navOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Close mobile menu on window resize if screen gets larger
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        closeMobileMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="main-header">
      <div className="header-controls">
        {/* Situation Selection - shown in study, test, and ranges modes */}
        {(currentMode === 'study' || currentMode === 'test' || currentMode === 'ranges') && (
          <div className="header-selector-group">
            <label htmlFor="situationSelect" className="header-label">Situation:</label>
            <select 
              id="situationSelect" 
              className="header-select"
              value={getCurrentSituationValue()}
              onChange={handleSituationChange}
            >
              {renderSituationOptions()}
            </select>
          </div>
        )}
        
        {/* Practice Category Selection - shown only in handpractice mode */}
        {currentMode === 'handpractice' && (
          <div className="header-selector-group">
            <label htmlFor="headerPracticeCategorySelect" className="header-label">Category:</label>
            <select 
              id="headerPracticeCategorySelect" 
              className="header-select"
              value={currentPracticeCategory}
              onChange={handlePracticeCategoryChange}
            >
              <option value="open_raises">Open Raises</option>
              <option value="facing_3bet">Facing 3-bet</option>
              <option value="facing_4bet">Facing 4-bet</option>
              <option value="facing_5bet_allin">Facing 5-bet All-in</option>
            </select>
          </div>
        )}
      </div>
      <button 
        className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`} 
        aria-label="Toggle navigation"
        onClick={toggleMobileMenu}
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>
    </header>
  );
}

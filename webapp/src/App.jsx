import { MantineProvider } from '@mantine/core';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppState } from './hooks/useAppState';
import LeftNav from './components/Navigation/LeftNav';
import Header from './components/Common/Header';
import RangeGrid from './components/RangeGrid/RangeGrid';
import StudyMode from './components/Modes/StudyMode';
import TestMode from './components/Modes/TestMode';
import HandPracticeMode from './components/Modes/HandPracticeMode';

import './styles/globals.css';
import './styles/components.css';

// Component wrapper for each mode route
function ModeWrapper({ children, mode, appState }) {
  const { isDragging, setIsDragging } = appState;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  // Global mouse event handlers for drag functionality
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    const handleGlobalMouseLeave = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mouseleave', handleGlobalMouseLeave);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mouseleave', handleGlobalMouseLeave);
    };
  }, [isDragging, setIsDragging]);

  return (
    <div className="app-layout">
      {/* Mobile Navigation Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="mobile-backdrop" 
          onClick={closeMobileMenu}
        ></div>
      )}
      
      {/* Left Navigation */}
      <LeftNav 
        appState={appState} 
        mobileMenuOpen={mobileMenuOpen}
        closeMobileMenu={closeMobileMenu}
      />
      
      {/* Main Content Area */}
      <div className="main-container">
        <Header 
          appState={appState}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          closeMobileMenu={closeMobileMenu}
        />
        
        <div className="main-content">
          <div className="main-content-layout">
            {/* Mode-specific Controls - Left Side */}
            <div className="mode-controls">
              {children}
            </div>
            
            {/* View Toggle - Right Side */}
            {(mode === 'study' || mode === 'test' || mode === 'ranges') && (
              <div className="main-content-view-toggle">
                <div className="view-toggle">
                  <button 
                    className={`view-btn ${appState.currentView === 'grid' ? 'active' : ''}`}
                    onClick={() => appState.setCurrentView('grid')}
                    title="Grid View"
                  >
                    Grid
                  </button>
                  <button 
                    className={`view-btn ${appState.currentView === 'pattern' ? 'active' : ''}`}
                    onClick={() => appState.setCurrentView('pattern')}
                    title="Pattern View"
                  >
                    Pattern
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Range Grid - hidden in handpractice mode */}
        {mode !== 'handpractice' && (
          <>
            <div className="range-container">
              <RangeGrid appState={appState} />
            </div>
            
            <div className="legend">
              <div className="legend-item">
                <div className="legend-color raise"></div>
                <span>Raise</span>
              </div>
              <div className="legend-item">
                <div className="legend-color call"></div>
                <span>Call</span>
              </div>
              <div className="legend-item">
                <div className="legend-color fold"></div>
                <span>Fold (default)</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Inner app component that uses routing hooks
function AppContent() {
  const appState = useAppState();

  return (
    <Routes>
      <Route path="/" element={
        <ModeWrapper mode="study" appState={appState}>
          <StudyMode appState={appState} />
        </ModeWrapper>
      } />
      <Route path="/study" element={
        <ModeWrapper mode="study" appState={appState}>
          <StudyMode appState={appState} />
        </ModeWrapper>
      } />
      <Route path="/test" element={
        <ModeWrapper mode="test" appState={appState}>
          <TestMode appState={appState} />
        </ModeWrapper>
      } />
      <Route path="/handpractice" element={
        <ModeWrapper mode="handpractice" appState={appState}>
          <HandPracticeMode appState={appState} />
        </ModeWrapper>
      } />
      <Route path="/ranges" element={
        <ModeWrapper mode="ranges" appState={appState}>
          <StudyMode appState={appState} />
        </ModeWrapper>
      } />

    </Routes>
  );
}

function App() {
  return (
    <MantineProvider>
      <Router>
        <AppContent />
      </Router>
    </MantineProvider>
  );
}

export default App;

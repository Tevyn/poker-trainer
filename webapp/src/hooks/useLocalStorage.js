import { useState, useEffect } from 'react';

/**
 * Custom hook for localStorage management with React state synchronization
 * @param {string} key - The localStorage key
 * @param {*} initialValue - Initial value if nothing is stored
 * @returns {[*, function]} - [storedValue, setValue] tuple
 */
export function useLocalStorage(key, initialValue) {
  // Get stored value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Hook specifically for managing poker ranges in localStorage
 */
export function useRangeStorage() {
  const [savedRanges, setSavedRanges] = useLocalStorage('pokerRanges', null);
  const [currentCategory, setCurrentCategory] = useLocalStorage('currentCategory', 'open_raises');
  const [currentRangeId, setCurrentRangeId] = useLocalStorage('currentRangeId', 'lj');

  // Save ranges with current selection metadata
  const saveRangesWithMeta = (ranges) => {
    const rangesWithMeta = {
      ...ranges,
      currentCategory,
      currentRange: currentRangeId,
      lastUpdated: Date.now()
    };
    setSavedRanges(rangesWithMeta);
  };

  return {
    savedRanges,
    setSavedRanges,
    saveRangesWithMeta,
    currentCategory,
    setCurrentCategory,
    currentRangeId,
    setCurrentRangeId
  };
}

/**
 * Hook for managing user settings
 */
export function useUserSettings() {
  const [defaultView, setDefaultView] = useLocalStorage('pokerDefaultView', 'pattern');
  const [currentView, setCurrentView] = useLocalStorage('currentView', null);
  
  // Use default view if current view is not set
  const activeView = currentView || defaultView;
  
  const updateCurrentView = (view) => {
    setCurrentView(view);
  };
  
  const updateDefaultView = (view) => {
    setDefaultView(view);
    // If current view is not explicitly set, it will follow the default
    if (!currentView) {
      setCurrentView(view);
    }
  };

  return {
    defaultView,
    currentView: activeView,
    setCurrentView: updateCurrentView,
    setDefaultView: updateDefaultView
  };
}

/**
 * Hook for managing practice statistics
 */
export function usePracticeStats() {
  const [practiceStats, setPracticeStats] = useLocalStorage('practiceStats', {
    correct: 0,
    total: 0,
    streak: 0,
    bestStreak: 0,
    accuracy: 0
  });

  const updateStats = (correct, total) => {
    setPracticeStats(prevStats => {
      const newCorrect = prevStats.correct + correct;
      const newTotal = prevStats.total + total;
      const newAccuracy = newTotal > 0 ? (newCorrect / newTotal) * 100 : 0;
      
      let newStreak = prevStats.streak;
      let newBestStreak = prevStats.bestStreak;
      
      if (correct === total) {
        // All correct, increment streak
        newStreak += 1;
        newBestStreak = Math.max(newBestStreak, newStreak);
      } else {
        // Some incorrect, reset streak
        newStreak = 0;
      }

      return {
        correct: newCorrect,
        total: newTotal,
        streak: newStreak,
        bestStreak: newBestStreak,
        accuracy: parseFloat(newAccuracy.toFixed(1))
      };
    });
  };

  const resetStats = () => {
    setPracticeStats({
      correct: 0,
      total: 0,
      streak: 0,
      bestStreak: 0,
      accuracy: 0
    });
  };

  return {
    practiceStats,
    updateStats,
    resetStats
  };
}

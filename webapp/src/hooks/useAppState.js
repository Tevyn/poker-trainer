import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useRangeStorage, useUserSettings, usePracticeStats } from './useLocalStorage';
import { defaultRanges } from '../data/defaultRanges';
import { getHandAction, setHandAction, createEmptyRange } from '../utils/rangeUtils';

/**
 * Main application state management hook
 * Centralizes all application state and provides unified interface
 */
export function useAppState() {
  const location = useLocation();
  
  // Core mode and navigation state - derive from URL
  const getCurrentModeFromPath = useCallback(() => {
    const path = location.pathname;
    if (path === '/' || path === '/study') return 'study';
    if (path === '/test') return 'test';
    if (path === '/handpractice') return 'handpractice';
    if (path === '/ranges') return 'ranges';
    if (path === '/settings') return 'settings';
    return 'study'; // default
  }, [location.pathname]);

  const [currentMode, setCurrentMode] = useState(() => getCurrentModeFromPath());
  const [editMode, setEditMode] = useState(false);
  const [editingRange, setEditingRange] = useState({});
  
  // Update currentMode when URL changes
  useEffect(() => {
    const newMode = getCurrentModeFromPath();
    if (newMode !== currentMode) {
      setCurrentMode(newMode);
    }
  }, [location.pathname, currentMode, getCurrentModeFromPath]);
  
  // Range and selection state
  const {
    savedRanges,
    setSavedRanges,
    saveRangesWithMeta,
    currentCategory,
    setCurrentCategory,
    currentRangeId,
    setCurrentRangeId
  } = useRangeStorage();
  
  // User preferences
  const { defaultView, currentView, setCurrentView, setDefaultView } = useUserSettings();
  
  // Practice statistics
  const { practiceStats, updateStats, resetStats } = usePracticeStats();
  
  // Test mode state
  const [selectedAction, setSelectedAction] = useState('raise');
  const [userSelections, setUserSelections] = useState({});
  
  // Category test state
  const [categoryTestMode, setCategoryTestMode] = useState(false);
  const [categoryTestData, setCategoryTestData] = useState({
    category: '',
    situations: [],
    currentIndex: 0,
    results: []
  });
  
  // Hand practice state
  const [handPracticeMode, setHandPracticeMode] = useState(false);
  const [multiRangePracticeMode, setMultiRangePracticeMode] = useState(false);
  const [currentPracticeCategory, setCurrentPracticeCategory] = useState('open_raises');
  const [currentPracticeHand, setCurrentPracticeHand] = useState(null);
  const [multiRangeAnswers, setMultiRangeAnswers] = useState({});
  const [multiRangeResults, setMultiRangeResults] = useState({});
  
  // Drag state for range selection
  const [isDragging, setIsDragging] = useState(false);
  
  // Initialize ranges on first load
  useEffect(() => {
    if (!savedRanges) {
      const initialRanges = {
        ...defaultRanges,
        currentCategory,
        currentRange: currentRangeId,
        lastUpdated: Date.now()
      };
      setSavedRanges(initialRanges);
    }
  }, [savedRanges, setSavedRanges, currentCategory, currentRangeId]);

  // Get current range data
  const getCurrentRange = useCallback(() => {
    if (!savedRanges?.categories?.[currentCategory]?.ranges?.[currentRangeId]) {
      return {};
    }
    return savedRanges.categories[currentCategory].ranges[currentRangeId].range || {};
  }, [savedRanges, currentCategory, currentRangeId]);

  // Define functions before they're used in useEffect
  const exitEditMode = useCallback(() => {
    setEditMode(false);
    setEditingRange({});
  }, []);

  const exitCategoryTest = useCallback(() => {
    setCategoryTestMode(false);
    setCategoryTestData({
      category: '',
      situations: [],
      currentIndex: 0,
      results: []
    });
  }, []);

  // Handle mode changes (triggered by URL changes)
  useEffect(() => {
    // Exit edit mode if switching modes
    if (editMode && currentMode !== 'ranges') {
      exitEditMode();
    }
    
    // Clear category test when switching modes
    if (currentMode !== 'test' && categoryTestMode) {
      exitCategoryTest();
    }
    
    // Exit practice modes when switching
    if (currentMode !== 'handpractice') {
      if (handPracticeMode) setHandPracticeMode(false);
      if (multiRangePracticeMode) setMultiRangePracticeMode(false);
    }
  }, [currentMode, editMode, categoryTestMode, handPracticeMode, multiRangePracticeMode, exitEditMode, exitCategoryTest]);

  // Range editing functions
  const startEditMode = useCallback(() => {
    const currentRange = getCurrentRange();
    const newEditingRange = {};
    
    // Deep copy current range for editing
    if (currentRange.raise) newEditingRange.raise = [...currentRange.raise];
    if (currentRange.call) newEditingRange.call = [...currentRange.call];
    
    setEditingRange(newEditingRange);
    setEditMode(true);
    
    // Note: User should navigate to /ranges to edit ranges
  }, [getCurrentRange]);

  const saveRange = useCallback(() => {
    if (currentRangeId && savedRanges?.categories?.[currentCategory]?.ranges?.[currentRangeId]) {
      const updatedRanges = { ...savedRanges };
      updatedRanges.categories[currentCategory].ranges[currentRangeId].range = { ...editingRange };
      saveRangesWithMeta(updatedRanges);
    }
    exitEditMode();
  }, [currentRangeId, savedRanges, currentCategory, editingRange, saveRangesWithMeta, exitEditMode]);

  // Range management functions
  const createNewRange = useCallback((name) => {
    if (!name) return false;
    
    const id = 'range_' + Date.now();
    const updatedRanges = { ...savedRanges };
    
    if (!updatedRanges.categories[currentCategory]) {
      updatedRanges.categories[currentCategory] = { 
        name: currentCategory, 
        ranges: {} 
      };
    }
    
    updatedRanges.categories[currentCategory].ranges[id] = {
      name: name,
      range: createEmptyRange()
    };
    
    saveRangesWithMeta(updatedRanges);
    setCurrentRangeId(id);
    startEditMode();
    return true;
  }, [savedRanges, currentCategory, saveRangesWithMeta, setCurrentRangeId, startEditMode]);

  const deleteCurrentRange = useCallback(() => {
    // Prevent deletion of default ranges
    if (currentRangeId === 'lj' && currentCategory === 'open_raises') {
      return false;
    }
    
    const updatedRanges = { ...savedRanges };
    delete updatedRanges.categories[currentCategory].ranges[currentRangeId];
    
    // Switch to first available range in category
    const remainingRanges = Object.keys(updatedRanges.categories[currentCategory].ranges);
    if (remainingRanges.length > 0) {
      setCurrentRangeId(remainingRanges[0]);
    } else {
      // Switch to default LJ range if no ranges left
      setCurrentCategory('open_raises');
      setCurrentRangeId('lj');
    }
    
    saveRangesWithMeta(updatedRanges);
    return true;
  }, [currentRangeId, currentCategory, savedRanges, saveRangesWithMeta, setCurrentRangeId, setCurrentCategory]);

  // Test mode functions
  const clearSelections = useCallback(() => {
    setUserSelections({});
  }, []);

  const checkResults = useCallback(() => {
    const currentRange = getCurrentRange();
    let correct = 0;
    let total = 0;
    const results = {};
    
    // Generate all possible hands for checking
    const allHands = []; // This should be populated with all 169 poker hands
    // For now, we'll check only the hands that were selected
    const handsToCheck = Object.keys(userSelections);
    
    handsToCheck.forEach(hand => {
      const correctAction = getHandAction(currentRange, hand);
      const userAction = userSelections[hand] || 'fold';
      
      total++;
      const isCorrect = userAction === correctAction;
      if (isCorrect) correct++;
      
      results[hand] = {
        correct: isCorrect,
        correctAction,
        userAction
      };
    });
    
    const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : 0;
    
    return {
      correct,
      incorrect: total - correct,
      total,
      accuracy: parseFloat(accuracy),
      results
    };
  }, [getCurrentRange, userSelections]);

  // Category testing functions
  const startCategoryTest = useCallback((categoryId) => {
    const category = savedRanges?.categories?.[categoryId];
    if (!category) return false;
    
    setCategoryTestMode(true);
    setCategoryTestData({
      category: categoryId,
      situations: Object.keys(category.ranges),
      currentIndex: 0,
      results: []
    });
    
    // Start with first situation in category
    const firstSituation = Object.keys(category.ranges)[0];
    setCurrentCategory(categoryId);
    setCurrentRangeId(firstSituation);
    clearSelections();
    
    return true;
  }, [savedRanges, setCurrentCategory, setCurrentRangeId, clearSelections]);

  // Hand practice functions
  const startMultiRangePractice = useCallback(() => {
    setMultiRangePracticeMode(true);
    setHandPracticeMode(false);
    setMultiRangeAnswers({});
    setMultiRangeResults({});
  }, []);

  const exitMultiRangePractice = useCallback(() => {
    setMultiRangePracticeMode(false);
    setMultiRangeAnswers({});
    setMultiRangeResults({});
    setCurrentPracticeHand(null);
  }, []);

  // Switch to situation/category
  const switchToSituation = useCallback((situationValue) => {
    if (situationValue.startsWith('category:')) {
      const categoryId = situationValue.substring(9);
      startCategoryTest(categoryId);
    } else {
      exitCategoryTest();
      const [categoryId, rangeId] = situationValue.split(':');
      setCurrentCategory(categoryId);
      setCurrentRangeId(rangeId);
    }
  }, [startCategoryTest, exitCategoryTest, setCurrentCategory, setCurrentRangeId]);

  return {
    // Mode state
    currentMode,
    
    // Range state
    savedRanges,
    currentCategory,
    setCurrentCategory,
    currentRangeId,
    setCurrentRangeId,
    getCurrentRange,
    switchToSituation,
    
    // View state
    currentView,
    setCurrentView,
    defaultView,
    setDefaultView,
    
    // Edit mode
    editMode,
    editingRange,
    setEditingRange,
    startEditMode,
    saveRange,
    exitEditMode,
    createNewRange,
    deleteCurrentRange,
    
    // Test mode
    selectedAction,
    setSelectedAction,
    userSelections,
    setUserSelections,
    clearSelections,
    checkResults,
    
    // Category testing
    categoryTestMode,
    categoryTestData,
    setCategoryTestData,
    startCategoryTest,
    exitCategoryTest,
    
    // Hand practice
    handPracticeMode,
    setHandPracticeMode,
    multiRangePracticeMode,
    currentPracticeCategory,
    setCurrentPracticeCategory,
    currentPracticeHand,
    setCurrentPracticeHand,
    multiRangeAnswers,
    setMultiRangeAnswers,
    multiRangeResults,
    setMultiRangeResults,
    startMultiRangePractice,
    exitMultiRangePractice,
    
    // Practice stats
    practiceStats,
    updateStats,
    resetStats,
    
    // Drag state
    isDragging,
    setIsDragging,
    
    // Utility functions
    getHandAction: (range, hand) => getHandAction(range, hand),
    setHandAction: (range, hand, action) => setHandAction(range, hand, action)
  };
}

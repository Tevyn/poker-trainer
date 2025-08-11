import { generateHandMatrix, generatePatternLayout } from '../../utils/rangeUtils';
import { useCallback, useRef } from 'react';

export default function RangeGrid({ appState }) {
  const { 
    currentView, 
    getCurrentRange, 
    getHandAction, 
    currentMode,
    editMode,
    editingRange,
    setEditingRange,
    selectedAction,
    userSelections,
    setUserSelections,
    isDragging,
    setIsDragging
  } = appState;
  
  const dragStarted = useRef(false);
  
  // Handle cell click for test mode
  const handleCellClick = useCallback((hand) => {
    const currentAction = userSelections[hand] || 'fold';
    
    // Toggle logic: if current action matches selected action, toggle to fold
    let newAction;
    if (currentAction === selectedAction) {
      newAction = 'fold';
      const newSelections = { ...userSelections };
      delete newSelections[hand];
      setUserSelections(newSelections);
    } else {
      newAction = selectedAction;
      setUserSelections(prev => ({ ...prev, [hand]: selectedAction }));
    }
  }, [userSelections, selectedAction, setUserSelections]);

  // Handle cell click for edit mode
  const handleEditClick = useCallback((hand) => {
    const currentAction = getHandAction(editingRange, hand);
    
    // Toggle logic: if current action matches selected action, toggle to fold
    let newAction;
    if (currentAction === selectedAction) {
      newAction = 'fold';
    } else {
      newAction = selectedAction;
    }
    
    // Update editing range
    const newEditingRange = { ...editingRange };
    
    // Remove hand from all action arrays first
    if (newEditingRange.raise) {
      newEditingRange.raise = newEditingRange.raise.filter(h => h !== hand);
      if (newEditingRange.raise.length === 0) delete newEditingRange.raise;
    }
    if (newEditingRange.call) {
      newEditingRange.call = newEditingRange.call.filter(h => h !== hand);
      if (newEditingRange.call.length === 0) delete newEditingRange.call;
    }
    
    // Add hand to appropriate action array (unless folding)
    if (newAction === 'raise') {
      if (!newEditingRange.raise) newEditingRange.raise = [];
      newEditingRange.raise.push(hand);
    } else if (newAction === 'call') {
      if (!newEditingRange.call) newEditingRange.call = [];
      newEditingRange.call.push(hand);
    }
    
    setEditingRange(newEditingRange);
  }, [editingRange, selectedAction, getHandAction, setEditingRange]);

  // Get cell display classes
  const getCellClasses = useCallback((hand) => {
    let classes = 'hand-cell';
    
    if ((currentMode === 'study' || currentMode === 'ranges') && !editMode) {
      const action = getHandAction(getCurrentRange(), hand);
      classes += ` ${action}`;
    } else if ((currentMode === 'study' || currentMode === 'ranges') && editMode) {
      const action = getHandAction(editingRange, hand);
      classes += ` ${action}`;
    } else if (currentMode === 'test') {
      const userAction = userSelections[hand] || 'fold';
      if (userSelections[hand]) {
        classes += ` user-${userAction}`;
      } else {
        classes += ' fold';
      }
    }
    
    if (isDragging) {
      classes += ' dragging';
    }
    
    return classes;
  }, [currentMode, editMode, getCurrentRange, editingRange, userSelections, getHandAction, isDragging]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e, hand) => {
    e.preventDefault();
    if (currentMode === 'test') {
      handleCellClick(hand);
      setIsDragging(true);
      dragStarted.current = true;
    } else if (editMode) {
      handleEditClick(hand);
      setIsDragging(true);
      dragStarted.current = true;
    }
  }, [currentMode, editMode, handleCellClick, handleEditClick, setIsDragging]);

  const handleMouseEnter = useCallback((hand) => {
    if (isDragging) {
      if (currentMode === 'test') {
        handleCellClick(hand);
      } else if (editMode) {
        handleEditClick(hand);
      }
    }
  }, [isDragging, currentMode, editMode, handleCellClick, handleEditClick]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      dragStarted.current = false;
    }
  }, [isDragging, setIsDragging]);

  const renderGridView = () => {
    const hands = generateHandMatrix();
    
    return (
      <div className="range-grid">
        {hands.map(hand => (
          <div
            key={hand}
            className={getCellClasses(hand)}
            data-hand={hand}
            onMouseDown={(e) => handleMouseDown(e, hand)}
            onMouseEnter={() => handleMouseEnter(hand)}
            onMouseUp={handleMouseUp}
            onSelectStart={(e) => e.preventDefault()} // Prevent text selection during drag
          >
            {hand}
          </div>
        ))}
      </div>
    );
  };
  
  const renderPatternView = () => {
    const pattern = generatePatternLayout();
    
    return (
      <div className="range-grid pattern-view">
        {pattern.map((row, rowIndex) => (
          <div key={rowIndex} className="pattern-row">
            {row.map((hand, cellIndex) => {
              if (hand === '') {
                return (
                  <div
                    key={cellIndex}
                    className="hand-cell empty-cell"
                    style={{ visibility: 'hidden' }}
                  />
                );
              }
              
              return (
                <div
                  key={cellIndex}
                  className={getCellClasses(hand)}
                  data-hand={hand}
                  onMouseDown={(e) => handleMouseDown(e, hand)}
                  onMouseEnter={() => handleMouseEnter(hand)}
                  onMouseUp={handleMouseUp}
                  onSelectStart={(e) => e.preventDefault()} // Prevent text selection during drag
                >
                  {hand}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };
  
  return currentView === 'grid' ? renderGridView() : renderPatternView();
}

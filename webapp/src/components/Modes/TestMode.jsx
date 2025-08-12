import { useState, useEffect } from 'react';
import { generateHandMatrix } from '../../utils/rangeUtils';

 // Test Mode component
export default function TestMode({ appState }) {
  const [testResults, setTestResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  const { 
    selectedAction, 
    setSelectedAction, 
    clearSelections, 
    getCurrentRange, 
    getHandAction, 
    userSelections,
    categoryTestMode,
    categoryTestData,
    setCategoryTestData,
    savedRanges,
    currentCategory,
    currentRangeId,
    setCurrentRangeId
  } = appState;

  const handleCheck = () => {
    const currentRange = getCurrentRange();
    const allHands = generateHandMatrix();
    let correct = 0;
    let incorrect = 0;
    let total = allHands.length;
    const results = {};
    
    allHands.forEach(hand => {
      const correctAction = getHandAction(currentRange, hand);
      const userAction = userSelections[hand] || 'fold';
      
      const isCorrect = userAction === correctAction;
      if (isCorrect) {
        correct++;
      } else {
        incorrect++;
      }
      
      results[hand] = {
        correct: isCorrect,
        correctAction,
        userAction
      };
    });
    
    const accuracy = ((correct / total) * 100).toFixed(1);
    
    const testResult = {
      correct,
      incorrect,
      total,
      accuracy: parseFloat(accuracy),
      results
    };
    
    // Handle category testing
    if (categoryTestMode) {
      handleCategoryTestResults(testResult);
    } else {
      setTestResults(testResult);
      setShowResults(true);
    }
    
    // Add visual indicators to cells
    addResultIndicators(results);
  };

  const addResultIndicators = (results) => {
    // Add correct/incorrect classes to cells
    Object.entries(results).forEach(([hand, result]) => {
      const cell = document.querySelector(`[data-hand="${hand}"]`);
      if (cell) {
        cell.classList.remove('correct', 'incorrect');
        cell.classList.add(result.correct ? 'correct' : 'incorrect');
      }
    });
  };

  const handleCategoryTestResults = (testResult) => {
    const situationName = savedRanges.categories?.[currentCategory]?.ranges?.[currentRangeId]?.name || 'Unknown';
    
    // Store results for this situation
    const newResults = [...categoryTestData.results, {
      situationId: currentRangeId,
      situationName,
      correct: testResult.correct,
      incorrect: testResult.incorrect,
      total: testResult.total,
      accuracy: testResult.accuracy
    }];
    
    const updatedTestData = {
      ...categoryTestData,
      results: newResults
    };
    
    setCategoryTestData(updatedTestData);
    
    const isLastSituation = categoryTestData.currentIndex >= categoryTestData.situations.length - 1;
    
    if (isLastSituation) {
      setTestResults(createFinalCategoryResults(updatedTestData));
    } else {
      setTestResults({
        ...testResult,
        isCategory: true,
        currentIndex: categoryTestData.currentIndex,
        totalSituations: categoryTestData.situations.length
      });
    }
    
    setShowResults(true);
  };

  const createFinalCategoryResults = (testData) => {
    const totalCorrect = testData.results.reduce((sum, result) => sum + result.correct, 0);
    const totalQuestions = testData.results.reduce((sum, result) => sum + result.total, 0);
    const overallAccuracy = ((totalCorrect / totalQuestions) * 100).toFixed(1);
    
    return {
      correct: totalCorrect,
      incorrect: totalQuestions - totalCorrect,
      total: totalQuestions,
      accuracy: parseFloat(overallAccuracy),
      isFinalCategory: true,
      categoryName: savedRanges.categories?.[testData.category]?.name || 'Unknown Category',
      breakdown: testData.results
    };
  };

  const advanceToNextSituation = () => {
    const nextIndex = categoryTestData.currentIndex + 1;
    const nextSituationId = categoryTestData.situations[nextIndex];
    
    setCategoryTestData(prev => ({
      ...prev,
      currentIndex: nextIndex
    }));
    
    setCurrentRangeId(nextSituationId);
    clearSelections();
    setShowResults(false);
    setTestResults(null);
    
    // Clear result indicators
    document.querySelectorAll('.hand-cell').forEach(cell => {
      cell.classList.remove('correct', 'incorrect');
    });
  };

  const restartCategoryTest = () => {
    appState.startCategoryTest(categoryTestData.category);
    setShowResults(false);
    setTestResults(null);
  };

  // Clear results when selections are cleared
  useEffect(() => {
    if (Object.keys(userSelections).length === 0) {
      setShowResults(false);
      setTestResults(null);
      // Clear result indicators
      document.querySelectorAll('.hand-cell').forEach(cell => {
        cell.classList.remove('correct', 'incorrect');
      });
    }
  }, [userSelections]);

  return (
    <div className="control-panel active">
      <div className="action-selector">
        <label>Select Action:</label>
        <button 
          className={`action-option raise-action ${selectedAction === 'raise' ? 'active' : ''}`}
          onClick={() => setSelectedAction('raise')}
        >
          Raise
        </button>
        <button 
          className={`action-option call-action ${selectedAction === 'call' ? 'active' : ''}`}
          onClick={() => setSelectedAction('call')}
        >
          Call
        </button>
        <span className="fold-note">(Click hands to set fold)</span>
      </div>
      
      <div className="test-actions">
        <button className="action-btn secondary" onClick={() => {
          clearSelections();
          setShowResults(false);
          setTestResults(null);
        }}>
          Clear All
        </button>
        <button className="action-btn primary" onClick={handleCheck}>
          Check Result
        </button>
      </div>
      
      {showResults && testResults && (
        <div className="test-results">
          <div className="accuracy-display">
            {testResults.isFinalCategory ? (
              <div className="final-category-results">
                <div className="category-complete-title">
                  {testResults.categoryName} Complete!
                </div>
                <div className="overall-accuracy">
                  {testResults.accuracy}% Overall
                </div>
                <div className="result-details">
                  {testResults.correct} correct • {testResults.incorrect} incorrect • {testResults.total} total
                </div>
                <div className="breakdown-section">
                  <div className="breakdown-title">Breakdown:</div>
                  {testResults.breakdown.map((result, index) => (
                    <div key={index} className="breakdown-item">
                      {result.situationName}: {result.accuracy.toFixed(1)}% ({result.correct}/{result.total})
                    </div>
                  ))}
                </div>
                <button 
                  className="action-btn secondary restart-btn" 
                  onClick={restartCategoryTest}
                >
                  Test {testResults.categoryName} Again
                </button>
              </div>
            ) : testResults.isCategory ? (
              <div className="category-results">
                <div className="category-accuracy">
                  {testResults.accuracy}% Correct
                </div>
                <div className="result-details">
                  {testResults.correct} correct • {testResults.incorrect} incorrect • {testResults.total} total
                </div>
                <button 
                  className="action-btn primary next-situation-btn" 
                  onClick={advanceToNextSituation}
                >
                  Next Situation ({testResults.currentIndex + 2}/{testResults.totalSituations})
                </button>
              </div>
            ) : (
              <div className="single-range-results">
                <div className="single-accuracy">
                  {testResults.accuracy}% Correct
                </div>
                <div className="result-details">
                  {testResults.correct} correct • {testResults.incorrect} incorrect • {testResults.total} total
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

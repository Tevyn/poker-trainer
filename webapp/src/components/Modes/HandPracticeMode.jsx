import { useState, useEffect } from 'react';
import { generateRandomHand, formatCard } from '../../utils/handUtils';

// Hand Practice Mode component
export default function HandPracticeMode({ appState }) {
  const [showResults, setShowResults] = useState(false);
  const [practiceResults, setPracticeResults] = useState({});
  
  const {
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
    practiceStats,
    updateStats,
    savedRanges,
    getHandAction
  } = appState;

  const startPractice = () => {
    startMultiRangePractice();
    generateNewHand();
  };

  const generateNewHand = () => {
    const newHand = generateRandomHand();
    setCurrentPracticeHand(newHand);
    setMultiRangeAnswers({});
    setMultiRangeResults({});
    setShowResults(false);
    setPracticeResults({});
  };

  const selectMultiRangeAction = (rangeId, action) => {
    setMultiRangeAnswers(prev => ({
      ...prev,
      [rangeId]: action
    }));
  };

  const selectAllRangesAction = (action) => {
    const categoryData = savedRanges?.categories?.[currentPracticeCategory];
    if (!categoryData) return;

    const rangeIds = Object.keys(categoryData.ranges);
    const allAnswers = {};
    rangeIds.forEach(rangeId => {
      allAnswers[rangeId] = action;
    });
    setMultiRangeAnswers(allAnswers);
  };

  const checkAnswers = () => {
    const categoryData = savedRanges?.categories?.[currentPracticeCategory];
    if (!categoryData || !currentPracticeHand) return;

    const rangeIds = Object.keys(categoryData.ranges);
    const unansweredRanges = rangeIds.filter(rangeId => !multiRangeAnswers[rangeId]);
    
    if (unansweredRanges.length > 0) {
      // Show error for unanswered ranges
      alert('Please answer all ranges before checking results.');
      return;
    }

    let totalQuestions = 0;
    let correctAnswers = 0;
    const results = {};

    // Check each range
    Object.entries(categoryData.ranges).forEach(([rangeId, rangeData]) => {
      totalQuestions++;
      const userAction = multiRangeAnswers[rangeId];
      const correctAction = getHandAction(rangeData.range, currentPracticeHand.handNotation);
      
      const isCorrect = userAction === correctAction;
      if (isCorrect) correctAnswers++;
      
      results[rangeId] = {
        correct: isCorrect,
        correctAction,
        userAction
      };
    });

    // Update practice stats
    updateStats(correctAnswers, totalQuestions);
    
    setMultiRangeResults(results);
    setPracticeResults({
      totalQuestions,
      correctAnswers,
      accuracy: ((correctAnswers / totalQuestions) * 100).toFixed(1)
    });
    setShowResults(true);
  };

  const nextHand = () => {
    generateNewHand();
  };

  // Create card element
  const createCardElement = (cardString, className = '') => {
    const cardData = formatCard(cardString);
    
    return (
      <div className={`poker-card ${cardData.color} ${className}`}>
        <div className="card-rank">{cardData.rank}</div>
        <div className="card-suit">{cardData.suit}</div>
      </div>
    );
  };

  return (
    <div className="control-panel active">
      <div className="hand-practice-content">
        {!multiRangePracticeMode ? (
          <div className="practice-start">
            <p>Select a practice category in the header and click "Start Practice" to begin multi-range practice.</p>
            <button className="action-btn primary" onClick={startPractice}>
              Start Practice
            </button>
          </div>
        ) : (
          <div className="multi-range-practice">
            <div className="current-hand-display">
              {currentPracticeHand && (
                <>
                  {createCardElement(currentPracticeHand.card1, 'card-1')}
                  {createCardElement(currentPracticeHand.card2, 'card-2')}
                </>
              )}
            </div>
            
            <div className="ranges-list">
              {savedRanges?.categories?.[currentPracticeCategory]?.ranges && 
                Object.entries(savedRanges.categories[currentPracticeCategory].ranges).map(([rangeId, rangeData]) => (
                  <div key={rangeId} className="range-row" data-range-id={rangeId}>
                    <div className="range-name">{rangeData.name}</div>
                    <div className="action-buttons">
                      <button 
                        className={`multi-action-btn ${multiRangeAnswers[rangeId] === 'raise' ? 'selected' : ''}`}
                        data-action="raise"
                        onClick={() => selectMultiRangeAction(rangeId, 'raise')}
                      >
                        Raise
                      </button>
                      <button 
                        className={`multi-action-btn ${multiRangeAnswers[rangeId] === 'call' ? 'selected' : ''}`}
                        data-action="call"
                        onClick={() => selectMultiRangeAction(rangeId, 'call')}
                      >
                        Call
                      </button>
                      <button 
                        className={`multi-action-btn ${multiRangeAnswers[rangeId] === 'fold' ? 'selected' : ''}`}
                        data-action="fold"
                        onClick={() => selectMultiRangeAction(rangeId, 'fold')}
                      >
                        Fold
                      </button>
                    </div>
                    {showResults && multiRangeResults[rangeId] && (
                      <div className="range-result">
                        <span className={multiRangeResults[rangeId].correct ? 'correct' : 'incorrect'}>
                          {multiRangeResults[rangeId].correct 
                            ? '✓ Correct' 
                            : `✗ Should be ${multiRangeResults[rangeId].correctAction}`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                ))
              }
            </div>
            
            {!showResults && (
              <div className="bulk-action-buttons">
                <button 
                  className="bulk-action-btn raise-all"
                  onClick={() => selectAllRangesAction('raise')}
                >
                  Raise All
                </button>
                <button 
                  className="bulk-action-btn fold-all"
                  onClick={() => selectAllRangesAction('fold')}
                >
                  Fold All
                </button>
              </div>
            )}
            
            <div className="practice-actions">
              {!showResults ? (
                <button className="action-btn primary" onClick={checkAnswers}>
                  Check Answers
                </button>
              ) : (
                <button className="action-btn secondary" onClick={nextHand}>
                  Next Hand
                </button>
              )}
            </div>
            
            <div className="multi-range-stats">
              Accuracy: {practiceStats.total > 0 ? ((practiceStats.correct / practiceStats.total) * 100).toFixed(1) : 0}% | 
              Streak: {practiceStats.streak} | 
              Total: {practiceStats.total}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

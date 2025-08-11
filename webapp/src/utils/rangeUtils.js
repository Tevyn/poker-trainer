// Range utility functions for poker hand calculations

/**
 * Helper function to create empty range (all hands fold)
 */
export function createEmptyRange() {
  return {};
}

/**
 * Get action for a hand from array-based range format
 * @param {Object} range - Range object with raise/call arrays
 * @param {string} hand - Hand notation (e.g., "AKs", "QQ")
 * @returns {string} Action: 'raise', 'call', or 'fold'
 */
export function getHandAction(range, hand) {
  if (range.raise && range.raise.includes(hand)) return 'raise';
  if (range.call && range.call.includes(hand)) return 'call';
  return 'fold';
}

/**
 * Set action for a hand in array-based range format
 * @param {Object} range - Range object to modify
 * @param {string} hand - Hand notation
 * @param {string} action - Action: 'raise', 'call', or 'fold'
 */
export function setHandAction(range, hand, action) {
  // Remove hand from all action arrays first
  if (range.raise) {
    range.raise = range.raise.filter(h => h !== hand);
    if (range.raise.length === 0) delete range.raise;
  }
  if (range.call) {
    range.call = range.call.filter(h => h !== hand);
    if (range.call.length === 0) delete range.call;
  }
  
  // Add hand to appropriate action array (unless folding)
  if (action === 'raise') {
    if (!range.raise) range.raise = [];
    range.raise.push(hand);
  } else if (action === 'call') {
    if (!range.call) range.call = [];
    range.call.push(hand);
  }
  // fold is implicit - don't store anything
}

/**
 * Generate the hand matrix for grid view (13x13 layout)
 * @returns {Array} Array of hand notations
 */
export function generateHandMatrix() {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const hands = [];
  
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      let hand;
      if (i === j) {
        // Pocket pairs (diagonal)
        hand = ranks[i] + ranks[j];
      } else if (i < j) {
        // Suited hands (above diagonal)
        hand = ranks[i] + ranks[j] + 's';
      } else {
        // Offsuit hands (below diagonal)
        hand = ranks[j] + ranks[i] + 'o';
      }
      hands.push(hand);
    }
  }
  
  return hands;
}

/**
 * Generate pattern view layout (triangular pattern)
 * @returns {Array} 2D array representing the pattern layout
 */
export function generatePatternLayout() {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const pattern = [];
  
  // Generate each row based on highest rank
  for (let i = 0; i < 13; i++) {
    const row = [];
    const highRank = ranks[i];
    const lowerRanks = ranks.slice(i + 1); // Only ranks lower than current
    
    // Add offsuit hands (high rank first, in ascending order of low rank)
    for (let j = lowerRanks.length - 1; j >= 0; j--) {
      row.push(highRank + lowerRanks[j] + 'o');
    }
    
    // Add pocket pair (center)
    row.push(highRank + highRank);
    
    // Add suited hands (high rank first, in descending order of low rank)
    for (let j = 0; j < lowerRanks.length; j++) {
      row.push(highRank + lowerRanks[j] + 's');
    }
    
    // Calculate padding to center the row
    const totalHands = row.length;
    const maxWidth = 25; // Width of top row (Aces)
    const totalPadding = maxWidth - totalHands;
    const leftPadding = Math.floor(totalPadding / 2);
    const rightPadding = totalPadding - leftPadding;
    
    // Add left padding (empty cells)
    for (let p = 0; p < leftPadding; p++) {
      row.unshift('');
    }
    
    // Add right padding (empty cells)
    for (let p = 0; p < rightPadding; p++) {
      row.push('');
    }
    
    pattern.push(row);
  }
  
  return pattern;
}

/**
 * Normalize range for comparison (used for deduplication)
 * @param {Object} rangeObj - Range object
 * @returns {string} Normalized string representation
 */
export function normalizeRangeForComparison(rangeObj) {
  const normalized = {};
  for (const [action, hands] of Object.entries(rangeObj)) {
    if (Array.isArray(hands)) {
      normalized[action] = [...hands].sort();
    }
  }
  return JSON.stringify(normalized);
}

/**
 * Find duplicate ranges in a category
 * @param {Object} category - Category object with ranges
 * @returns {Array} Array of duplicate groups
 */
export function findDuplicateRangesInCategory(category) {
  if (!category || !category.ranges) {
    return [];
  }
  
  const rangeGroups = {};
  
  // Group ranges by their normalized representation
  Object.entries(category.ranges).forEach(([rangeId, rangeData]) => {
    const normalizedRange = normalizeRangeForComparison(rangeData.range);
    
    if (!rangeGroups[normalizedRange]) {
      rangeGroups[normalizedRange] = [];
    }
    
    const rangeInfo = {
      rangeId,
      name: rangeData.name,
      range: rangeData.range,
      normalizedRange
    };
    
    rangeGroups[normalizedRange].push(rangeInfo);
  });
  
  // Return only groups with more than one range (duplicates)
  return Object.values(rangeGroups).filter(group => group.length > 1);
}

// Hand utility functions for poker hand notation and card generation

/**
 * Generate a random poker hand
 * @returns {Object} Object with card1, card2, and handNotation
 */
export function generateRandomHand() {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  // Generate two random cards
  const suits = ['s', 'h', 'd', 'c'];
  const card1Rank = ranks[Math.floor(Math.random() * ranks.length)];
  const card1Suit = suits[Math.floor(Math.random() * suits.length)];
  
  let card2Rank, card2Suit;
  do {
    card2Rank = ranks[Math.floor(Math.random() * ranks.length)];
    card2Suit = suits[Math.floor(Math.random() * suits.length)];
  } while (card1Rank === card2Rank && card1Suit === card2Suit); // Ensure no duplicate cards
  
  // Convert to poker hand notation
  const isSuited = card1Suit === card2Suit;
  const rankIndex1 = ranks.indexOf(card1Rank);
  const rankIndex2 = ranks.indexOf(card2Rank);
  
  let handNotation;
  if (card1Rank === card2Rank) {
    // Pocket pair
    handNotation = card1Rank + card2Rank;
  } else if (rankIndex1 < rankIndex2) {
    // First card is higher rank
    handNotation = card1Rank + card2Rank + (isSuited ? 's' : 'o');
  } else {
    // Second card is higher rank
    handNotation = card2Rank + card1Rank + (isSuited ? 's' : 'o');
  }
  
  return {
    card1: card1Rank + card1Suit,
    card2: card2Rank + card2Suit,
    handNotation: handNotation
  };
}

/**
 * Format a card string with proper suit symbols and colors
 * @param {string} cardString - Card string (e.g., "As", "Kh")
 * @returns {Object} Object with rank, suit symbol, and color
 */
export function formatCard(cardString) {
  if (!cardString || cardString.length < 2) {
    return { rank: '?', suit: '?', color: 'black' };
  }
  
  const rank = cardString[0];
  const suitLetter = cardString[1];
  
  const suitMap = {
    's': { symbol: '♠', color: 'black' },   // spades
    'h': { symbol: '♥', color: 'red' },     // hearts  
    'd': { symbol: '♦', color: 'red' },     // diamonds
    'c': { symbol: '♣', color: 'black' }    // clubs
  };
  
  const suit = suitMap[suitLetter] || { symbol: '?', color: 'black' };
  
  return {
    rank: rank,
    suit: suit.symbol,
    color: suit.color
  };
}

/**
 * Get the correct action for a hand in a given range
 * @param {Object} rangeData - Range data object
 * @param {string} hand - Hand notation
 * @returns {string} Action: 'raise', 'call', or 'fold'
 */
export function getCorrectActionForHand(rangeData, hand) {
  if (rangeData.raise && rangeData.raise.includes(hand)) {
    return 'raise';
  }
  if (rangeData.call && rangeData.call.includes(hand)) {
    return 'call';
  }
  return 'fold';
}

/**
 * Convert hand notation to display format
 * @param {string} hand - Hand notation (e.g., "AKs", "QQ")
 * @returns {string} Display format
 */
export function formatHandNotation(hand) {
  if (!hand) return '';
  
  // Handle pocket pairs
  if (hand.length === 2 && hand[0] === hand[1]) {
    return hand;
  }
  
  // Handle suited/offsuit hands
  if (hand.length === 3) {
    const rank1 = hand[0];
    const rank2 = hand[1];
    const suitedness = hand[2];
    return `${rank1}${rank2}${suitedness}`;
  }
  
  return hand;
}

/**
 * Check if a hand notation is valid
 * @param {string} hand - Hand notation
 * @returns {boolean} Whether the hand notation is valid
 */
export function isValidHandNotation(hand) {
  if (!hand || typeof hand !== 'string') return false;
  
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  // Pocket pairs
  if (hand.length === 2) {
    return hand[0] === hand[1] && ranks.includes(hand[0]);
  }
  
  // Suited/offsuit hands
  if (hand.length === 3) {
    const rank1 = hand[0];
    const rank2 = hand[1];
    const suitedness = hand[2];
    
    return ranks.includes(rank1) && 
           ranks.includes(rank2) && 
           (suitedness === 's' || suitedness === 'o') &&
           rank1 !== rank2;
  }
  
  return false;
}

/**
 * Sort hands by strength (for display purposes)
 * @param {Array} hands - Array of hand notations
 * @returns {Array} Sorted array of hands
 */
export function sortHandsByStrength(hands) {
  const rankOrder = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  return hands.sort((a, b) => {
    // Get primary rank for each hand
    const aRank = rankOrder.indexOf(a[0]);
    const bRank = rankOrder.indexOf(b[0]);
    
    if (aRank !== bRank) {
      return aRank - bRank; // Higher rank first
    }
    
    // If same primary rank, compare secondary rank
    const aSecondRank = rankOrder.indexOf(a[1]);
    const bSecondRank = rankOrder.indexOf(b[1]);
    
    if (aSecondRank !== bSecondRank) {
      return aSecondRank - bSecondRank;
    }
    
    // If same ranks, suited comes before offsuit
    if (a.length === 3 && b.length === 3) {
      if (a[2] === 's' && b[2] === 'o') return -1;
      if (a[2] === 'o' && b[2] === 's') return 1;
    }
    
    return 0;
  });
}

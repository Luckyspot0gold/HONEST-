// Single-switch scanning system
const switchAccessConfig = {
  scanning: {
    mode: 'auto',           // auto, step, or group
    speed: 1200,            // ms between items (adjustable)
    groups: ['assets', 'timeframes', 'indicators', 'actions'],
    audioCue: true,         // Speak each item as highlighted
    visualHighlight: 'high-contrast-border',
    hapticPulse: true       // Pulse when item highlighted
  },
  
  selectionMethods: {
    // Method 1: Standard dwell
    'press-on-target': 'SELECT',
    
    // Method 2: Morse code for faster access
    'morse': {
      shortPress: 'dot',
      longPress: 'dash',
      dictionary: {
        '.-': 'BTC',        // Bitcoin
        '-...': 'ETH',      // Ethereum
        '..': 'UP',         // Trend up
        '.-.': 'VOL'        // Volatility view
      }
    },
    
    // Method 3: Binary search (faster for large datasets)
    'binary': {
      press: 'YES/RIGHT',
      hold: 'NO/LEFT',
      divisions: 2          // Split screen in half recursively
    }
  },
  
  // H.O.N.E.S.T. data navigation
  financialScanning: {
    hierarchical: true,
    level1: ['Asset Class', 'Time Period', 'Indicator', 'Action'],
    level2: {               // Dynamic based on level 1
      'Asset Class': ['Crypto', 'Stocks', 'Commodities'],
      'Time Period': ['1H', '1D', '1W', '1M', '1Y'],
      'Indicator': ['Price', 'Volatility', 'Momentum', 'Volume'],
      'Action': ['Buy Signal', 'Sell Signal', 'Hold', 'Details']
    }
  }
};

// HONEST 8-System: Color, Sound, Shape, Light, Haptics
export const HONEST8Map = {
  // Color → Note / Hertz / Shape
  red: {
    color: '#FF0000',
    note: 'C',
    octave: 4,
    hertz: 261.63,
    shape: 'circle',
    frequency: '400-480 THz',
    emotion: 'foundation',
    haptic: () => [0.5, 0.5] // low, steady pulse
  },
  orange: {
    color: '#FF7F00',
    note: 'D',
    octave: 4,
    hertz: 293.66,
    shape: 'line',
    frequency: '480-510 THz',
    emotion: 'energy',
    haptic: () => [0.3, 0.1, 0.3, 0.1] // pulsing
  },
  yellow: {
    color: '#FFFF00',
    note: 'E',
    octave: 4,
    hertz: 329.63,
    shape: 'triangle',
    frequency: '510-550 THz',
    emotion: 'sharpness',
    haptic: () => [0.1, 0.1, 0.2, 0.1, 0.1] // sharp attack
  },
  green: {
    color: '#00FF00',
    note: 'F',
    octave: 4,
    hertz: 349.23,
    shape: 'square',
    frequency: '550-590 THz',
    emotion: 'balance',
    haptic: () => [0.2, 0.2, 0.2, 0.2] // steady
  },
  blue: {
    color: '#0000FF',
    note: 'G',
    octave: 4,
    hertz: 392.00,
    shape: 'pentagon',
    frequency: '590-630 THz',
    emotion: 'depth',
    haptic: () => [0.5, 0.1, 0.5, 0.1] // deep pulse
  },
  indigo: {
    color: '#4B0082',
    note: 'A',
    octave: 4,
    hertz: 440.00,
    shape: 'hexagon',
    frequency: '630-680 THz',
    emotion: 'mystery',
    haptic: () => [0.4, 0.2, 0.1, 0.2] // subtle rhythm
  },
  violet: {
    color: '#A020F0',
    note: 'B',
    octave: 4,
    hertz: 493.88,
    shape: 'heptagon',
    frequency: '680-750 THz',
    emotion: 'spirit',
    haptic: () => [0.3, 0.1, 0.3, 0.1, 0.4] // rising
  },
  cyrene: {
    color: '#00FFFF',
    note: 'C',
    octave: 5,
    hertz: 523.25,
    shape: 'octagon',
    frequency: '550-590 THz',
    emotion: 'transition',
    haptic: () => [0.2, 0.2, 0.2, 0.2, 0.4] // build-up
  }
};

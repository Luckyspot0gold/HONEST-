// src/perception/PerceptionLanguage.ts
export class PerceptionLanguage {
  private alphabet: Map<string, SensoryLetter>;
  private grammar: ToroidalGrammar;
  private vocabulary: PerceptionVocabulary;
  
  constructor() {
    this.alphabet = this.createSensoryAlphabet();
    this.grammar = this.createToroidalGrammar();
    this.vocabulary = this.createPerceptionVocabulary();
    
    console.log('🔤 Perception Language Initialized:');
    console.log(`   Alphabet: ${this.alphabet.size} sensory letters`);
    console.log(`   Grammar: ${Object.keys(this.grammar).length} rules`);
    console.log(`   Vocabulary: ${this.vocabulary.size} perception words`);
  }
  
  private createSensoryAlphabet(): Map<string, SensoryLetter> {
    const alphabet = new Map<string, SensoryLetter>();
    
    // Create 26 sensory letters (A-Z)
    const baseFrequencies = [432, 444, 528, 639, 741, 852, 963];
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#7209B7', '#EF476F'];
    const shapes = ['circle', 'triangle', 'square', 'pentagon', 'hexagon', 'heptagon', 'octagon'];
    const vibrations = ['pulse', 'wave', 'spiral', 'oscillation', 'resonance', 'harmony', 'chaos'];
    
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i); // A-Z
      const index = i % 7;
      
      alphabet.set(letter, {
        sound: baseFrequencies[index] * (1 + i/26),
        color: colors[index],
        shape: shapes[index],
        vibration: vibrations[index],
        meaning: this.generateLetterMeaning(letter),
        toroidalPosition: this.calculateLetterPosition(i)
      });
    }
    
    return alphabet;
  }
  
  generatePerceptionSentence(m3: M3Metrics): PerceptionSentence {
    const words: PerceptionWord[] = [];
    
    // Map each M3 metric to a perception word
    words.push(this.createWord('HRI', m3.HRI, 'resonance'));
    words.push(this.createWord('HSI', m3.HSI, 'expression'));
    words.push(this.createWord('HIV', m3.HIV, 'detention'));
    words.push(this.createWord('ISS', m3.ISS, 'relationship'));
    words.push(this.createWord('SOS', m3.SOS, 'communication'));
    words.push(this.createWord('IV3D', m3.IV3D, 'inteliterate'));
    words.push(this.createWord('ROC', m3.ROC, 'invoking'));
    
    // Construct sentence using toroidal grammar
    const sentence = this.constructSentence(words);
    
    return {
      words,
      sentence,
      meaning: this.interpretMeaning(sentence),
      resonance: this.calculateSentenceResonance(words),
      toroidalPath: this.calculateSentencePath(words)
    };
  }
  
  private createWord(metric: string, value: number, linguistic: string): PerceptionWord {
    const normalizedValue = value / 100;
    const letter = metric.charAt(0); // First letter of metric
    
    return {
      word: linguistic,
      sound: this.alphabet.get(letter)?.sound || 432,
      color: this.alphabet.get(letter)?.color || '#000000',
      shape: this.alphabet.get(letter)?.shape || 'circle',
      vibration: this.alphabet.get(letter)?.vibration || 'pulse',
      meaning: this.alphabet.get(letter)?.meaning || 'existence',
      intensity: normalizedValue,
      toroidalPosition: this.alphabet.get(letter)?.toroidalPosition || {x:0,y:0,z:0}
    };
  }
}

```python
# honest_oracle/archimedes_analyzer.py
"""
Archimedes Method for Exhaustion Analysis
Applied to MACD Histogram for Momentum Exhaustion Detection
"""

import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass

@dataclass
class SliceResult:
    """Result of Archimedes slicing analysis"""
    total_area: float
    net_force: float
    exhaustion: float
    slices: List[float]
    positive_area: float
    negative_area: float

class ArchimedesAnalyzer:
    """
    Implements Archimedes' Method of Exhaustion for MACD analysis
    Calculates momentum exhaustion through area integration
    """
    
    def __init__(self, base_frequency: float = 432.0):
        self.base_frequency = base_frequency  # Hz, from your memories
    
    def slice_histogram(self, histogram: np.ndarray, n_slices: int = 50) -> SliceResult:
        """
        Apply Archimedes' Method to MACD histogram
        
        Args:
            histogram: MACD histogram values
            n_slices: Number of slices for exhaustion analysis
            
        Returns:
            SliceResult with area calculations and exhaustion metrics
        """
        if len(histogram) < n_slices:
            n_slices = len(histogram)
            
        slice_width = len(histogram) / n_slices
        areas = []
        
        for i in range(n_slices):
            start_idx = int(i * slice_width)
            end_idx = int((i + 1) * slice_width)
            
            # Calculate area of this slice (height * width)
            slice_sum = np.sum(histogram[start_idx:end_idx])
            area = slice_sum * slice_width
            areas.append(area)
        
        total_area = sum(areas)
        positive_area = sum(a for a in areas if a > 0)
        negative_area = sum(a for a in areas if a < 0)
        net_force = total_area
        
        # Calculate exhaustion (0-1 scale)
        max_area = max(abs(positive_area), abs(negative_area), 1e-5)
        exhaustion = 1 - abs(net_force) / max_area
        
        return SliceResult(
            total_area=total_area,
            net_force=net_force,
            exhaustion=exhaustion,
            slices=areas,
            positive_area=positive_area,
            negative_area=negative_area
        )
    
    def calculate_sensory_mapping(self, result: SliceResult) -> Dict:
        """
        Map Archimedes results to sensory outputs per UEAS standards
        
        Returns:
            Dictionary with sensory mappings
        """
        # Audio mapping (432Hz base frequency)
        audio_freq = self.base_frequency * (1 + 0.5 * np.tanh(result.net_force / 10))
        audio_amplitude = min(1.0, abs(result.net_force) / 20)
        
        # Haptic mapping
        haptic_intensity = min(1.0, abs(result.net_force) / 15)
        haptic_frequency = 50 + result.exhaustion * 200  # 50-250 Hz
        
        # Visual mapping
        visual_brightness = min(1.0, abs(result.net_force) / 25)
        visual_color = (0.2, 0.8, 0.4) if result.net_force > 0 else (0.8, 0.2, 0.4)
        
        return {
            "audio": {
                "frequency": audio_freq,
                "amplitude": audio_amplitude,
                "exhaustion_tone": self.base_frequency * (1 - result.exhaustion * 0.5)
            },
            "haptic": {
                "intensity": haptic_intensity,
                "frequency": haptic_frequency,
                "exhaustion_vibration": result.exhaustion
            },
            "visual": {
                "brightness": visual_brightness,
                "color": visual_color,
                "exhaustion_dimming": 1 - result.exhaustion
            }
        }
```


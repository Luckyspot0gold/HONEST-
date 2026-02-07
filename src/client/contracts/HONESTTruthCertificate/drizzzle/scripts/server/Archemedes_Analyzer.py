"""
Archimedes MACD Exhaustion Analyzer
Uses ancient geometric principles (method of exhaustion) to analyze MACD histogram
and calculate market exhaustion metrics for sensory translation.

Based on Archimedes' method: Slice histogram into geometric segments,
calculate positive/negative areas, and determine net force and exhaustion.
"""

import numpy as np
from typing import List, Dict, Tuple
from dataclasses import dataclass


@dataclass
class SliceResult:
    """Result of Archimedes histogram slicing"""
    slices: List[Tuple[float, float]]  # (start_idx, area)
    total_area: float
    positive_area: float
    negative_area: float
    net_force: float
    exhaustion: float  # 0-1 scale, 1 = fully exhausted


class ArchimedesAnalyzer:
    """
    Archimedes Method for MACD Histogram Analysis
    
    Principles:
    1. Slice histogram into n geometric segments
    2. Calculate area under each slice (trapezoidal approximation)
    3. Sum positive and negative areas separately
    4. Net force = total area (positive + negative)
    5. Exhaustion = how close positive and negative areas are to canceling out
    """
    
    def __init__(self, base_frequency: float = 432.0):
        """
        Initialize Archimedes analyzer
        
        Args:
            base_frequency: Base harmonic frequency for audio translation (default 432 Hz)
        """
        self.base_frequency = base_frequency
    
    def slice_histogram(self, histogram: np.ndarray, n_slices: int = 20) -> SliceResult:
        """
        Slice MACD histogram using Archimedes' method of exhaustion
        
        Args:
            histogram: MACD histogram values (numpy array)
            n_slices: Number of slices to divide histogram into
            
        Returns:
            SliceResult with areas, net force, and exhaustion metric
        """
        if len(histogram) == 0:
            return SliceResult(
                slices=[],
                total_area=0.0,
                positive_area=0.0,
                negative_area=0.0,
                net_force=0.0,
                exhaustion=1.0
            )
        
        # Adjust n_slices if histogram is too short
        n_slices = min(n_slices, len(histogram))
        
        # Calculate slice width
        slice_width = len(histogram) / n_slices
        
        slices = []
        positive_area = 0.0
        negative_area = 0.0
        
        for i in range(n_slices):
            # Determine slice boundaries
            start_idx = int(i * slice_width)
            end_idx = int((i + 1) * slice_width)
            
            # Handle last slice to include remaining elements
            if i == n_slices - 1:
                end_idx = len(histogram)
            
            # Extract slice data
            slice_data = histogram[start_idx:end_idx]
            
            if len(slice_data) == 0:
                continue
            
            # Calculate area using trapezoidal rule
            # Area = sum of (base * height) for each bar
            area = np.sum(slice_data)
            
            slices.append((start_idx, area))
            
            # Accumulate positive and negative areas
            if area > 0:
                positive_area += area
            else:
                negative_area += area
        
        # Calculate total area (net force)
        total_area = positive_area + negative_area
        net_force = total_area
        
        # Calculate exhaustion metric
        # Exhaustion = 1 - |net_force| / (|positive_area| + |negative_area|)
        # When positive and negative areas cancel out, exhaustion → 1
        total_magnitude = abs(positive_area) + abs(negative_area)
        
        if total_magnitude > 0:
            exhaustion = 1.0 - (abs(net_force) / total_magnitude)
        else:
            exhaustion = 1.0  # No area = fully exhausted
        
        return SliceResult(
            slices=slices,
            total_area=total_area,
            positive_area=positive_area,
            negative_area=negative_area,
            net_force=net_force,
            exhaustion=exhaustion
        )
    
    def calculate_sensory_mapping(self, result: SliceResult) -> Dict[str, any]:
        """
        Map Archimedes analysis to sensory outputs (audio, haptic, visual)
        
        Args:
            result: SliceResult from slice_histogram
            
        Returns:
            Dictionary with sensory parameters
        """
        # Audio mapping
        # Frequency: Base 432 Hz + deviation based on net force
        # Higher net force = higher frequency
        frequency_deviation = result.net_force / 100.0  # Normalize
        audio_frequency = self.base_frequency * (1 + frequency_deviation)
        
        # Exhaustion tone: Lower frequency when exhausted
        exhaustion_tone = self.base_frequency * (1 - result.exhaustion * 0.5)
        
        # Amplitude: Based on total area magnitude
        audio_amplitude = min(abs(result.total_area) / 50.0, 1.0)
        
        # Haptic mapping
        # Intensity: Based on net force magnitude
        haptic_intensity = min(abs(result.net_force) / 20.0, 1.0)
        
        # Frequency: Faster vibration for stronger force
        haptic_frequency = 10 + (haptic_intensity * 40)  # 10-50 Hz range
        
        # Exhaustion vibration: Slow pulse when exhausted
        exhaustion_vibration = 2 + (result.exhaustion * 8)  # 2-10 Hz range
        
        # Visual mapping
        # Brightness: Based on total area
        visual_brightness = min(abs(result.total_area) / 30.0, 1.0)
        
        # Color: Green for positive net force, red for negative
        if result.net_force > 0:
            visual_color = f"rgba(0, 255, 136, {visual_brightness})"  # Green
        else:
            visual_color = f"rgba(255, 71, 87, {visual_brightness})"  # Red
        
        # Exhaustion dimming: Fade to gray when exhausted
        exhaustion_dimming = result.exhaustion
        
        return {
            "audio": {
                "frequency": audio_frequency,
                "amplitude": audio_amplitude,
                "exhaustion_tone": exhaustion_tone
            },
            "haptic": {
                "intensity": haptic_intensity,
                "frequency": haptic_frequency,
                "exhaustion_vibration": exhaustion_vibration
            },
            "visual": {
                "brightness": visual_brightness,
                "color": visual_color,
                "exhaustion_dimming": exhaustion_dimming
            },
            "metrics": {
                "total_area": result.total_area,
                "positive_area": result.positive_area,
                "negative_area": result.negative_area,
                "net_force": result.net_force,
                "exhaustion": result.exhaustion
            }
        }


def analyze_macd_histogram(histogram_data: List[float], n_slices: int = 20) -> Dict[str, any]:
    """
    Convenience function to analyze MACD histogram and return sensory mapping
    
    Args:
        histogram_data: List of MACD histogram values
        n_slices: Number of slices for Archimedes analysis
        
    Returns:
        Dictionary with sensory mapping and metrics
    """
    analyzer = ArchimedesAnalyzer()
    histogram_array = np.array(histogram_data)
    result = analyzer.slice_histogram(histogram_array, n_slices)
    return analyzer.calculate_sensory_mapping(result)


# Example usage
if __name__ == "__main__":
    # Test with example MACD histogram
    test_histogram = np.array([0.5, 0.8, 1.2, 0.9, -0.3, -0.7, 0.4, 0.1, -0.2, -0.5])
    
    analyzer = ArchimedesAnalyzer()
    result = analyzer.slice_histogram(test_histogram, n_slices=5)
    sensory = analyzer.calculate_sensory_mapping(result)
    
    print("Archimedes MACD Analysis:")
    print(f"Total Area: {result.total_area:.2f}")
    print(f"Positive Area: {result.positive_area:.2f}")
    print(f"Negative Area: {result.negative_area:.2f}")
    print(f"Net Force: {result.net_force:.2f}")
    print(f"Exhaustion: {result.exhaustion:.2%}")
    print(f"\nSensory Mapping:")
    print(f"Audio Frequency: {sensory['audio']['frequency']:.2f} Hz")
    print(f"Haptic Intensity: {sensory['haptic']['intensity']:.2%}")
    print(f"Visual Color: {sensory['visual']['color']}")

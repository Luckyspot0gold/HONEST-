"""
Euclidean Construction MACD Harmony Algorithm

Uses golden ratio (1.618) bisection to analyze MACD histogram data
and calculate harmony scores for audio/haptic feedback modulation.

@author Reality Protocol LLC
@standard HONEST v1.0
"""

import numpy as np
from typing import List, Tuple

GOLDEN_RATIO = 1.618


def euclid_construct_macd(hist: np.ndarray, n_constructions: int = 5) -> Tuple[List[Tuple[float, float, float]], float]:
    """
    Euclid construction: Bisect histogram at golden ratio points
    
    Args:
        hist: MACD histogram values (numpy array)
        n_constructions: Number of bisection constructions to perform
    
    Returns:
        Tuple of (constructions, harmony_score)
        - constructions: List of (left_sum, right_sum, deviation) tuples
        - harmony_score: 0 to 1, where 1 = perfect golden ratio alignment
    """
    if len(hist) == 0:
        return ([], 0.0)
    
    constructions = []
    
    for i in range(n_constructions):
        # Bisect at golden ratio point
        bisect_index = int(len(hist) / GOLDEN_RATIO)
        
        if bisect_index >= len(hist):
            bisect_index = len(hist) - 1
        
        # Calculate sums on each side of the bisection
        left_sum = float(np.sum(hist[:bisect_index]))
        right_sum = float(np.sum(hist[bisect_index:]))
        
        # Calculate proportion and deviation from golden ratio
        if right_sum != 0:
            proportion = left_sum / right_sum
        else:
            proportion = 0.0
        
        deviation = abs(proportion - GOLDEN_RATIO)
        constructions.append((left_sum, right_sum, deviation))
        
        # For next iteration, use the larger segment
        if left_sum > right_sum:
            hist = hist[:bisect_index]
        else:
            hist = hist[bisect_index:]
        
        # Stop if histogram is too small
        if len(hist) < 2:
            break
    
    # Calculate average deviation
    if len(constructions) > 0:
        avg_deviation = np.mean([d for _, _, d in constructions])
    else:
        avg_deviation = GOLDEN_RATIO  # Maximum deviation
    
    # Convert deviation to harmony score (1 = perfect, 0 = maximum deviation)
    harmony = 1.0 / (1.0 + avg_deviation)
    
    return (constructions, harmony)


def calculate_macd_histogram(prices: List[float], fast_period: int = 12, slow_period: int = 26, signal_period: int = 9) -> np.ndarray:
    """
    Calculate MACD histogram from price data
    
    Args:
        prices: List of price values
        fast_period: Fast EMA period (default 12)
        slow_period: Slow EMA period (default 26)
        signal_period: Signal line EMA period (default 9)
    
    Returns:
        MACD histogram as numpy array
    """
    if len(prices) < slow_period:
        return np.array([])
    
    prices_array = np.array(prices)
    
    # Calculate EMAs
    fast_ema = calculate_ema(prices_array, fast_period)
    slow_ema = calculate_ema(prices_array, slow_period)
    
    # MACD line = fast EMA - slow EMA
    macd_line = fast_ema - slow_ema
    
    # Signal line = EMA of MACD line
    signal_line = calculate_ema(macd_line, signal_period)
    
    # Histogram = MACD line - signal line
    histogram = macd_line - signal_line
    
    return histogram


def calculate_ema(data: np.ndarray, period: int) -> np.ndarray:
    """
    Calculate Exponential Moving Average
    
    Args:
        data: Input data array
        period: EMA period
    
    Returns:
        EMA values as numpy array
    """
    if len(data) < period:
        return np.array([])
    
    ema = np.zeros_like(data)
    multiplier = 2.0 / (period + 1)
    
    # Initialize with SMA
    ema[period - 1] = np.mean(data[:period])
    
    # Calculate EMA
    for i in range(period, len(data)):
        ema[i] = (data[i] - ema[i - 1]) * multiplier + ema[i - 1]
    
    return ema


def interpret_harmony_for_sensory(harmony: float) -> dict:
    """
    Interpret harmony score for multi-sensory feedback
    
    Args:
        harmony: Harmony score (0 to 1)
    
    Returns:
        Dictionary with audio and haptic parameters
    """
    # Audio: harmony > 0.8 = smooth 432 Hz; low = dissonant
    if harmony > 0.8:
        audio_mode = 'pure_tone'
        audio_frequency = 432.0
        audio_distortion = 0.0
    elif harmony > 0.6:
        audio_mode = 'harmonic'
        audio_frequency = 432.0
        audio_distortion = (0.8 - harmony) * 0.5
    else:
        audio_mode = 'dissonant'
        audio_frequency = 432.0 + (0.6 - harmony) * 100  # Shift frequency
        audio_distortion = (0.6 - harmony) * 2.0
    
    # Haptic: intensity and pattern based on harmony
    if harmony > 0.7:
        haptic_pattern = 'smooth'
        haptic_intensity = 0.5
    elif harmony > 0.4:
        haptic_pattern = 'rhythmic'
        haptic_intensity = 0.7
    else:
        haptic_pattern = 'chaotic'
        haptic_intensity = 0.9
    
    return {
        'audio': {
            'mode': audio_mode,
            'frequency': audio_frequency,
            'distortion': audio_distortion
        },
        'haptic': {
            'pattern': haptic_pattern,
            'intensity': haptic_intensity
        },
        'harmony_score': harmony
    }


# Example usage
if __name__ == '__main__':
    # Example BTC MACD histogram
    hist = np.array([0.5, 0.8, 1.2, 0.9, -0.3, -0.7, 0.4])
    
    constructions, harmony = euclid_construct_macd(hist)
    
    print(f"Constructions: {constructions}")
    print(f"Harmony Score: {harmony:.4f}")
    
    sensory_params = interpret_harmony_for_sensory(harmony)
    print(f"\nSensory Parameters:")
    print(f"  Audio Mode: {sensory_params['audio']['mode']}")
    print(f"  Audio Frequency: {sensory_params['audio']['frequency']:.2f} Hz")
    print(f"  Audio Distortion: {sensory_params['audio']['distortion']:.2f}")
    print(f"  Haptic Pattern: {sensory_params['haptic']['pattern']}")
    print(f"  Haptic Intensity: {sensory_params['haptic']['intensity']:.2f}")

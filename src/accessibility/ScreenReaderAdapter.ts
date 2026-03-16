// Add to existing ScreenReaderAdapter.ts
export class ScreenReaderAdapter {
  // Add WCAG compliance methods
  static async checkWCAGCompliance(element: HTMLElement): Promise<WCAGReport> {
    return {
      contrastRatio: this.checkContrast(element),
      keyboardNavigable: this.checkKeyboardNavigation(element),
      ariaLabels: this.checkAriaLabels(element),
      focusManagement: this.checkFocusManagement(element),
      motionSafety: this.checkMotionSafety(element)
    };
  }

  private static checkContrast(element: HTMLElement): number {
    // WCAG 2.1 AA requires 4.5:1 for normal text, 7:1 for large text
    const style = window.getComputedStyle(element);
    const textColor = style.color;
    const bgColor = style.backgroundColor;
    return this.calculateContrastRatio(textColor, bgColor);
  }

  // Add gesture announcement support
  announceGesture(gesture: string, action: string): void {
    const message = `Gesture detected: ${gesture}. Action: ${action}`;
    this.speak(message);
    this.updateAriaLive(message);
  }
}

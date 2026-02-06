/**
 * Skip to Content Link
 * 
 * WCAG 2.2 AA requirement: Allows keyboard users to skip navigation
 * and jump directly to main content.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-4 focus:ring-ring focus:font-semibold focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}

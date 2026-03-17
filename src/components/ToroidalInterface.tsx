// src/components/ToroidalInterface.tsx
export const ToroidalInterface: React.FC = () => {
  const toroidalNav = useToroidalNavigation();
  const perceptionLang = usePerceptionLanguage();
  const m3Metrics = useM3Metrics();
  
  return (
    <AccessibleContainer>
      {/* Toroidal Navigation Controls */}
      <GestureZone onGesture={toroidalNav.handleGesture}>
        <ToroidalVisualization 
          data={m3Metrics}
          onSelect={toroidalNav.selectElement}
        />
      </GestureZone>
      
      {/* Multi-Sensory Output */}
      <MultiSensoryOutput 
        audio={perceptionLang.audioOutput}
        haptic={perceptionLang.hapticOutput}
        visual={perceptionLang.visualOutput}
        linguistic={perceptionLang.linguisticOutput}
      />
      
      {/* Study Integration */}
      <RNIBStudyIntegration 
        hypothesis="H27"
        onComplete={toroidalNav.recordStudyCompletion}
      />
      
      {/* Accessibility Controls */}
      <AccessibilityControls
        screenReader={true}
        highContrast={true}
        reducedMotion={true}
        gestureSensitivity={0.7}
      />
    </AccessibleContainer>
  );
};

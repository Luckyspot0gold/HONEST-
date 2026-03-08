// Live M3 Renderer (Demo-Ready)
import React from 'react';

export const M3LiveRenderer = ({ data }) => {
  const m3 = new McCreaMarketMetrics(data);
  const metrics = m3.calculateM3(data);
  
  return (
    <div className="m3-dashboard">
      <div>HRI: {metrics.HRI.toFixed(2)}</div>
      <div>HSI: {metrics.HSI.toFixed(2)}</div>
      <div>HIV: {metrics.HIV.toFixed(2)}</div>
      <div>ISS: {metrics.ISS.toFixed(2)}</div>
      <div>SOS: {metrics.SOS.toFixed(2)}</div>
      <div>IV3D: [{metrics.IV3D.map(v => v.toFixed(2)).join(', ')}]</div>
      <div>ROC: {metrics.ROC.toFixed(2)}%</div>
    </div>
  );
};

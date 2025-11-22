import React, { useEffect, useState, memo } from 'react';
import { PerformanceMonitor as PM } from '../config/performance';

const PerformanceMonitor = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [measurements, setMeasurements] = useState({});
  const [memoryInfo, setMemoryInfo] = useState(null);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    const updateMeasurements = () => {
      setMeasurements(PM.getAllMeasurements());
      
      // Get memory info if available
      if (performance.memory) {
        setMemoryInfo({
          used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576), // MB
        });
      }
    };

    const interval = setInterval(updateMeasurements, 1000);
    updateMeasurements();

    return () => clearInterval(interval);
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Performance Monitor"
      >
        📊
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-w-sm max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Performance Monitor</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Memory Info */}
          {memoryInfo && (
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Memory Usage</h4>
              <div className="text-xs space-y-1">
                <div>Used: {memoryInfo.used} MB</div>
                <div>Total: {memoryInfo.total} MB</div>
                <div>Limit: {memoryInfo.limit} MB</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(memoryInfo.used / memoryInfo.limit) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Measurements */}
          <div className="mb-4">
            <h4 className="font-medium text-sm text-gray-700 mb-2">Measurements</h4>
            <div className="space-y-1 text-xs">
              {Object.entries(measurements).map(([name, duration]) => (
                <div key={name} className="flex justify-between">
                  <span className="text-gray-600 truncate">{name}:</span>
                  <span className={`font-mono ${
                    duration > 100 ? 'text-red-600' : 
                    duration > 50 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {duration.toFixed(2)}ms
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => PM.clearMeasurements()}
              className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-200"
            >
              Clear
            </button>
            <button
              onClick={() => console.log('Performance Data:', { measurements, memoryInfo })}
              className="flex-1 bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200"
            >
              Log Data
            </button>
          </div>

          {/* Performance Tips */}
          <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
            <div className="font-medium text-yellow-800 mb-1">Tips:</div>
            <ul className="text-yellow-700 space-y-1">
              <li>• Keep measurements under 50ms</li>
              <li>• Watch memory usage growth</li>
              <li>• Clear measurements regularly</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor;
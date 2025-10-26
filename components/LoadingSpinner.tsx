
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
      <p className="text-lg font-semibold text-slate-700">A otimizar rotas...</p>
      <p className="text-sm text-slate-500">Isto pode levar alguns segundos.</p>
    </div>
  );
};

export default LoadingSpinner;
    
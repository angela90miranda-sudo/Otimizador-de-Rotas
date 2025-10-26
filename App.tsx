
import React, { useState, useCallback } from 'react';
import { optimizeRoutesWithImage } from './services/geminiService';
import { Route } from './types';
import ImageUploader from './components/ImageUploader';
import RouteDisplay from './components/RouteDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { TruckIcon, AlertTriangleIcon } from './components/Icons';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [groundingInfo, setGroundingInfo] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setRoutes(null);
    setError(null);
    setGroundingInfo(null);
  };

  const handleOptimization = useCallback(async () => {
    if (!imageFile) {
      setError('Por favor, selecione uma imagem primeiro.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRoutes(null);
    setGroundingInfo(null);

    try {
      const result = await optimizeRoutesWithImage(imageFile);
      if (result.routes && result.routes.length > 0) {
        setRoutes(result.routes);
        setGroundingInfo(result.groundingInfo || null);
      } else {
        setError('Não foi possível gerar as rotas. A resposta da IA estava vazia ou mal formatada.');
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao otimizar as rotas. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  const handleReset = () => {
    setImageFile(null);
    setRoutes(null);
    setError(null);
    setIsLoading(false);
    setGroundingInfo(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4">
            <TruckIcon className="w-12 h-12 text-blue-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Otimizador de Rotas de Entrega
            </h1>
          </div>
          <p className="mt-2 text-lg text-slate-600">
            Carregue uma imagem da sua lista de entregas e nós criaremos duas rotas otimizadas.
          </p>
        </header>

        <main className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {!routes ? (
            <div className="flex flex-col items-center">
              <ImageUploader onImageUpload={handleImageUpload} />
              {error && (
                <div className="mt-6 flex items-center text-red-600 bg-red-100 p-3 rounded-lg w-full max-w-lg">
                  <AlertTriangleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {isLoading ? (
                <div className="mt-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <button
                  onClick={handleOptimization}
                  disabled={!imageFile}
                  className="mt-8 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-300"
                >
                  Otimizar Rotas
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Rotas Geradas</h2>
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75 transition-colors duration-300"
                >
                  Começar de Novo
                </button>
              </div>
              <RouteDisplay routes={routes} groundingInfo={groundingInfo} />
            </div>
          )}
        </main>
        
        <footer className="text-center mt-8 text-sm text-slate-500">
          <p>Powered by Gemini API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
    

import React, { useState, useCallback, useEffect } from 'react';
import { optimizeRoutesWithImage } from './services/geminiService';
import { Route } from './types';
import ImageUploader from './components/ImageUploader';
import RouteDisplay from './components/RouteDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { TruckIcon, AlertTriangleIcon, KeyIcon } from './components/Icons';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [tempApiKey, setTempApiKey] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [groundingInfo, setGroundingInfo] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [numberOfDrivers, setNumberOfDrivers] = useState<number>(2);

  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini-api-key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    const trimmedKey = tempApiKey.trim();
    if (trimmedKey) {
      setApiKey(trimmedKey);
      localStorage.setItem('gemini-api-key', trimmedKey);
      setError(null);
    } else {
      setError('Por favor, introduza uma chave de API válida.');
    }
  };
  
  const handleChangeApiKey = () => {
      setApiKey(null);
      setTempApiKey('');
      localStorage.removeItem('gemini-api-key');
      handleReset();
  };

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
    if (!apiKey) {
      setError('A chave de API não está configurada.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRoutes(null);
    setGroundingInfo(null);

    try {
      const result = await optimizeRoutesWithImage(apiKey, imageFile, numberOfDrivers);
      if (result.routes && result.routes.length > 0) {
        setRoutes(result.routes);
        setGroundingInfo(result.groundingInfo || null);
      } else {
        setError('Não foi possível gerar as rotas. A resposta da IA estava vazia ou mal formatada.');
      }
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes('api key not valid') || err.message.toLowerCase().includes('invalid')) {
          setError('A chave de API fornecida é inválida. Por favor, verifique se a copiou corretamente, sem espaços extra, e tente novamente.');
        } else {
          // Exibe a mensagem de erro mais detalhada vinda do serviço.
          setError(err.message);
        }
      } else {
        setError('Ocorreu um erro desconhecido ao otimizar as rotas.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, imageFile, numberOfDrivers]);

  const handleReset = () => {
    setImageFile(null);
    setRoutes(null);
    setError(null);
    setIsLoading(false);
    setGroundingInfo(null);
    setNumberOfDrivers(2);
  };

  const renderApiKeyInput = () => (
    <div className="w-full max-w-md mx-auto text-center">
      <KeyIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Configure a sua Chave de API</h2>
      <p className="text-slate-600 mb-6">Para utilizar a aplicação, precisa de uma chave de API da Gemini.</p>
      <div className="relative">
        <input
          type="password"
          value={tempApiKey}
          onChange={(e) => setTempApiKey(e.target.value)}
          placeholder="Introduza a sua chave de API da Gemini"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
       {error && (
            <div className="mt-4 flex items-start text-sm text-red-600 text-left">
                <AlertTriangleIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                <span className="break-words">{error}</span>
            </div>
        )}
      <button
        onClick={handleSaveApiKey}
        className="mt-6 w-full px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors duration-300"
      >
        Guardar e Continuar
      </button>
       <p className="mt-4 text-xs text-slate-500">
        A sua chave de API é guardada localmente no seu navegador e nunca é partilhada.
      </p>
    </div>
  );

  const renderApp = () => (
    <>
      {!routes ? (
        <div className="flex flex-col items-center">
          <ImageUploader onImageUpload={handleImageUpload} />
          {error && (
            <div className="mt-6 flex items-start text-red-600 bg-red-100 p-4 rounded-lg w-full max-w-lg">
              <AlertTriangleIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <span className="break-words">{error}</span>
            </div>
          )}
          {isLoading ? (
            <div className="mt-8">
              <LoadingSpinner />
            </div>
          ) : (
            imageFile && (
              <div className="flex flex-col items-center w-full">
                <div className="mt-8 flex justify-center items-center gap-4">
                  <span className="font-semibold text-slate-600">Número de Motoristas:</span>
                  <div className="flex rounded-lg bg-slate-200 p-1">
                    <button
                      onClick={() => setNumberOfDrivers(2)}
                      className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${
                        numberOfDrivers === 2 ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:bg-slate-300'
                      }`}
                      aria-pressed={numberOfDrivers === 2}
                    >
                      2
                    </button>
                    <button
                      onClick={() => setNumberOfDrivers(3)}
                      className={`px-4 py-1 rounded-md text-sm font-semibold transition-colors ${
                        numberOfDrivers === 3 ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:bg-slate-300'
                      }`}
                      aria-pressed={numberOfDrivers === 3}
                    >
                      3
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleOptimization}
                  disabled={!imageFile}
                  className="mt-4 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-300"
                >
                  Otimizar Rotas
                </button>
              </div>
            )
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
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex justify-center items-center gap-4">
            <TruckIcon className="w-12 h-12 text-blue-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Otimizador de Rotas de Entrega
            </h1>
          </div>
          <p className="mt-2 text-lg text-slate-600">
            Mostra-me a tua lista e eu faço rotas optimizadas
          </p>
        </header>

        <main className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {apiKey ? renderApp() : renderApiKeyInput()}
        </main>
        
        <footer className="text-center mt-8 text-sm text-slate-500">
          <p>Powered by Gemini API</p>
           {apiKey && (
            <button onClick={handleChangeApiKey} className="text-xs text-blue-600 hover:underline mt-1">
                Alterar Chave API
            </button>
           )}
        </footer>
      </div>
    </div>
  );
};

export default App;

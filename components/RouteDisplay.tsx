
import React from 'react';
import { Route, Stop } from '../types';
import { MapPinIcon, BoxIcon, MapIcon, PhoneIcon } from './Icons';

interface RouteDisplayProps {
  routes: Route[];
  groundingInfo: any[] | null;
}

const StopCard: React.FC<{ stop: Stop }> = ({ stop }) => (
  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4 shadow-sm transform hover:scale-[1.02] transition-transform duration-300">
    <div className="flex items-start">
      <div className="flex-shrink-0 mr-4 mt-1">
        <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white font-bold rounded-full">
          {stop.stop}
        </span>
      </div>
      <div className="flex-grow">
        <h4 className="font-bold text-lg text-slate-800">{stop.nome}</h4>
        {stop.telefone && (
            <div className="flex items-center text-slate-600 mt-1">
                <PhoneIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                <p className="text-sm">{stop.telefone}</p>
            </div>
        )}
        <div className="flex items-center text-slate-600 mt-1">
          <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          <p className="text-sm">{stop.morada}</p>
        </div>
        <div className="flex items-center text-slate-600 mt-1">
          <BoxIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          <p className="text-sm">{stop.caixas} caixa(s)</p>
        </div>
      </div>
    </div>
  </div>
);

const RouteDisplay: React.FC<RouteDisplayProps> = ({ routes, groundingInfo }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {routes.map((route, index) => {
          const totalBoxes = route.route.reduce((sum, stop) => sum + (stop.caixas || 0), 0);
          return (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                 <h3 className="text-xl font-bold text-blue-700">{route.driver}</h3>
                 <div className="flex items-center text-sm font-semibold text-slate-700 bg-slate-100 rounded-full px-3 py-1">
                    <BoxIcon className="w-4 h-4 mr-1.5 text-slate-500" />
                    <span>{totalBoxes} caixas</span>
                 </div>
              </div>
              <div>
                {route.route.sort((a, b) => a.stop - b.stop).map((stop, stopIndex) => (
                  <StopCard key={stopIndex} stop={stop} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {groundingInfo && groundingInfo.length > 0 && (
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <MapIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-md font-semibold text-blue-800">Fontes do Google Maps</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>As rotas foram otimizadas com base nas informações do Google Maps. Fontes de dados utilizadas:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {groundingInfo.map((chunk, index) => (
                    chunk.maps?.uri && (
                      <li key={index}>
                        <a 
                          href={chunk.maps.uri} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-medium underline hover:text-blue-900"
                        >
                          {chunk.maps.title || 'Link do Mapa'}
                        </a>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteDisplay;

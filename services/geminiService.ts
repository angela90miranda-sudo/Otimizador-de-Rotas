
import { GoogleGenAI } from "@google/genai";
import { Route } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const cleanJsonString = (str: string): string => {
  // Remove markdown code block fences and trim whitespace
  const cleaned = str.replace(/```json/g, '').replace(/```/g, '').trim();
  return cleaned;
};

export const optimizeRoutesWithImage = async (imageFile: File, numberOfDrivers: number): Promise<{ routes: Route[] | null, groundingInfo: any[] | null }> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imagePart = await fileToGenerativePart(imageFile);
  
  const driverCountText = numberOfDrivers === 2 ? 'duas' : 'três';
  const driverNames = Array.from({ length: numberOfDrivers }, (_, i) => `'Motorista ${i + 1}'`).join(', ');

  const prompt = `
    Você é um especialista em otimização de logística. Com base na lista de entregas na imagem fornecida, crie ${driverCountText} rotas eficientes e otimizadas para ${numberOfDrivers} motoristas distintos, chamados ${driverNames}. Use seu conhecimento de geografia e planejamento de rotas para agrupar locais próximos.

    Forneça a saída como um único array JSON minificado. Não inclua nenhum texto antes ou depois do array JSON. Cada objeto no array deve representar a rota de um motorista e deve ter duas chaves: 'driver' (uma string, por exemplo, 'Motorista 1') e 'route' (um array de objetos de parada).

    Cada objeto de parada no array 'route' deve ter as seguintes chaves:
    - 'stop': um número inteiro representando a ordem da parada.
    - 'nome': uma string para o nome do cliente.
    - 'morada': uma string para o endereço de entrega completo.
    - 'caixas': um número inteiro para o número de caixas.
    - 'telefone': uma string para o número de telefone do cliente.

    Exemplo do formato JSON necessário:
    [{"driver":"Motorista 1","route":[{"stop":1,"nome":"Ana Costa","morada":"Rua Francisco Franco, 42 Queluz","caixas":3,"telefone":"9632589558"}, ...]}, {"driver":"Motorista 2","route":[{"stop":1,"nome":"Joao Sousa","morada":"Av Dr. Miguel Bombarda, 219, Queluz","caixas":2,"telefone":"21548555"}, ...]}]
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      tools: [{ googleMaps: {} }],
    },
  });
  
  const text = response.text;
  const groundingInfo = response.candidates?.[0]?.groundingMetadata?.groundingChunks || null;

  if (!text) {
    console.error("Gemini API returned an empty response.");
    return { routes: null, groundingInfo };
  }
  
  try {
    const cleanedText = cleanJsonString(text);
    const parsedRoutes: Route[] = JSON.parse(cleanedText);
    return { routes: parsedRoutes, groundingInfo };
  } catch (error) {
    console.error("Failed to parse JSON response from Gemini:", error);
    console.error("Original response text:", text);
    throw new Error("Failed to parse routes from Gemini response.");
  }
};

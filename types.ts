
export interface Stop {
  stop: number;
  nome: string;
  morada: string;
  caixas: number;
  telefone: string;
}

export interface Route {
  driver: string;
  route: Stop[];
}
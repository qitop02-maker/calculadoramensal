export type Group = 'Geral' | 'Wil' | 'Nu B' | 'M.P' | 'Sicred' | string;

export type Status = 'pendente' | 'pago';

export interface Bill {
  id: string;
  mes_ref: string; // YYYY-MM
  nome: string;
  valor: number;
  grupo: Group;
  parcelado: boolean;
  parcela_atual?: number;
  parcela_total?: number;
  status: Status;
  fixa: boolean;
  observacoes?: string;
  categoria?: string;
  vencimento?: number;
}

export interface MonthlyStats {
  total: number;
  pago: number;
  pendente: number;
}

import { Bill } from './types';

export const SEED_DATA: Bill[] = [
  // Grupo: Geral
  {
    id: '1',
    mes_ref: '2026-03',
    nome: 'Casa',
    valor: 876.00,
    categoria: 'Moradia',
    grupo: 'Geral',
    parcelado: true,
    parcela_atual: 5,
    parcela_total: 12,
    status: 'pendente'
  },
  {
    id: '2',
    mes_ref: '2026-03',
    nome: 'TV',
    valor: 35.00,
    categoria: 'Lazer',
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente'
  },
  {
    id: '3',
    mes_ref: '2026-03',
    nome: 'Net',
    valor: 102.00,
    categoria: 'Internet',
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente'
  },
  {
    id: '4',
    mes_ref: '2026-03',
    nome: 'Condomínio',
    valor: 350.00,
    categoria: 'Moradia',
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente'
  },
  {
    id: '5',
    mes_ref: '2026-03',
    nome: 'Luz',
    valor: 160.00,
    categoria: 'Moradia',
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente'
  },
  {
    id: '6',
    mes_ref: '2026-03',
    nome: 'Seguro',
    valor: 85.50,
    categoria: 'Seguro',
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente'
  },
  {
    id: '7',
    mes_ref: '2026-03',
    nome: 'IPTU',
    valor: 50.11,
    categoria: 'Impostos',
    grupo: 'Geral',
    parcelado: true,
    parcela_atual: 1,
    parcela_total: 6,
    status: 'pendente'
  },
  {
    id: '8',
    mes_ref: '2026-03',
    nome: 'IPVA',
    valor: 31.00,
    categoria: 'Impostos',
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente'
  },
  // Grupo: Wil
  {
    id: '9',
    mes_ref: '2026-03',
    nome: 'Wil',
    valor: 32.00,
    categoria: 'Cartão',
    grupo: 'Wil',
    parcelado: true,
    parcela_atual: 5,
    parcela_total: 6,
    status: 'pendente'
  },
  {
    id: '10',
    mes_ref: '2026-03',
    nome: 'Wil',
    valor: 50.00,
    categoria: 'Cartão',
    grupo: 'Wil',
    parcelado: true,
    parcela_atual: 2,
    parcela_total: 3,
    status: 'pendente'
  },
  {
    id: '11',
    mes_ref: '2026-03',
    nome: 'Wil',
    valor: 35.00,
    categoria: 'Cartão',
    grupo: 'Wil',
    parcelado: true,
    parcela_atual: 2,
    parcela_total: 4,
    status: 'pendente'
  },
  // Grupo: Nu B
  {
    id: '12',
    mes_ref: '2026-03',
    nome: 'Nu B',
    valor: 375.00,
    categoria: 'Cartão',
    grupo: 'Nu B',
    parcelado: true,
    parcela_atual: 9,
    parcela_total: 12,
    status: 'pendente'
  },
  {
    id: '13',
    mes_ref: '2026-03',
    nome: 'Nu B',
    valor: 59.89,
    categoria: 'Cartão',
    grupo: 'Nu B',
    parcelado: true,
    parcela_atual: 3,
    parcela_total: 5,
    status: 'pendente'
  },
  {
    id: '14',
    mes_ref: '2026-03',
    nome: 'Nu B',
    valor: 28.59,
    categoria: 'Cartão',
    grupo: 'Nu B',
    parcelado: true,
    parcela_atual: 4,
    parcela_total: 10,
    status: 'pendente'
  },
  {
    id: '15',
    mes_ref: '2026-03',
    nome: 'Nu B',
    valor: 56.63,
    categoria: 'Cartão',
    grupo: 'Nu B',
    parcelado: true,
    parcela_atual: 2,
    parcela_total: 2,
    status: 'pendente'
  },
  // Grupo: M.P
  {
    id: '16',
    mes_ref: '2026-03',
    nome: 'M.P',
    valor: 70.79,
    categoria: 'Cartão',
    grupo: 'M.P',
    parcelado: true,
    parcela_atual: 9,
    parcela_total: 24,
    status: 'pendente'
  },
  // Grupo: Sicred
  {
    id: '17',
    mes_ref: '2026-03',
    nome: 'Sicred',
    valor: 255.86,
    categoria: 'Outros',
    grupo: 'Sicred',
    parcelado: false,
    status: 'pendente'
  }
];

export const CATEGORIES: string[] = [
  'Moradia', 'Internet', 'Impostos', 'Seguro', 'Cartão', 'Lazer', 'Alimentação', 'Transporte', 'Saúde', 'Outros'
];

export const GROUPS: string[] = [
  'Geral', 'Wil', 'Nu B', 'M.P', 'Sicred'
];

export const MONTHS = [
  { value: '2026-01', label: 'Janeiro' },
  { value: '2026-02', label: 'Fevereiro' },
  { value: '2026-03', label: 'Março' },
  { value: '2026-04', label: 'Abril' },
  { value: '2026-05', label: 'Maio' },
  { value: '2026-06', label: 'Junho' },
  { value: '2026-07', label: 'Julho' },
  { value: '2026-08', label: 'Agosto' },
  { value: '2026-09', label: 'Setembro' },
  { value: '2026-10', label: 'Outubro' },
  { value: '2026-11', label: 'Novembro' },
  { value: '2026-12', label: 'Dezembro' },
];

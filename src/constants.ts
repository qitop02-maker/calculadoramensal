import { Bill } from './types';

export const SEED_DATA: Bill[] = [
  // Grupo: Geral
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    mes_ref: '2026-03',
    nome: 'Casa',
    valor: 876.00,
    grupo: 'Geral',
    parcelado: true,
    parcela_atual: 5,
    parcela_total: 12,
    status: 'pendente',
    fixa: false
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    mes_ref: '2026-03',
    nome: 'TV',
    valor: 35.00,
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente',
    fixa: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    mes_ref: '2026-03',
    nome: 'Net',
    valor: 102.00,
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente',
    fixa: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    mes_ref: '2026-03',
    nome: 'Condomínio',
    valor: 350.00,
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente',
    fixa: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    mes_ref: '2026-03',
    nome: 'Luz',
    valor: 160.00,
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente',
    fixa: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    mes_ref: '2026-03',
    nome: 'Seguro',
    valor: 85.50,
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente',
    fixa: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    mes_ref: '2026-03',
    nome: 'IPTU',
    valor: 50.11,
    grupo: 'Geral',
    parcelado: true,
    parcela_atual: 1,
    parcela_total: 6,
    status: 'pendente',
    fixa: false
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    mes_ref: '2026-03',
    nome: 'IPVA',
    valor: 31.00,
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente',
    fixa: false
  },
  // Grupo: Wil
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    mes_ref: '2026-03',
    nome: 'Wil',
    valor: 32.00,
    grupo: 'Wil',
    parcelado: true,
    parcela_atual: 5,
    parcela_total: 6,
    status: 'pendente',
    fixa: false
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    mes_ref: '2026-03',
    nome: 'Wil',
    valor: 50.00,
    grupo: 'Wil',
    parcelado: true,
    parcela_atual: 2,
    parcela_total: 3,
    status: 'pendente',
    fixa: false
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    mes_ref: '2026-03',
    nome: 'Wil',
    valor: 35.00,
    grupo: 'Wil',
    parcelado: true,
    parcela_atual: 2,
    parcela_total: 4,
    status: 'pendente',
    fixa: false
  },
  // Grupo: Nu B
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    mes_ref: '2026-03',
    nome: 'Nu B',
    valor: 375.00,
    grupo: 'Nu B',
    parcelado: true,
    parcela_atual: 9,
    parcela_total: 12,
    status: 'pendente',
    fixa: false
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    mes_ref: '2026-03',
    nome: 'Nu B',
    valor: 59.89,
    grupo: 'Nu B',
    parcelado: true,
    parcela_atual: 3,
    parcela_total: 5,
    status: 'pendente',
    fixa: false
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    mes_ref: '2026-03',
    nome: 'Nu B',
    valor: 28.59,
    grupo: 'Nu B',
    parcelado: true,
    parcela_atual: 4,
    parcela_total: 10,
    status: 'pendente',
    fixa: false
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    mes_ref: '2026-03',
    nome: 'Nu B',
    valor: 56.63,
    grupo: 'Nu B',
    parcelado: true,
    parcela_atual: 2,
    parcela_total: 2,
    status: 'pendente',
    fixa: false
  },
  // Grupo: M.P
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    mes_ref: '2026-03',
    nome: 'M.P',
    valor: 70.79,
    grupo: 'M.P',
    parcelado: true,
    parcela_atual: 9,
    parcela_total: 24,
    status: 'pendente',
    fixa: false
  },
  // Grupo: Sicred
  {
    id: '550e8400-e29b-41d4-a716-446655440016',
    mes_ref: '2026-03',
    nome: 'Sicred',
    valor: 255.86,
    grupo: 'Sicred',
    parcelado: false,
    status: 'pendente',
    fixa: false
  }
];

export const GROUPS: string[] = [
  'Geral', 'Wil', 'Nu B', 'M.P', 'Sicred', 'Mercado'
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

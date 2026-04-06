import { Bill } from './types';

const currentYear = new Date().getFullYear();
const currentMonthStr = `${currentYear}-03`;

export const SEED_DATA: Bill[] = [
  // Grupo: Geral
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    mes_ref: currentMonthStr,
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
    mes_ref: currentMonthStr,
    nome: 'TV',
    valor: 35.00,
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente',
    fixa: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    mes_ref: currentMonthStr,
    nome: 'Net',
    valor: 102.00,
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente',
    fixa: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    mes_ref: currentMonthStr,
    nome: 'Condomínio',
    valor: 350.00,
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente',
    fixa: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    mes_ref: currentMonthStr,
    nome: 'Luz',
    valor: 160.00,
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente',
    fixa: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    mes_ref: currentMonthStr,
    nome: 'Seguro',
    valor: 85.50,
    grupo: 'Geral',
    parcelado: false,
    status: 'pendente',
    fixa: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    mes_ref: currentMonthStr,
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
    mes_ref: currentMonthStr,
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
    mes_ref: currentMonthStr,
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
    mes_ref: currentMonthStr,
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
    mes_ref: currentMonthStr,
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
    mes_ref: currentMonthStr,
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
    mes_ref: currentMonthStr,
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
    mes_ref: currentMonthStr,
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
    mes_ref: currentMonthStr,
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
    mes_ref: currentMonthStr,
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
    mes_ref: currentMonthStr,
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
  { value: `${currentYear}-01`, label: 'Janeiro' },
  { value: `${currentYear}-02`, label: 'Fevereiro' },
  { value: `${currentYear}-03`, label: 'Março' },
  { value: `${currentYear}-04`, label: 'Abril' },
  { value: `${currentYear}-05`, label: 'Maio' },
  { value: `${currentYear}-06`, label: 'Junho' },
  { value: `${currentYear}-07`, label: 'Julho' },
  { value: `${currentYear}-08`, label: 'Agosto' },
  { value: `${currentYear}-09`, label: 'Setembro' },
  { value: `${currentYear}-10`, label: 'Outubro' },
  { value: `${currentYear}-11`, label: 'Novembro' },
  { value: `${currentYear}-12`, label: 'Dezembro' },
];

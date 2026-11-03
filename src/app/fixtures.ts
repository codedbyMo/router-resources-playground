/**
 * Declared fixtures for the router resources playground. The in-memory
 * interceptor serves these over fake /api endpoints, so every route
 * resource in the app loads through the same code path a real backend
 * would use, with no server to run.
 */

export interface User {
  id: string;
  name: string;
  role: string;
}

export interface Product {
  sku: string;
  name: string;
  price: number;
}

export interface ReportData {
  title: string;
  generatedAt: string;
  totalUsers: number;
  totalProducts: number;
}

export const USER_FIXTURES: Record<string, User> = {
  '1': { id: '1', name: 'Ada Lovelace', role: 'Admin' },
  '2': { id: '2', name: 'Grace Hopper', role: 'Editor' },
  '3': { id: '3', name: 'Alan Turing', role: 'Viewer' },
};

export const PRODUCT_FIXTURES: Record<string, Product> = {
  'kb-01': { sku: 'kb-01', name: 'Mechanical Keyboard', price: 129 },
  'ms-02': { sku: 'ms-02', name: 'Wireless Mouse', price: 59 },
};

export const REPORT_FIXTURE: ReportData = {
  title: 'Catalog summary',
  generatedAt: '2026-10-31',
  totalUsers: Object.keys(USER_FIXTURES).length,
  totalProducts: Object.keys(PRODUCT_FIXTURES).length,
};

// src/services/quoteService.ts

import api from '@/lib/axios';  
import { QuoteFormData } from '@/types/quote';

const getNewRequests = async () => {
  const res = await api.get('/api/quote-request/new');
  return res.data;
};

const getRequestById = async (id: string) => {
  const res = await api.get(`/api/quote-request/${id}`);
  return res.data;
};

const createRequest = async (data: any) => {
  const res = await api.post('/api/quote-request', data);
  return res.data;
};

const confirmRequest = async (id: string) => {
  const res = await api.post(`/api/quote-request/${id}/confirm`);
  return res.data;
};

const rejectRequest = async (id: string) => {
  const res = await api.post(`/api/quote-request/${id}/reject`);
  return res.data;
};

const getMaterialKits = async () => {
  const res = await api.get('/material-kits');
  return res.data;
};

const getMaterialKitById = async (id: string) => {
  const res = await api.get(`/material-kits/${id}`);
  return res.data;
};

const getConfirmedQuotes = async () => {
  const res = await api.get('/quotes/confirmed');
  return res.data;
};

const getPreparedQuotes = async () => {
  const res = await api.get('/quotes/prepared');
  return res.data;
};

const getValidatedQuotes = async () => {
  const res = await api.get('/quotes/validated');
  return res.data;
};

const getQuoteById = async (id: string) => {
  const res = await api.get(`/quotes/${id}`);
  return res.data;
};

const createQuote = async (data: QuoteFormData) => {
  const res = await api.post('/quotes', data);
  return res.data;
};

const updateQuote = async (id: string, data: Partial<QuoteFormData>) => {
  const res = await api.put(`/quotes/${id}`, data);
  return res.data;
};

const prepareQuote = async (id: string) => {
  const res = await api.post(`/quotes/${id}/prepare`);
  return res.data;
};

const sendQuote = async (id: string) => {
  const res = await api.post(`/quotes/${id}/send`);
  return res.data;
};

const createInstallation = async (quoteId: string) => {
  const res = await api.post(`/quotes/${quoteId}/create-installation`);
  return res.data;
};

export const quoteService = {
  getNewRequests,
  getRequestById,
  createRequest,
  confirmRequest,
  rejectRequest,
  getMaterialKits,
  getMaterialKitById,
  getConfirmedQuotes,
  getPreparedQuotes,
  getValidatedQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  prepareQuote,
  sendQuote,
  createInstallation,
};

// src/services/paymentervice.ts

import api from '@/lib/axios';  
import { PaymentIntent, Invoice } from '@/types/payment';

export const paymentService = {
  createPaymentIntent: async (invoiceId: string) => {
    try {
      const res = await api.post('/payment/create-intent', { invoiceId });
      return res.data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  getAllInvoices: async (): Promise<Invoice[]> => {
    try {
      const res = await api.get('/invoices');
      return res.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  },

  getInvoiceById: async (id: string): Promise<Invoice> => {
    try {
      const res = await api.get(`/invoices/${id}`);
      return res.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  },

  downloadInvoicePdf: async (id: string): Promise<Blob> => {
    try {
      const res = await api.post(`/invoices/${id}/download-pdf`, {}, {
        responseType: 'blob',
      });
      return res.data;
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      throw error;
    }
  },

  processPayment: async (invoiceId: string, paymentMethod: string) => {
    try {
      const res = await api.post('/payment/process', {
        invoiceId,
        paymentMethod,
      });
      return res.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // ✅ Méthode utilisée dans PaymentForm.tsx
  makePayment: async ({
    userId,
    paymentId,
    paymentMethodId,
  }: {
    userId: string;
    paymentId: string;
    paymentMethodId: string;
  }) => {
    try {
      const res = await api.post('/payment/confirm', {
        userId,
        paymentId,
        paymentMethodId,
      });
      return res;
    } catch (error) {
      console.error("❌ Erreur makePayment:", error);
      throw error;
    }
  },
};

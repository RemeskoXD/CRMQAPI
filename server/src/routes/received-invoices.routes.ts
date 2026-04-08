import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

export function createReceivedInvoiceRoutes(repos: Repositories): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/', authorize('invoices:read'), async (req, res) => {
    try {
      const invoices = await repos.receivedInvoices.findAll({
        status: req.query.status as string,
        projectId: req.query.projectId as string,
      });
      res.json({ success: true, data: invoices });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.get('/:id', authorize('invoices:read'), async (req, res) => {
    try {
      const inv = await repos.receivedInvoices.findById(req.params.id);
      if (!inv) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, data: inv });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  router.post('/', authorize('invoices:write'), async (req, res) => {
    try {
      const inv = await repos.receivedInvoices.create(req.body);
      res.status(201).json({ success: true, data: inv });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  // OCR endpoint - simulated AI extraction
  router.post('/ocr', authorize('invoices:write'), async (req, res) => {
    try {
      // In production: receive file upload, send to OCR API (Google Vision, Azure AI, etc.)
      // For now: simulate extraction from provided text/image
      const { text } = req.body;

      const extractedData = {
        supplierName: extractField(text, /(?:dodavatel|firma|název)[:\s]*([^\n]+)/i) || 'Neznámý dodavatel',
        supplierIco: extractField(text, /(?:ičo|ič|ico)[:\s]*(\d{8})/i),
        invoiceNumber: extractField(text, /(?:faktura|číslo|doklad)[:\s]*([A-Z0-9\-\/]+)/i) || 'OCR-' + Date.now(),
        total: parseFloat(extractField(text, /(?:celkem|k úhradě|total)[:\s]*([\d\s,.]+)/i)?.replace(/\s/g, '').replace(',', '.') || '0'),
        vatTotal: parseFloat(extractField(text, /(?:dph|vat)[:\s]*([\d\s,.]+)/i)?.replace(/\s/g, '').replace(',', '.') || '0'),
        dueDate: extractField(text, /(?:splatnost|due)[:\s]*(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{2,4})/i),
      };

      extractedData.total = extractedData.total || 0;
      const subtotal = extractedData.total - (extractedData.vatTotal || 0);

      res.json({
        success: true,
        data: {
          ...extractedData,
          subtotal: subtotal > 0 ? subtotal : extractedData.total,
          issueDate: new Date().toISOString().slice(0, 10),
          dueDate: extractedData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          currency: 'CZK',
          status: 'pending',
        },
        message: 'Data extrahována z OCR. Zkontrolujte a doplňte.',
      });
    } catch {
      res.status(500).json({ success: false, error: 'OCR extrakce selhala' });
    }
  });

  router.patch('/:id', authorize('invoices:write'), async (req, res) => {
    try {
      const inv = await repos.receivedInvoices.update(req.params.id, req.body);
      if (!inv) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }
      res.json({ success: true, data: inv });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  return router;
}

function extractField(text: string, regex: RegExp): string | undefined {
  const match = text?.match(regex);
  return match?.[1]?.trim();
}

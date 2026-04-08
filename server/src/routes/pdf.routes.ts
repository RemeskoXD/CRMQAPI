import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { authenticate, authorize } from '../middleware/auth.js';

export function createPdfRoutes(repos: Repositories): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/invoice/:id', authorize('invoices:read'), async (req, res) => {
    try {
      const invoice = await repos.invoices.findById(req.params.id);
      if (!invoice) { res.status(404).json({ success: false, error: 'Nenalezeno' }); return; }

      const client = await repos.clients.findById(invoice.clientId);

      const clientName = client
        ? (client.type === 'company' ? client.companyName : `${client.firstName} ${client.lastName}`)
        : 'Neznámý klient';

      const html = generateInvoiceHtml(invoice, client, clientName!);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  return router;
}

function formatCZK(n: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('cs-CZ');
}

const TYPE_LABELS: Record<string, string> = {
  quote: 'CENOVÁ NABÍDKA', advance: 'ZÁLOHOVÁ FAKTURA', invoice: 'DAŇOVÝ DOKLAD',
};

function generateInvoiceHtml(invoice: any, client: any, clientName: string): string {
  const itemRows = (invoice.items || []).map((item: any, idx: number) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#333;">${idx + 1}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;color:#333;">${item.description}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;color:#333;">${item.quantity}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;color:#333;">${formatCZK(item.unitPrice)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;color:#333;">${item.vatRate}%</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;color:#333;">${formatCZK(item.totalPrice)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <title>${invoice.invoiceNumber} - ${TYPE_LABELS[invoice.type]}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; background:#fff; color:#333; }
    @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
    .page { max-width:800px; margin:0 auto; padding:40px; }
    .print-btn { position:fixed; bottom:20px; right:20px; background:#D4AF37; color:#0B1126; border:none;
                 padding:12px 24px; border-radius:8px; font-weight:600; cursor:pointer; font-size:14px;
                 box-shadow:0 4px 12px rgba(0,0,0,0.15); }
    .print-btn:hover { background:#E8CC6E; }
    @media print { .print-btn { display:none; } }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
      <div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
          <div style="width:40px;height:40px;background:#D4AF37;border-radius:10px;display:flex;align-items:center;justify-content:center;">
            <span style="color:#0B1126;font-weight:700;font-size:14px;">CQ</span>
          </div>
          <span style="font-size:24px;font-weight:700;color:#0B1126;">CRMQ</span>
        </div>
        <p style="color:#666;font-size:13px;">Montáž a servis garážových vrat, oken a stínící techniky</p>
        <p style="color:#999;font-size:12px;margin-top:4px;">IČO: 00000000 | DIČ: CZ00000000</p>
      </div>
      <div style="text-align:right;">
        <div style="background:#0B1126;color:#D4AF37;padding:8px 20px;border-radius:8px;font-weight:700;font-size:14px;display:inline-block;">
          ${TYPE_LABELS[invoice.type]}
        </div>
        <p style="font-size:22px;font-weight:700;color:#0B1126;margin-top:12px;">${invoice.invoiceNumber}</p>
      </div>
    </div>

    <!-- Dates + Client -->
    <div style="display:flex;gap:40px;margin-bottom:32px;">
      <div style="flex:1;background:#f8f8f8;padding:20px;border-radius:12px;">
        <p style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Odběratel</p>
        <p style="font-weight:600;font-size:16px;color:#0B1126;">${clientName}</p>
        ${client?.ico ? `<p style="font-size:13px;color:#666;margin-top:4px;">IČO: ${client.ico}${client.dic ? ` | DIČ: ${client.dic}` : ''}</p>` : ''}
        ${client?.billingStreet ? `<p style="font-size:13px;color:#666;margin-top:2px;">${client.billingStreet}, ${client.billingCity} ${client.billingZip}</p>` : ''}
        ${client?.email ? `<p style="font-size:13px;color:#666;margin-top:2px;">${client.email}</p>` : ''}
      </div>
      <div style="width:200px;">
        <div style="margin-bottom:12px;">
          <p style="font-size:11px;color:#999;text-transform:uppercase;">Datum vystavení</p>
          <p style="font-weight:600;color:#0B1126;">${formatDate(invoice.issueDate)}</p>
        </div>
        <div style="margin-bottom:12px;">
          <p style="font-size:11px;color:#999;text-transform:uppercase;">Datum splatnosti</p>
          <p style="font-weight:600;color:#0B1126;">${formatDate(invoice.dueDate)}</p>
        </div>
        <div>
          <p style="font-size:11px;color:#999;text-transform:uppercase;">Stav</p>
          <p style="font-weight:600;color:${invoice.status === 'paid' ? '#22c55e' : '#D4AF37'};">${invoice.status.toUpperCase()}</p>
        </div>
      </div>
    </div>

    <!-- Items table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="background:#0B1126;">
          <th style="padding:12px;text-align:left;color:#D4AF37;font-size:12px;font-weight:600;width:40px;">#</th>
          <th style="padding:12px;text-align:left;color:#D4AF37;font-size:12px;font-weight:600;">Položka</th>
          <th style="padding:12px;text-align:right;color:#D4AF37;font-size:12px;font-weight:600;width:60px;">Množství</th>
          <th style="padding:12px;text-align:right;color:#D4AF37;font-size:12px;font-weight:600;width:100px;">Cena/ks</th>
          <th style="padding:12px;text-align:right;color:#D4AF37;font-size:12px;font-weight:600;width:60px;">DPH</th>
          <th style="padding:12px;text-align:right;color:#D4AF37;font-size:12px;font-weight:600;width:120px;">Celkem</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex;justify-content:flex-end;">
      <div style="width:280px;">
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;">
          <span style="color:#666;">Základ</span>
          <span style="font-weight:500;">${formatCZK(invoice.subtotal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;">
          <span style="color:#666;">DPH</span>
          <span style="font-weight:500;">${formatCZK(invoice.vatTotal)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:12px 0;border-top:2px solid #0B1126;margin-top:8px;">
          <span style="font-weight:700;font-size:16px;color:#0B1126;">CELKEM</span>
          <span style="font-weight:700;font-size:20px;color:#D4AF37;">${formatCZK(invoice.total)}</span>
        </div>
      </div>
    </div>

    ${invoice.notes ? `
    <div style="margin-top:32px;padding:16px;background:#fefce8;border-radius:8px;border-left:4px solid #D4AF37;">
      <p style="font-size:12px;color:#999;margin-bottom:4px;">Poznámky</p>
      <p style="font-size:13px;color:#333;">${invoice.notes}</p>
    </div>` : ''}

    <!-- Footer -->
    <div style="margin-top:48px;padding-top:20px;border-top:1px solid #eee;text-align:center;">
      <p style="font-size:11px;color:#999;">Tento doklad byl vygenerován systémem CRMQ | www.crmq.cz</p>
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">🖨️ Tisknout / Uložit PDF</button>
</body>
</html>`;
}

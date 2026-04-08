"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceRoutes = createInvoiceRoutes;
const express_1 = require("express");
const uuid_1 = require("uuid");
const auth_js_1 = require("../middleware/auth.js");
const TYPE_PREFIXES = {
    quote: 'CN', advance: 'ZF', invoice: 'FA',
};
function generateInvoiceNumber(type) {
    const prefix = TYPE_PREFIXES[type] || 'FA';
    const year = new Date().getFullYear();
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    return `${prefix}-${year}-${seq}`;
}
function createInvoiceRoutes(repos) {
    const router = (0, express_1.Router)();
    router.use(auth_js_1.authenticate);
    router.get('/', (0, auth_js_1.authorize)('invoices:read'), async (req, res) => {
        try {
            const invoices = await repos.invoices.findAll({
                clientId: req.query.clientId,
                projectId: req.query.projectId,
                type: req.query.type,
                status: req.query.status,
            });
            res.json({ success: true, data: invoices });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.get('/:id', (0, auth_js_1.authorize)('invoices:read'), async (req, res) => {
        try {
            const invoice = await repos.invoices.findById(req.params.id);
            if (!invoice) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            const client = invoice.clientId ? await repos.clients.findById(invoice.clientId) : null;
            const project = invoice.projectId ? await repos.projects.findById(invoice.projectId) : null;
            res.json({ success: true, data: { ...invoice, client, project } });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.post('/', (0, auth_js_1.authorize)('invoices:write', 'invoices:create'), async (req, res) => {
        try {
            const { items = [], ...rest } = req.body;
            const processedItems = items.map((item) => ({
                id: (0, uuid_1.v4)(),
                invoiceId: '',
                description: item.description || '',
                quantity: Number(item.quantity) || 1,
                unitPrice: Number(item.unitPrice) || 0,
                vatRate: Number(item.vatRate) ?? 21,
                totalPrice: Math.round((Number(item.quantity) || 1) * (Number(item.unitPrice) || 0) * (1 + (Number(item.vatRate) ?? 21) / 100)),
            }));
            const subtotal = processedItems.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
            const vatTotal = processedItems.reduce((s, i) => s + (i.totalPrice - i.quantity * i.unitPrice), 0);
            const total = processedItems.reduce((s, i) => s + i.totalPrice, 0);
            const invoice = await repos.invoices.create({
                ...rest,
                invoiceNumber: rest.invoiceNumber || generateInvoiceNumber(rest.type),
                items: processedItems,
                subtotal: Math.round(subtotal),
                vatTotal: Math.round(vatTotal),
                total: Math.round(total),
                status: rest.status || 'draft',
                currency: rest.currency || 'CZK',
                issueDate: rest.issueDate || new Date().toISOString(),
                dueDate: rest.dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
            });
            res.status(201).json({ success: true, data: invoice });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.patch('/:id', (0, auth_js_1.authorize)('invoices:write'), async (req, res) => {
        try {
            const invoice = await repos.invoices.update(req.params.id, req.body);
            if (!invoice) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, data: invoice });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    // Mark as sent (prepare for email)
    router.post('/:id/send', (0, auth_js_1.authorize)('invoices:write'), async (req, res) => {
        try {
            const invoice = await repos.invoices.findById(req.params.id);
            if (!invoice) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            const client = await repos.clients.findById(invoice.clientId);
            const updated = await repos.invoices.update(req.params.id, { status: 'sent' });
            // TODO: When SMTP is configured, send email here
            // For now, just mark as sent and return email preview
            res.json({
                success: true,
                data: updated,
                emailPreview: {
                    to: client?.email || '',
                    subject: `Doklad ${invoice.invoiceNumber} - QAPI s.r.o.`,
                    body: `Dobrý den,\n\nv příloze zasíláme doklad č. ${invoice.invoiceNumber} na částku ${new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(invoice.total)}.\n\nDatum splatnosti: ${new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}\n\nS pozdravem,\nQAPI s.r.o.`,
                    pdfUrl: `/api/pdf/invoice/${invoice.id}`,
                },
                message: 'Doklad označen jako odeslaný',
            });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.delete('/:id', (0, auth_js_1.authorize)('invoices:write'), async (req, res) => {
        try {
            const ok = await repos.invoices.delete(req.params.id);
            if (!ok) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, message: 'Doklad smazán' });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    return router;
}
//# sourceMappingURL=invoices.routes.js.map
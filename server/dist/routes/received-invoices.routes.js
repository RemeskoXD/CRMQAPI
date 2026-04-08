"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReceivedInvoiceRoutes = createReceivedInvoiceRoutes;
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
function createReceivedInvoiceRoutes(repos) {
    const router = (0, express_1.Router)();
    router.use(auth_js_1.authenticate);
    router.get('/', (0, auth_js_1.authorize)('invoices:read'), async (req, res) => {
        try {
            const invoices = await repos.receivedInvoices.findAll({
                status: req.query.status,
                projectId: req.query.projectId,
            });
            res.json({ success: true, data: invoices });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.get('/:id', (0, auth_js_1.authorize)('invoices:read'), async (req, res) => {
        try {
            const inv = await repos.receivedInvoices.findById(req.params.id);
            if (!inv) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, data: inv });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.post('/', (0, auth_js_1.authorize)('invoices:write'), async (req, res) => {
        try {
            const inv = await repos.receivedInvoices.create(req.body);
            res.status(201).json({ success: true, data: inv });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    // OCR endpoint - simulated AI extraction
    router.post('/ocr', (0, auth_js_1.authorize)('invoices:write'), async (req, res) => {
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
        }
        catch {
            res.status(500).json({ success: false, error: 'OCR extrakce selhala' });
        }
    });
    router.patch('/:id', (0, auth_js_1.authorize)('invoices:write'), async (req, res) => {
        try {
            const inv = await repos.receivedInvoices.update(req.params.id, req.body);
            if (!inv) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, data: inv });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    return router;
}
function extractField(text, regex) {
    const match = text?.match(regex);
    return match?.[1]?.trim();
}
//# sourceMappingURL=received-invoices.routes.js.map
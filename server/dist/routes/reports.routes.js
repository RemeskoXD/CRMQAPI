"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReportRoutes = createReportRoutes;
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
function createReportRoutes(repos) {
    const router = (0, express_1.Router)();
    router.use(auth_js_1.authenticate);
    router.use((0, auth_js_1.authorize)('reports:read', 'dashboard:read'));
    // Main analytics data
    router.get('/overview', async (_req, res) => {
        try {
            const [clients, projects, tasks, invoices, inventory, receivedInvoices] = await Promise.all([
                repos.clients.findAll(),
                repos.projects.findAll(),
                repos.tasks.findAll(),
                repos.invoices.findAll(),
                repos.inventory.findAll(),
                repos.receivedInvoices.findAll(),
            ]);
            const now = new Date();
            const thisMonth = now.toISOString().slice(0, 7);
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);
            // Revenue stats
            const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
            const pendingRevenue = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0);
            const overdueRevenue = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0);
            const totalExpenses = receivedInvoices.reduce((s, i) => s + i.total, 0);
            const paidExpenses = receivedInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
            // Project stats
            const projectsByStatus = {};
            const projectsByType = {};
            const revenueByType = {};
            projects.forEach(p => {
                projectsByStatus[p.status] = (projectsByStatus[p.status] || 0) + 1;
                projectsByType[p.type] = (projectsByType[p.type] || 0) + 1;
                if (p.totalPrice)
                    revenueByType[p.type] = (revenueByType[p.type] || 0) + p.totalPrice;
            });
            // Marketing source analysis
            const clientsBySource = {};
            const revenueBySource = {};
            clients.forEach(c => {
                const src = c.marketingSource || 'Neznámý';
                clientsBySource[src] = (clientsBySource[src] || 0) + 1;
            });
            // Match projects to client sources for revenue attribution
            projects.forEach(p => {
                const client = clients.find(c => c.id === p.clientId);
                const src = client?.marketingSource || 'Neznámý';
                if (p.totalPrice)
                    revenueBySource[src] = (revenueBySource[src] || 0) + p.totalPrice;
            });
            // Task stats
            const tasksDone = tasks.filter(t => t.status === 'done').length;
            const tasksOpen = tasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length;
            const tasksOverdue = tasks.filter(t => {
                if (t.status === 'done' || t.status === 'cancelled')
                    return false;
                if (!t.dueDate)
                    return false;
                return new Date(t.dueDate) < now;
            }).length;
            // Invoice type breakdown
            const invoicesByType = {};
            invoices.forEach(i => {
                if (!invoicesByType[i.type])
                    invoicesByType[i.type] = { count: 0, total: 0 };
                invoicesByType[i.type].count++;
                invoicesByType[i.type].total += i.total;
            });
            // Inventory value
            const inventoryValue = inventory.reduce((s, i) => s + i.stockQuantity * i.pricePerUnit, 0);
            const lowStockItems = inventory.filter(i => i.stockQuantity <= i.minStockLevel);
            // Conversion rate (new_inquiry -> done/invoiced)
            const totalInquiries = projects.length;
            const converted = projects.filter(p => ['done', 'invoiced'].includes(p.status)).length;
            const conversionRate = totalInquiries > 0 ? Math.round((converted / totalInquiries) * 100) : 0;
            // Average project value
            const projectsWithPrice = projects.filter(p => p.totalPrice);
            const avgProjectValue = projectsWithPrice.length > 0
                ? Math.round(projectsWithPrice.reduce((s, p) => s + (p.totalPrice || 0), 0) / projectsWithPrice.length)
                : 0;
            res.json({
                success: true,
                data: {
                    kpi: {
                        totalRevenue, pendingRevenue, overdueRevenue,
                        totalExpenses, paidExpenses,
                        profit: totalRevenue - paidExpenses,
                        totalClients: clients.length,
                        totalProjects: projects.length,
                        activeProjects: projects.filter(p => !['done', 'invoiced'].includes(p.status)).length,
                        conversionRate,
                        avgProjectValue,
                        tasksDone, tasksOpen, tasksOverdue,
                        inventoryValue,
                        lowStockCount: lowStockItems.length,
                    },
                    charts: {
                        projectsByStatus,
                        projectsByType,
                        revenueByType,
                        clientsBySource,
                        revenueBySource,
                        invoicesByType,
                    },
                    tables: {
                        topClients: getTopClients(clients, projects, 10),
                        recentProjects: projects.slice(-10).reverse(),
                        overdueInvoices: invoices.filter(i => i.status === 'overdue'),
                        lowStockItems,
                    },
                },
            });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    // Export endpoints
    router.get('/export/:entity', async (req, res) => {
        try {
            const { entity } = req.params;
            const format = req.query.format || 'csv';
            let data = [];
            let headers = [];
            switch (entity) {
                case 'clients': {
                    data = await repos.clients.findAll();
                    headers = ['Typ', 'Název/Jméno', 'IČO', 'DIČ', 'Email', 'Telefon', 'Město', 'Zdroj', 'Vytvořeno'];
                    data = data.map(c => ({
                        Typ: c.type === 'company' ? 'Firma' : 'Osoba',
                        'Název/Jméno': c.companyName || `${c.firstName} ${c.lastName}`,
                        IČO: c.ico || '', DIČ: c.dic || '',
                        Email: c.email || '', Telefon: c.phone || '',
                        Město: c.billingCity || '', Zdroj: c.marketingSource || '',
                        Vytvořeno: new Date(c.createdAt).toLocaleDateString('cs-CZ'),
                    }));
                    break;
                }
                case 'projects': {
                    data = await repos.projects.findAll();
                    const allClients = await repos.clients.findAll();
                    headers = ['Název', 'Klient', 'Typ', 'Stav', 'Cena', 'Termín', 'Vytvořeno'];
                    const typeLabels = { garage_doors: 'Vrata', windows: 'Okna', shading: 'Stínění' };
                    const statusLabels = { new_inquiry: 'Poptávka', site_visit: 'Obhlídka', pricing: 'Nacenění', waiting_material: 'Materiál', in_progress: 'Montáž', done: 'Hotovo', invoiced: 'Fakturováno' };
                    data = data.map(p => {
                        const cl = allClients.find(c => c.id === p.clientId);
                        return {
                            Název: p.title,
                            Klient: cl ? (cl.companyName || `${cl.firstName} ${cl.lastName}`) : '',
                            Typ: typeLabels[p.type] || p.type,
                            Stav: statusLabels[p.status] || p.status,
                            Cena: p.totalPrice || 0,
                            Termín: p.deadline ? new Date(p.deadline).toLocaleDateString('cs-CZ') : '',
                            Vytvořeno: new Date(p.createdAt).toLocaleDateString('cs-CZ'),
                        };
                    });
                    break;
                }
                case 'invoices': {
                    data = await repos.invoices.findAll();
                    headers = ['Číslo', 'Typ', 'Klient', 'Stav', 'Základ', 'DPH', 'Celkem', 'Vystaveno', 'Splatnost'];
                    const typeL = { quote: 'Nabídka', advance: 'Záloha', invoice: 'Faktura' };
                    const allCl = await repos.clients.findAll();
                    data = data.map(i => {
                        const cl = allCl.find(c => c.id === i.clientId);
                        return {
                            Číslo: i.invoiceNumber, Typ: typeL[i.type] || i.type,
                            Klient: cl ? (cl.companyName || `${cl.firstName} ${cl.lastName}`) : '',
                            Stav: i.status, Základ: i.subtotal, DPH: i.vatTotal, Celkem: i.total,
                            Vystaveno: new Date(i.issueDate).toLocaleDateString('cs-CZ'),
                            Splatnost: new Date(i.dueDate).toLocaleDateString('cs-CZ'),
                        };
                    });
                    break;
                }
                case 'tasks': {
                    data = await repos.tasks.findAll();
                    const allUsers = await repos.users.findAll();
                    headers = ['Úkol', 'Přiřazeno', 'Stav', 'Priorita', 'Termín'];
                    data = data.map(t => {
                        const u = allUsers.find(u => u.id === t.assignedUserId);
                        return {
                            Úkol: t.title,
                            Přiřazeno: u ? `${u.firstName} ${u.lastName}` : '',
                            Stav: t.status, Priorita: t.priority,
                            Termín: t.dueDate ? new Date(t.dueDate).toLocaleDateString('cs-CZ') : '',
                        };
                    });
                    break;
                }
                case 'inventory': {
                    data = await repos.inventory.findAll();
                    headers = ['SKU', 'Název', 'Kategorie', 'Skladem', 'Jednotka', 'Cena/ks', 'Hodnota'];
                    data = data.map(i => ({
                        SKU: i.sku, Název: i.name,
                        Kategorie: i.category, Skladem: i.stockQuantity,
                        Jednotka: i.unit, 'Cena/ks': i.pricePerUnit,
                        Hodnota: i.stockQuantity * i.pricePerUnit,
                    }));
                    break;
                }
                default:
                    res.status(400).json({ success: false, error: 'Neznámá entita' });
                    return;
            }
            if (format === 'csv') {
                const csvHeaders = headers.join(';');
                const csvRows = data.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(';'));
                const csv = '\uFEFF' + csvHeaders + '\n' + csvRows.join('\n');
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename="${entity}-export.csv"`);
                res.send(csv);
            }
            else if (format === 'xml') {
                const xmlRows = data.map(row => {
                    const fields = headers.map(h => `    <${sanitizeXml(h)}>${escapeXml(String(row[h] ?? ''))}</${sanitizeXml(h)}>`).join('\n');
                    return `  <row>\n${fields}\n  </row>`;
                }).join('\n');
                const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<export entity="${entity}" date="${new Date().toISOString()}">\n${xmlRows}\n</export>`;
                res.setHeader('Content-Type', 'application/xml; charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename="${entity}-export.xml"`);
                res.send(xml);
            }
            else {
                const htmlRows = data.map(row => `<tr>${headers.map(h => `<td style="padding:6px 10px;border:1px solid #ddd;">${String(row[h] ?? '')}</td>`).join('')}</tr>`).join('');
                const html = `<!DOCTYPE html><html lang="cs"><head><meta charset="UTF-8"><title>Export ${entity}</title>
          <style>body{font-family:Inter,sans-serif;padding:20px}table{border-collapse:collapse;width:100%}
          th{background:#0B1126;color:#D4AF37;padding:8px 10px;text-align:left;font-size:12px}
          td{font-size:13px}tr:nth-child(even){background:#f9f9f9}
          h1{color:#0B1126;font-size:18px}p{color:#999;font-size:12px}</style></head>
          <body><h1>Export: ${entity}</h1><p>Vygenerováno: ${new Date().toLocaleString('cs-CZ')} | CRMQ</p>
          <table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${htmlRows}</tbody></table></body></html>`;
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename="${entity}-export.html"`);
                res.send(html);
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ success: false, error: 'Chyba exportu' });
        }
    });
    return router;
}
function getTopClients(clients, projects, limit) {
    const map = {};
    clients.forEach(c => {
        const name = c.companyName || `${c.firstName} ${c.lastName}`;
        map[c.id] = { name, projects: 0, revenue: 0 };
    });
    projects.forEach(p => {
        if (map[p.clientId]) {
            map[p.clientId].projects++;
            map[p.clientId].revenue += p.totalPrice || 0;
        }
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}
function sanitizeXml(s) { return s.replace(/[^a-zA-Z0-9_]/g, '_'); }
function escapeXml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
//# sourceMappingURL=reports.routes.js.map
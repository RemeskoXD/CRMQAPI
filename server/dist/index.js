"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const index_js_1 = require("./repositories/index.js");
const auth_routes_js_1 = require("./routes/auth.routes.js");
const users_routes_js_1 = require("./routes/users.routes.js");
const clients_routes_js_1 = require("./routes/clients.routes.js");
const locations_routes_js_1 = require("./routes/locations.routes.js");
const projects_routes_js_1 = require("./routes/projects.routes.js");
const tasks_routes_js_1 = require("./routes/tasks.routes.js");
const invoices_routes_js_1 = require("./routes/invoices.routes.js");
const inventory_routes_js_1 = require("./routes/inventory.routes.js");
const calendar_routes_js_1 = require("./routes/calendar.routes.js");
const dashboard_routes_js_1 = require("./routes/dashboard.routes.js");
const pdf_routes_js_1 = require("./routes/pdf.routes.js");
const notes_routes_js_1 = require("./routes/notes.routes.js");
const activity_routes_js_1 = require("./routes/activity.routes.js");
const materials_routes_js_1 = require("./routes/materials.routes.js");
const received_invoices_routes_js_1 = require("./routes/received-invoices.routes.js");
const quicknotes_routes_js_1 = require("./routes/quicknotes.routes.js");
const reports_routes_js_1 = require("./routes/reports.routes.js");
const profile_routes_js_1 = require("./routes/profile.routes.js");
const warehouse_routes_js_1 = require("./routes/warehouse.routes.js");
const leads_routes_js_1 = require("./routes/leads.routes.js");
const desktop_routes_js_1 = require("./routes/desktop.routes.js");
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3001', 10);
app.use((0, cors_1.default)({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
const repos = (0, index_js_1.createRepositories)();
app.use('/api/auth', (0, auth_routes_js_1.createAuthRoutes)(repos));
app.use('/api/users', (0, users_routes_js_1.createUserRoutes)(repos));
app.use('/api/clients', (0, clients_routes_js_1.createClientRoutes)(repos));
app.use('/api/locations', (0, locations_routes_js_1.createLocationRoutes)(repos));
app.use('/api/projects', (0, projects_routes_js_1.createProjectRoutes)(repos));
app.use('/api/tasks', (0, tasks_routes_js_1.createTaskRoutes)(repos));
app.use('/api/invoices', (0, invoices_routes_js_1.createInvoiceRoutes)(repos));
app.use('/api/inventory', (0, inventory_routes_js_1.createInventoryRoutes)(repos));
app.use('/api/calendar', (0, calendar_routes_js_1.createCalendarRoutes)(repos));
app.use('/api/dashboard', (0, dashboard_routes_js_1.createDashboardRoutes)(repos));
app.use('/api/pdf', (0, pdf_routes_js_1.createPdfRoutes)(repos));
app.use('/api/notes', (0, notes_routes_js_1.createNoteRoutes)(repos));
app.use('/api/activity', (0, activity_routes_js_1.createActivityRoutes)(repos));
app.use('/api/materials', (0, materials_routes_js_1.createMaterialRoutes)(repos));
app.use('/api/received-invoices', (0, received_invoices_routes_js_1.createReceivedInvoiceRoutes)(repos));
app.use('/api/quicknotes', (0, quicknotes_routes_js_1.createQuickNoteRoutes)(repos));
app.use('/api/reports', (0, reports_routes_js_1.createReportRoutes)(repos));
app.use('/api/profile', (0, profile_routes_js_1.createProfileRoutes)(repos));
app.use('/api/warehouses', (0, warehouse_routes_js_1.createWarehouseRoutes)(repos));
app.use('/api/leads', (0, leads_routes_js_1.createLeadRoutes)(repos));
app.use('/api/desktop', (0, desktop_routes_js_1.createDesktopRoutes)(repos));
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
    const clientDist = path_1.default.resolve(process.cwd(), 'client', 'dist');
    app.use(express_1.default.static(clientDist));
    app.get('*', (_req, res) => {
        res.sendFile(path_1.default.join(clientDist, 'index.html'));
    });
}
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CRMQ API server running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});
//# sourceMappingURL=index.js.map
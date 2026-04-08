import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRepositories } from './repositories/index.js';
import { createAuthRoutes } from './routes/auth.routes.js';
import { createUserRoutes } from './routes/users.routes.js';
import { createClientRoutes } from './routes/clients.routes.js';
import { createLocationRoutes } from './routes/locations.routes.js';
import { createProjectRoutes } from './routes/projects.routes.js';
import { createTaskRoutes } from './routes/tasks.routes.js';
import { createInvoiceRoutes } from './routes/invoices.routes.js';
import { createInventoryRoutes } from './routes/inventory.routes.js';
import { createCalendarRoutes } from './routes/calendar.routes.js';
import { createDashboardRoutes } from './routes/dashboard.routes.js';
import { createPdfRoutes } from './routes/pdf.routes.js';
import { createNoteRoutes } from './routes/notes.routes.js';
import { createActivityRoutes } from './routes/activity.routes.js';
import { createMaterialRoutes } from './routes/materials.routes.js';
import { createReceivedInvoiceRoutes } from './routes/received-invoices.routes.js';
import { createQuickNoteRoutes } from './routes/quicknotes.routes.js';
import { createReportRoutes } from './routes/reports.routes.js';
import { createProfileRoutes } from './routes/profile.routes.js';
import { createWarehouseRoutes } from './routes/warehouse.routes.js';
import { createLeadRoutes } from './routes/leads.routes.js';
import { createDesktopRoutes } from './routes/desktop.routes.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));

const repos = createRepositories();

app.use('/api/auth', createAuthRoutes(repos));
app.use('/api/users', createUserRoutes(repos));
app.use('/api/clients', createClientRoutes(repos));
app.use('/api/locations', createLocationRoutes(repos));
app.use('/api/projects', createProjectRoutes(repos));
app.use('/api/tasks', createTaskRoutes(repos));
app.use('/api/invoices', createInvoiceRoutes(repos));
app.use('/api/inventory', createInventoryRoutes(repos));
app.use('/api/calendar', createCalendarRoutes(repos));
app.use('/api/dashboard', createDashboardRoutes(repos));
app.use('/api/pdf', createPdfRoutes(repos));
app.use('/api/notes', createNoteRoutes(repos));
app.use('/api/activity', createActivityRoutes(repos));
app.use('/api/materials', createMaterialRoutes(repos));
app.use('/api/received-invoices', createReceivedInvoiceRoutes(repos));
app.use('/api/quicknotes', createQuickNoteRoutes(repos));
app.use('/api/reports', createReportRoutes(repos));
app.use('/api/profile', createProfileRoutes(repos));
app.use('/api/warehouses', createWarehouseRoutes(repos));
app.use('/api/leads', createLeadRoutes(repos));
app.use('/api/desktop', createDesktopRoutes(repos));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend - try multiple paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import('fs').then(fs => {
  const candidates = [
    path.resolve(__dirname, '..', '..', 'client', 'dist'),
    path.resolve(process.cwd(), 'client', 'dist'),
    path.resolve(process.cwd(), '..', 'client', 'dist'),
    path.resolve('/app', 'client', 'dist'),
  ];

  for (const dir of candidates) {
    if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))) {
      console.log(`📁 Serving frontend from: ${dir}`);
      app.use(express.static(dir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(dir, 'index.html'));
      });
      break;
    } else {
      console.log(`📁 Not found: ${dir}`);
    }
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CRMQ API server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📁 CWD: ${process.cwd()}, __dirname: ${__dirname}`);
});

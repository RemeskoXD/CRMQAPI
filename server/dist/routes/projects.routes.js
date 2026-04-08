"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProjectRoutes = createProjectRoutes;
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
function createProjectRoutes(repos) {
    const router = (0, express_1.Router)();
    router.use(auth_js_1.authenticate);
    router.get('/', (0, auth_js_1.authorize)('projects:read', 'projects:read_assigned'), async (req, res) => {
        try {
            const filters = {};
            if (req.query.status)
                filters.status = req.query.status;
            if (req.query.type)
                filters.type = req.query.type;
            if (req.query.clientId)
                filters.clientId = req.query.clientId;
            if (req.user.role === 'technician') {
                filters.assignedTechnicianId = req.user.userId;
            }
            const projects = await repos.projects.findAll(filters);
            res.json({ success: true, data: projects });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.get('/:id', (0, auth_js_1.authorize)('projects:read', 'projects:read_assigned'), async (req, res) => {
        try {
            const project = await repos.projects.findById(req.params.id);
            if (!project) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            if (req.user.role === 'technician' && project.assignedTechnicianId !== req.user.userId) {
                res.status(403).json({ success: false, error: 'Přístup zamítnut' });
                return;
            }
            const [tasks, invoices, client, location, materials, notes] = await Promise.all([
                repos.tasks.findAll({ projectId: req.params.id }),
                repos.invoices.findAll({ projectId: req.params.id }),
                project.clientId ? repos.clients.findById(project.clientId) : null,
                project.locationId ? repos.locations.findById(project.locationId) : null,
                repos.materials.findByProject(req.params.id),
                repos.notes.findByEntity('project', req.params.id),
            ]);
            res.json({ success: true, data: { ...project, tasks, invoices, client, location, materials, notes } });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.post('/', (0, auth_js_1.authorize)('projects:write', 'projects:create'), async (req, res) => {
        try {
            const project = await repos.projects.create(req.body);
            res.status(201).json({ success: true, data: project });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.patch('/:id', (0, auth_js_1.authorize)('projects:write'), async (req, res) => {
        try {
            const project = await repos.projects.update(req.params.id, req.body);
            if (!project) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, data: project });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    router.delete('/:id', (0, auth_js_1.authorize)('projects:write'), async (req, res) => {
        try {
            const ok = await repos.projects.delete(req.params.id);
            if (!ok) {
                res.status(404).json({ success: false, error: 'Nenalezeno' });
                return;
            }
            res.json({ success: true, message: 'Zakázka smazána' });
        }
        catch {
            res.status(500).json({ success: false, error: 'Chyba serveru' });
        }
    });
    return router;
}
//# sourceMappingURL=projects.routes.js.map
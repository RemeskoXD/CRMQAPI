import { Router } from 'express';
import type { Repositories } from '../repositories/index.js';
import { authenticate } from '../middleware/auth.js';

export function createDashboardRoutes(repos: Repositories): Router {
  const router = Router();
  router.use(authenticate);

  router.get('/', async (req, res) => {
    try {
      const role = req.user!.role;
      const userId = req.user!.userId;

      const [allProjects, allTasks, allInvoices, allClients] = await Promise.all([
        repos.projects.findAll(),
        repos.tasks.findAll(),
        repos.invoices.findAll(),
        repos.clients.findAll(),
      ]);

      const stats: Record<string, any> = {};

      if (role === 'root' || role === 'team_leader' || role === 'analyst') {
        stats.totalClients = allClients.length;
        stats.totalProjects = allProjects.length;
        stats.activeProjects = allProjects.filter(p => !['done', 'invoiced'].includes(p.status)).length;
        stats.totalRevenue = allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
        stats.pendingInvoices = allInvoices.filter(i => i.status === 'sent').length;
        stats.overdueInvoices = allInvoices.filter(i => i.status === 'overdue').length;
        stats.openTasks = allTasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length;

        stats.projectsByStatus = {
          new_inquiry: allProjects.filter(p => p.status === 'new_inquiry').length,
          site_visit: allProjects.filter(p => p.status === 'site_visit').length,
          pricing: allProjects.filter(p => p.status === 'pricing').length,
          waiting_material: allProjects.filter(p => p.status === 'waiting_material').length,
          in_progress: allProjects.filter(p => p.status === 'in_progress').length,
          done: allProjects.filter(p => p.status === 'done').length,
          invoiced: allProjects.filter(p => p.status === 'invoiced').length,
        };

        stats.recentProjects = allProjects.slice(0, 5);
        stats.upcomingTasks = allTasks
          .filter(t => t.status !== 'done' && t.status !== 'cancelled')
          .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
          .slice(0, 5);
      }

      if (role === 'sales_rep') {
        const myProjects = allProjects.filter(p => p.assignedSalesId === userId);
        const myTasks = allTasks.filter(t => t.assignedUserId === userId);
        stats.myProjects = myProjects.length;
        stats.myActiveProjects = myProjects.filter(p => !['done', 'invoiced'].includes(p.status)).length;
        stats.myOpenTasks = myTasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length;
        stats.recentProjects = myProjects.slice(0, 5);
        stats.upcomingTasks = myTasks
          .filter(t => t.status !== 'done')
          .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
          .slice(0, 5);
      }

      if (role === 'technician') {
        const myTasks = allTasks.filter(t => t.assignedUserId === userId);
        const todayStr = new Date().toISOString().slice(0, 10);
        stats.todayTasks = myTasks.filter(t =>
          t.dueDate?.startsWith(todayStr) && t.status !== 'done' && t.status !== 'cancelled'
        );
        stats.upcomingTasks = myTasks
          .filter(t => t.status !== 'done' && t.status !== 'cancelled')
          .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
          .slice(0, 10);
        stats.completedToday = myTasks.filter(t =>
          t.completedAt?.startsWith(todayStr)
        ).length;

        // Enrich today tasks with project details (address, client contact, materials)
        const myProjects = allProjects.filter(p => p.assignedTechnicianId === userId);
        const enrichedTodayTasks = [];
        for (const task of stats.todayTasks) {
          const project = task.projectId ? myProjects.find(p => p.id === task.projectId) : null;
          let client = null;
          let location = null;
          let materials: any[] = [];
          if (project) {
            client = project.clientId ? await repos.clients.findById(project.clientId) : null;
            location = project.locationId ? await repos.locations.findById(project.locationId) : null;
            materials = await repos.materials.findByProject(project.id);
          }
          enrichedTodayTasks.push({ ...task, project, client, location, materials });
        }
        stats.todayTasks = enrichedTodayTasks;

        // "Individuál" - upcoming with project info
        const enrichedUpcoming = [];
        for (const task of stats.upcomingTasks.slice(0, 10)) {
          const project = task.projectId ? allProjects.find(p => p.id === task.projectId) : null;
          let location = null;
          if (project?.locationId) {
            location = await repos.locations.findById(project.locationId);
          }
          enrichedUpcoming.push({ ...task, project, location });
        }
        stats.upcomingTasks = enrichedUpcoming;
      }

      if (role === 'accountant') {
        stats.totalInvoices = allInvoices.length;
        stats.paidTotal = allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
        stats.pendingTotal = allInvoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.total, 0);
        stats.overdueTotal = allInvoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0);
        stats.recentInvoices = allInvoices.slice(0, 10);
      }

      if (role === 'infoline') {
        stats.totalClients = allClients.length;
        stats.newInquiries = allProjects.filter(p => p.status === 'new_inquiry').length;
        stats.recentClients = allClients.slice(0, 5);
        stats.openTasks = allTasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length;
      }

      // Activity feed + quick notes for all roles
      const [activityFeed, quickNotes] = await Promise.all([
        repos.activity.findAll({ limit: 15 }),
        repos.quickNotes.findByUser(userId),
      ]);
      stats.activityFeed = activityFeed;
      stats.quickNotes = quickNotes;

      res.json({ success: true, data: stats });
    } catch {
      res.status(500).json({ success: false, error: 'Chyba serveru' });
    }
  });

  return router;
}

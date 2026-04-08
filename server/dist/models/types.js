"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = void 0;
// Permission map
exports.ROLE_PERMISSIONS = {
    root: ['*'],
    admin: ['*'],
    team_leader: [
        'dashboard:read',
        'clients:read', 'clients:write',
        'projects:read', 'projects:write',
        'tasks:read', 'tasks:write', 'tasks:approve',
        'calendar:read', 'calendar:write',
        'invoices:read',
        'inventory:read',
        'users:read',
    ],
    sales_rep: [
        'dashboard:read',
        'clients:read', 'clients:write',
        'projects:read', 'projects:write',
        'tasks:read', 'tasks:write',
        'calendar:read', 'calendar:write',
        'invoices:read', 'invoices:create',
    ],
    technician: [
        'dashboard:read',
        'tasks:read', 'tasks:update_own',
        'projects:read_assigned',
        'calendar:read_own',
    ],
    analyst: [
        'dashboard:read',
        'clients:read',
        'projects:read',
        'tasks:read',
        'invoices:read',
        'reports:read', 'reports:export',
        'inventory:read',
    ],
    infoline: [
        'dashboard:read',
        'clients:read', 'clients:write',
        'projects:create',
        'tasks:read', 'tasks:write',
        'calendar:read',
    ],
    accountant: [
        'dashboard:read',
        'invoices:read', 'invoices:write', 'invoices:export',
        'clients:read',
        'projects:read',
    ],
};
//# sourceMappingURL=types.js.map
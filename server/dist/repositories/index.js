"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRepositories = createRepositories;
const user_repository_js_1 = require("./mock/user.repository.js");
const client_repository_js_1 = require("./mock/client.repository.js");
const location_repository_js_1 = require("./mock/location.repository.js");
const project_repository_js_1 = require("./mock/project.repository.js");
const task_repository_js_1 = require("./mock/task.repository.js");
const invoice_repository_js_1 = require("./mock/invoice.repository.js");
const inventory_repository_js_1 = require("./mock/inventory.repository.js");
const calendar_repository_js_1 = require("./mock/calendar.repository.js");
const notes_repository_js_1 = require("./mock/notes.repository.js");
const activity_repository_js_1 = require("./mock/activity.repository.js");
const material_repository_js_1 = require("./mock/material.repository.js");
const received_invoice_repository_js_1 = require("./mock/received-invoice.repository.js");
const quicknote_repository_js_1 = require("./mock/quicknote.repository.js");
const warehouse_repository_js_1 = require("./mock/warehouse.repository.js");
const lead_repository_js_1 = require("./mock/lead.repository.js");
const desktop_repository_js_1 = require("./mock/desktop.repository.js");
function createRepositories() {
    return {
        users: new user_repository_js_1.MockUserRepository(),
        clients: new client_repository_js_1.MockClientRepository(),
        locations: new location_repository_js_1.MockLocationRepository(),
        projects: new project_repository_js_1.MockProjectRepository(),
        tasks: new task_repository_js_1.MockTaskRepository(),
        invoices: new invoice_repository_js_1.MockInvoiceRepository(),
        inventory: new inventory_repository_js_1.MockInventoryRepository(),
        calendarEvents: new calendar_repository_js_1.MockCalendarEventRepository(),
        notes: new notes_repository_js_1.MockNoteRepository(),
        activity: new activity_repository_js_1.MockActivityRepository(),
        materials: new material_repository_js_1.MockMaterialRepository(),
        receivedInvoices: new received_invoice_repository_js_1.MockReceivedInvoiceRepository(),
        quickNotes: new quicknote_repository_js_1.MockQuickNoteRepository(),
        warehouses: new warehouse_repository_js_1.MockWarehouseRepository(),
        leads: new lead_repository_js_1.MockLeadRepository(),
        desktop: new desktop_repository_js_1.MockDesktopRepository(),
    };
}
//# sourceMappingURL=index.js.map
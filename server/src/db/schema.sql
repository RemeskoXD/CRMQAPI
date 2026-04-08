-- CRMQ Database Schema for PostgreSQL
-- Run: psql -U postgres -d crmq -f schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS
-- ============================================
CREATE TYPE user_role AS ENUM (
  'root', 'team_leader', 'sales_rep', 'technician',
  'analyst', 'infoline', 'accountant'
);

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role NOT NULL DEFAULT 'technician',
  phone         VARCHAR(30),
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- CLIENTS
-- ============================================
CREATE TYPE client_type AS ENUM ('company', 'individual');

CREATE TABLE clients (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type              client_type NOT NULL,
  company_name      VARCHAR(255),
  first_name        VARCHAR(100),
  last_name         VARCHAR(100),
  ico               VARCHAR(20),
  dic               VARCHAR(20),
  email             VARCHAR(255),
  phone             VARCHAR(30),
  marketing_source  VARCHAR(100),
  billing_street    VARCHAR(255),
  billing_city      VARCHAR(100),
  billing_zip       VARCHAR(20),
  billing_country   VARCHAR(5) DEFAULT 'CZ',
  notes             TEXT,
  assigned_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_client_name CHECK (
    (type = 'company' AND company_name IS NOT NULL) OR
    (type = 'individual' AND first_name IS NOT NULL AND last_name IS NOT NULL)
  )
);

CREATE INDEX idx_clients_type ON clients(type);
CREATE INDEX idx_clients_assigned ON clients(assigned_user_id);
CREATE INDEX idx_clients_ico ON clients(ico) WHERE ico IS NOT NULL;
CREATE INDEX idx_clients_search ON clients USING gin(
  to_tsvector('simple',
    COALESCE(company_name, '') || ' ' ||
    COALESCE(first_name, '') || ' ' ||
    COALESCE(last_name, '') || ' ' ||
    COALESCE(email, '') || ' ' ||
    COALESCE(ico, '')
  )
);

-- ============================================
-- LOCATIONS (místa realizace)
-- ============================================
CREATE TABLE locations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  label       VARCHAR(255) NOT NULL,
  street      VARCHAR(255) NOT NULL,
  city        VARCHAR(100) NOT NULL,
  zip         VARCHAR(20) NOT NULL,
  country     VARCHAR(5) DEFAULT 'CZ',
  lat         DECIMAL(10, 7),
  lng         DECIMAL(10, 7),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_locations_client ON locations(client_id);

-- ============================================
-- PROJECTS / ORDERS (zakázky)
-- ============================================
CREATE TYPE project_type AS ENUM ('garage_doors', 'windows', 'shading');

CREATE TYPE kanban_status AS ENUM (
  'new_inquiry', 'site_visit', 'pricing',
  'waiting_material', 'in_progress', 'done', 'invoiced'
);

CREATE TABLE projects (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id              UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  location_id            UUID REFERENCES locations(id) ON DELETE SET NULL,
  title                  VARCHAR(500) NOT NULL,
  description            TEXT,
  type                   project_type NOT NULL,
  status                 kanban_status NOT NULL DEFAULT 'new_inquiry',
  assigned_sales_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
  total_price            DECIMAL(12, 2),
  currency               VARCHAR(3) DEFAULT 'CZK',
  scheduled_date         DATE,
  deadline               DATE,
  notes                  TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_type ON projects(type);
CREATE INDEX idx_projects_sales ON projects(assigned_sales_id);
CREATE INDEX idx_projects_tech ON projects(assigned_technician_id);
CREATE INDEX idx_projects_deadline ON projects(deadline) WHERE deadline IS NOT NULL;

-- ============================================
-- TASKS (úkoly)
-- ============================================
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'done', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE tasks (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id       UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id        UUID REFERENCES clients(id) ON DELETE CASCADE,
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title            VARCHAR(500) NOT NULL,
  description      TEXT,
  status           task_status NOT NULL DEFAULT 'pending',
  priority         task_priority NOT NULL DEFAULT 'medium',
  due_date         DATE,
  completed_at     TIMESTAMPTZ,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_client ON tasks(client_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date) WHERE due_date IS NOT NULL;

-- ============================================
-- INVOICES (faktury/doklady)
-- ============================================
CREATE TYPE invoice_type AS ENUM ('quote', 'advance', 'invoice');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

CREATE TABLE invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_number  VARCHAR(50) NOT NULL UNIQUE,
  type            invoice_type NOT NULL,
  status          invoice_status NOT NULL DEFAULT 'draft',
  issue_date      DATE NOT NULL,
  due_date        DATE NOT NULL,
  subtotal        DECIMAL(12, 2) NOT NULL DEFAULT 0,
  vat_total       DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total           DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency        VARCHAR(3) DEFAULT 'CZK',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_project ON invoices(project_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due ON invoices(due_date);

CREATE TABLE invoice_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id  UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(500) NOT NULL,
  quantity    DECIMAL(10, 3) NOT NULL DEFAULT 1,
  unit_price  DECIMAL(12, 2) NOT NULL,
  vat_rate    DECIMAL(5, 2) NOT NULL DEFAULT 21,
  total_price DECIMAL(12, 2) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- ============================================
-- INVENTORY (sklad)
-- ============================================
CREATE TABLE inventory (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku             VARCHAR(50) NOT NULL UNIQUE,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  category        VARCHAR(100) NOT NULL,
  unit            VARCHAR(20) NOT NULL DEFAULT 'ks',
  price_per_unit  DECIMAL(12, 2) NOT NULL DEFAULT 0,
  stock_quantity  INT NOT NULL DEFAULT 0,
  min_stock_level INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_sku ON inventory(sku);
CREATE INDEX idx_inventory_category ON inventory(category);

-- ============================================
-- CALENDAR EVENTS
-- ============================================
CREATE TABLE calendar_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(500) NOT NULL,
  description TEXT,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id  UUID REFERENCES projects(id) ON DELETE SET NULL,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ NOT NULL,
  all_day     BOOLEAN NOT NULL DEFAULT false,
  color       VARCHAR(20),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calendar_user ON calendar_events(user_id);
CREATE INDEX idx_calendar_project ON calendar_events(project_id);
CREATE INDEX idx_calendar_range ON calendar_events(start_time, end_time);

-- ============================================
-- ACTIVITY LOG (audit trail)
-- ============================================
CREATE TABLE activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id   UUID NOT NULL,
  action      VARCHAR(50) NOT NULL,
  changes     JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_created ON activity_log(created_at);

-- ============================================
-- ATTACHMENTS (přílohy - fotky, dokumenty)
-- ============================================
CREATE TABLE attachments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id   UUID NOT NULL,
  file_name   VARCHAR(500) NOT NULL,
  file_path   TEXT NOT NULL,
  file_size   BIGINT,
  mime_type   VARCHAR(100),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);

-- ============================================
-- TRIGGERS: auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'users', 'clients', 'locations', 'projects',
      'tasks', 'invoices', 'inventory', 'calendar_events'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()',
      t
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

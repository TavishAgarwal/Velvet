-- ─────────────────────────────────────────────────────────────────────────────
-- Drop template-inherited tables and enums that Velvet does not use.
-- These were created by the generic SaaS template migration.
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop tables (order matters due to foreign keys: tasks → items)
drop table if exists public.activity_feed cascade;
drop table if exists public.tasks cascade;
drop table if exists public.items cascade;

-- Drop enums that belonged to the template tables
drop type if exists item_status;
drop type if exists task_state;
drop type if exists task_priority;
drop type if exists activity_kind;
drop type if exists notification_category;

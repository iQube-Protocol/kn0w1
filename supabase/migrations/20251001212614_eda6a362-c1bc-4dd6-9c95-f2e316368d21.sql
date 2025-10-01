-- Phase 1a: Add uber_admin enum value
ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'uber_admin';
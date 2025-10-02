-- Insert super_admin role for lisawattslimitless@gmail.com on info+33 Agent Site
-- Set created_by to avoid trigger error in role_audit_log
INSERT INTO public.user_roles (user_id, role, agent_site_id, created_by) 
VALUES (
  '47c3d6b3-8edd-4a4e-8d9d-73ea49b3422d', 
  'super_admin',
  '56db8d07-743f-4e75-89fc-c34e2a862c01',
  '47c3d6b3-8edd-4a4e-8d9d-73ea49b3422d'
);
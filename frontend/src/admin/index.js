// Admin module exports for easier imports

// Components
export { default as AdminLayout } from './components/common/AdminLayout';
export { default as AdminNavigation } from './components/common/AdminNavigation';
export { default as AdminRoute } from './components/common/AdminRoute';

// Pages
export { default as AdminDashboard } from './pages/AdminDashboard';

// Contexts
export { AdminProvider, useAdmin } from './contexts/AdminContext';

// Hooks
export { useAdminAuth } from './hooks/useAdminAuth';
export { useAdminData } from './hooks/useAdminData';

// Services
export { adminApi } from './services/adminApi';

// Utils
export { default as adminValidation } from './utils/adminValidation';
export { default as adminHelpers } from './utils/adminHelpers';
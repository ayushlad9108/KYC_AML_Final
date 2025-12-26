import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  AlertTriangle,
  BarChart3,
  Settings,
  Shield,
  Network,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['analyst', 'compliance_officer', 'admin'],
  },
  {
    name: 'KYC Verification',
    href: '/kyc',
    icon: FileCheck,
    roles: ['customer', 'analyst', 'compliance_officer', 'admin'],
  },
  {
    name: 'AML Monitoring',
    href: '/aml',
    icon: AlertTriangle,
    roles: ['analyst', 'compliance_officer', 'admin'],
  },
  {
    name: 'Transaction Flow',
    href: '/transactions',
    icon: Network,
    roles: ['analyst', 'compliance_officer', 'admin'],
  },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
    roles: ['compliance_officer', 'admin'],
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    roles: ['compliance_officer', 'admin'],
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['analyst', 'compliance_officer', 'admin'],
  },
  {
    name: 'Compliance',
    href: '/compliance',
    icon: Shield,
    roles: ['compliance_officer', 'admin'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin'],
  },
];

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  const filteredNavigation = navigationItems.filter((item) =>
    user?.role ? item.roles.includes(user.role) : false
  );

  return (
    <motion.div
      initial={false}
      animate={{
        width: sidebarCollapsed ? 64 : 256,
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center space-x-2"
          >
            <Shield className="w-8 h-8 text-primary-600" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Compliance
            </span>
          </motion.div>
        )}
        
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="ml-3"
              >
                {item.name}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>
    </motion.div>
  );
};

export default Sidebar;
import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  Shield,
  Activity,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import { RiskLevel, AlertSeverity } from '@/types';

// Mock data for demonstration
const mockMetrics = {
  totalUsers: 12847,
  activeKYC: 234,
  pendingAlerts: 18,
  complianceScore: 94,
  riskDistribution: {
    low: 8234,
    medium: 3456,
    high: 987,
    critical: 170,
  },
};

const mockRecentActivity = [
  {
    id: '1',
    type: 'kyc',
    description: 'KYC verification completed for user John Doe',
    timestamp: '2 minutes ago',
    severity: 'low' as AlertSeverity,
  },
  {
    id: '2',
    type: 'aml',
    description: 'High-risk transaction flagged - $50,000 transfer',
    timestamp: '5 minutes ago',
    severity: 'high' as AlertSeverity,
  },
  {
    id: '3',
    type: 'alert',
    description: 'Suspicious pattern detected in user behavior',
    timestamp: '12 minutes ago',
    severity: 'medium' as AlertSeverity,
  },
  {
    id: '4',
    type: 'kyc',
    description: 'Document verification failed - invalid PAN card',
    timestamp: '18 minutes ago',
    severity: 'high' as AlertSeverity,
  },
];

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Compliance Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor KYC verifications, AML alerts, and compliance metrics in real-time
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card hover className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockMetrics.totalUsers.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card hover className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FileCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active KYC
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockMetrics.activeKYC}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card hover className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Alerts
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockMetrics.pendingAlerts}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card hover className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Compliance Score
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockMetrics.complianceScore}%
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Risk Distribution and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Risk Distribution
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="risk" riskLevel={RiskLevel.LOW} size="sm">
                    Low Risk
                  </Badge>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {mockMetrics.riskDistribution.low.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="risk" riskLevel={RiskLevel.MEDIUM} size="sm">
                    Medium Risk
                  </Badge>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {mockMetrics.riskDistribution.medium.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="risk" riskLevel={RiskLevel.HIGH} size="sm">
                    High Risk
                  </Badge>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {mockMetrics.riskDistribution.high.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="risk" riskLevel={RiskLevel.CRITICAL} size="sm">
                    Critical Risk
                  </Badge>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {mockMetrics.riskDistribution.critical.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {mockRecentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Badge variant="alert" alertSeverity={activity.severity} size="sm">
                    {activity.type.toUpperCase()}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.timestamp}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
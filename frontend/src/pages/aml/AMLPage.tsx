import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import { AlertSeverity, AlertStatus, AMLAlert } from '@/types';

// Mock AML alerts data
const mockAlerts: AMLAlert[] = [
  {
    id: '1',
    userId: 'user-123',
    transactionId: 'txn-456',
    alertType: 'Large Transaction',
    severity: AlertSeverity.HIGH,
    status: AlertStatus.OPEN,
    triggeredRules: ['LARGE_AMOUNT_RULE', 'VELOCITY_CHECK'],
    riskFactors: {
      amount: 75000,
      frequency: 'unusual',
      timeOfDay: 'off-hours',
    },
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    userId: 'user-789',
    alertType: 'Suspicious Pattern',
    severity: AlertSeverity.CRITICAL,
    status: AlertStatus.IN_PROGRESS,
    triggeredRules: ['CIRCULAR_TRANSACTION', 'LAYERING_PATTERN'],
    riskFactors: {
      patternType: 'circular',
      participants: 5,
      totalAmount: 150000,
    },
    assignedTo: 'analyst-001',
    createdAt: '2024-01-15T09:15:00Z',
  },
  {
    id: '3',
    userId: 'user-456',
    transactionId: 'txn-789',
    alertType: 'Velocity Violation',
    severity: AlertSeverity.MEDIUM,
    status: AlertStatus.RESOLVED,
    triggeredRules: ['TRANSACTION_VELOCITY'],
    riskFactors: {
      transactionCount: 15,
      timeWindow: '1 hour',
      totalAmount: 25000,
    },
    resolvedAt: '2024-01-15T08:45:00Z',
    resolutionNotes: 'Legitimate business activity confirmed',
    createdAt: '2024-01-15T07:30:00Z',
  },
];

const AMLPage: React.FC = () => {
  const [selectedAlert, setSelectedAlert] = React.useState<AMLAlert | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<AlertStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredAlerts = mockAlerts.filter((alert) => {
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchesSearch = alert.alertType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.userId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: AlertStatus) => {
    switch (status) {
      case AlertStatus.OPEN:
        return <AlertTriangle className="w-4 h-4" />;
      case AlertStatus.IN_PROGRESS:
        return <Clock className="w-4 h-4" />;
      case AlertStatus.RESOLVED:
        return <CheckCircle className="w-4 h-4" />;
      case AlertStatus.FALSE_POSITIVE:
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleAlertAction = (alertId: string, action: 'investigate' | 'resolve' | 'escalate') => {
    console.log(`Action ${action} on alert ${alertId}`);
    // Implement alert action logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AML Monitoring
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and investigate anti-money laundering alerts
          </p>
        </div>
        <Button variant="primary">
          Generate Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Open Alerts
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockAlerts.filter(a => a.status === AlertStatus.OPEN).length}
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
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  In Progress
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockAlerts.filter(a => a.status === AlertStatus.IN_PROGRESS).length}
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
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Resolved Today
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {mockAlerts.filter(a => a.status === AlertStatus.RESOLVED).length}
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
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Detection Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  94.2%
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search alerts..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AlertStatus | 'all')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value={AlertStatus.OPEN}>Open</option>
              <option value={AlertStatus.IN_PROGRESS}>In Progress</option>
              <option value={AlertStatus.RESOLVED}>Resolved</option>
              <option value={AlertStatus.FALSE_POSITIVE}>False Positive</option>
            </select>
          </div>
          <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
            Advanced Filters
          </Button>
        </div>
      </Card>

      {/* Alerts List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AML Alerts ({filteredAlerts.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant="alert" alertSeverity={alert.severity}>
                      {alert.severity}
                    </Badge>
                    <Badge variant="status">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(alert.status)}
                        <span className="capitalize">{alert.status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {alert.id}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {alert.alertType}
                  </h4>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>User: {alert.userId}</span>
                    </div>
                    {alert.transactionId && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Txn: {alert.transactionId}</span>
                      </div>
                    )}
                    <span>
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Triggered Rules: {alert.triggeredRules.join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye className="w-4 h-4" />}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    Investigate
                  </Button>
                  {alert.status === AlertStatus.OPEN && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAlertAction(alert.id, 'resolve')}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedAlert(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Alert Details
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAlert(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Alert Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Type:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedAlert.alertType}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Severity:</span>
                      <Badge variant="alert" alertSeverity={selectedAlert.severity} className="ml-2">
                        {selectedAlert.severity}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">User ID:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {selectedAlert.userId}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {new Date(selectedAlert.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Risk Factors
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <pre className="text-sm text-gray-900 dark:text-white">
                      {JSON.stringify(selectedAlert.riskFactors, null, 2)}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Triggered Rules
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlert.triggeredRules.map((rule) => (
                      <Badge key={rule} variant="default">
                        {rule}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                    Close
                  </Button>
                  <Button variant="danger">
                    Mark as False Positive
                  </Button>
                  <Button variant="primary">
                    Resolve Alert
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AMLPage;
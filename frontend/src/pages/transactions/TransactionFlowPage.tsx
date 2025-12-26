import React from 'react';
import { motion } from 'framer-motion';
import {
  Network,
  Users,
  ArrowRight,
  DollarSign,
  AlertTriangle,
  Filter,
  Search,
} from 'lucide-react';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import { RiskLevel } from '@/types';

// Mock transaction flow data
const mockTransactionFlow = {
  nodes: [
    { id: 'user1', name: 'John Doe', riskLevel: RiskLevel.LOW, totalAmount: 25000 },
    { id: 'user2', name: 'Jane Smith', riskLevel: RiskLevel.MEDIUM, totalAmount: 45000 },
    { id: 'user3', name: 'Bob Johnson', riskLevel: RiskLevel.HIGH, totalAmount: 75000 },
    { id: 'entity1', name: 'ABC Corp', riskLevel: RiskLevel.CRITICAL, totalAmount: 150000 },
  ],
  edges: [
    { from: 'user1', to: 'user2', amount: 15000, count: 3 },
    { from: 'user2', to: 'user3', amount: 25000, count: 5 },
    { from: 'user3', to: 'entity1', amount: 50000, count: 2 },
    { from: 'entity1', to: 'user1', amount: 30000, count: 1 },
  ],
};

const TransactionFlowPage: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = React.useState('7d');
  const [searchTerm, setSearchTerm] = React.useState('');

  const getRiskColor = (riskLevel: RiskLevel) => {
    switch (riskLevel) {
      case RiskLevel.LOW:
        return 'bg-green-100 border-green-300 text-green-800';
      case RiskLevel.MEDIUM:
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case RiskLevel.HIGH:
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case RiskLevel.CRITICAL:
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transaction Flow Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visualize and analyze transaction patterns and money flows
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="primary">
            Export Analysis
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search users or entities..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Button variant="outline" icon={<Filter className="w-4 h-4" />}>
              Advanced Filters
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
            <Button variant="outline" size="sm">Network</Button>
            <Button variant="ghost" size="sm">Timeline</Button>
            <Button variant="ghost" size="sm">Sankey</Button>
          </div>
        </div>
      </Card>

      {/* Network Visualization */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transaction Network
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Network className="w-4 h-4" />
              <span>{mockTransactionFlow.nodes.length} entities</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <ArrowRight className="w-4 h-4" />
              <span>{mockTransactionFlow.edges.length} connections</span>
            </div>
          </div>
        </div>

        {/* Simplified Network Visualization */}
        <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg p-8 min-h-[400px]">
          <div className="flex items-center justify-center h-full">
            <div className="grid grid-cols-2 gap-8">
              {mockTransactionFlow.nodes.map((node, index) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className={`relative p-4 rounded-lg border-2 ${getRiskColor(node.riskLevel)} cursor-pointer hover:shadow-lg transition-all`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">{node.name}</h4>
                      <div className="flex items-center space-x-2 text-sm">
                        <DollarSign className="w-3 h-3" />
                        <span>${node.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="risk" riskLevel={node.riskLevel} size="sm" className="mt-2">
                    {node.riskLevel} Risk
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Connection Lines (Simplified) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#6b7280"
                />
              </marker>
            </defs>
            {/* Example connection lines */}
            <line
              x1="25%"
              y1="25%"
              x2="75%"
              y2="25%"
              stroke="#6b7280"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
              strokeDasharray="5,5"
            />
            <line
              x1="75%"
              y1="25%"
              x2="75%"
              y2="75%"
              stroke="#6b7280"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
              strokeDasharray="5,5"
            />
          </svg>
        </div>
      </Card>

      {/* Transaction Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Suspicious Patterns */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Suspicious Patterns
            </h3>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-900 dark:text-red-300">
                  Circular Transaction Pattern
                </span>
                <Badge variant="alert" alertSeverity="high" size="sm">
                  High Risk
                </Badge>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Detected circular flow: User A → User B → User C → User A
              </p>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                  Rapid Transaction Sequence
                </span>
                <Badge variant="alert" alertSeverity="medium" size="sm">
                  Medium Risk
                </Badge>
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                15 transactions within 1 hour between related entities
              </p>
            </div>
          </div>
        </Card>

        {/* Flow Statistics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Flow Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Transaction Volume
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                $2.4M
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Average Transaction Size
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                $15,750
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Unique Entities
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                247
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Risk Score (Avg)
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                68/100
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TransactionFlowPage;
# Compliance Automation Platform

An AI-powered Compliance Automation Platform for FinTech companies covering KYC (Know Your Customer) verification, AML (Anti-Money Laundering) monitoring, and regulatory compliance.

## 🎯 Features

### KYC Automation
- **Document Verification**: OCR-based extraction and AI authenticity scoring
- **Liveness Detection**: Anti-spoofing biometric verification
- **Risk-Based Processing**: Automated routing based on risk assessment
- **Auto Re-KYC**: Triggered by address changes, transaction spikes, or inactivity

### AML & Fraud Detection
- **Real-time Monitoring**: Rule-based and behavioral transaction analysis
- **Graph Analytics**: Circular and layered transaction detection
- **Explainable AI**: Clear reasoning for all compliance decisions
- **Adaptive Learning**: Continuous improvement from analyst feedback

### Compliance & Audit
- **Immutable Audit Trails**: Complete decision traceability
- **Regulatory Reporting**: One-click PDF/CSV export for regulators
- **Multi-jurisdiction Support**: India (RBI), EU (GDPR), US (FinCEN)
- **Interactive Dashboards**: Risk heatmaps and transaction flow visualization

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + TypeScript + Prisma ORM
- **Database**: PostgreSQL + Redis (caching)
- **AI/ML**: Python FastAPI microservices
- **Storage**: MinIO (S3-compatible) for secure document storage
- **Authentication**: JWT with Role-Based Access Control

### System Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Node.js Backend │    │  Python AI/ML   │
│                 │◄──►│                 │◄──►│   Services      │
│  • Dashboard    │    │  • REST APIs    │    │  • Document AI  │
│  • KYC UI       │    │  • WebSockets   │    │  • Liveness AI  │
│  • AML Monitor  │    │  • Auth/RBAC    │    │  • Behavior AI  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Data Layer    │
                    │                 │
                    │  • PostgreSQL   │
                    │  • Redis Cache  │
                    │  • MinIO S3     │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd compliance-automation-platform
```

2. **Start infrastructure services**
```bash
docker-compose up -d
```

3. **Install dependencies**
```bash
npm run setup
```

4. **Set up environment variables**
```bash
cp .env.example .env.development
# Edit .env.development with your configuration
```

5. **Initialize database**
```bash
cd backend
npm run prisma:migrate
npm run prisma:seed
```

6. **Start development servers**
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- AI Services: http://localhost:8001
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- MinIO: http://localhost:9001

### Development Tools (Optional)
```bash
# Start with development tools
docker-compose --profile dev up -d
```

Access development tools:
- PgAdmin: http://localhost:5050 (admin@compliance.com / admin123)
- Redis Commander: http://localhost:8081

## 📁 Project Structure

```
compliance-automation-platform/
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── stores/         # State management (Zustand)
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/          # Utility functions
│   └── package.json
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript definitions
│   ├── prisma/             # Database schema and migrations
│   └── package.json
├── ai-services/            # Python FastAPI AI/ML services
│   ├── app/
│   │   ├── models/         # AI/ML models
│   │   ├── services/       # AI processing services
│   │   ├── api/            # FastAPI routes
│   │   └── utils/          # Utility functions
│   ├── main.py
│   └── requirements.txt
├── docker-compose.yml      # Infrastructure services
├── .env.example           # Environment variables template
└── README.md
```

## 🔧 Development

### Available Scripts

**Root level:**
- `npm run dev` - Start all services in development mode
- `npm run build` - Build all services for production
- `npm run test` - Run all tests
- `npm run docker:up` - Start infrastructure services
- `npm run docker:down` - Stop infrastructure services

**Frontend:**
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run test` - Run Vitest tests

**Backend:**
- `npm run dev` - Start with nodemon (auto-reload)
- `npm run build` - Compile TypeScript
- `npm run test` - Run Jest tests
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

**AI Services:**
- `python -m uvicorn main:app --reload` - Start FastAPI server
- `pytest` - Run Python tests

### Environment Configuration

The application uses environment-specific configuration:

- `.env.development` - Development environment
- `.env.staging` - Staging environment  
- `.env.production` - Production environment

Key configuration areas:
- Database connections (PostgreSQL, Redis)
- JWT secrets and expiration
- AI service endpoints
- File storage (MinIO/S3)
- Compliance thresholds
- Rate limiting settings

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Individual component and service testing
- **Integration Tests**: API endpoint and database testing
- **E2E Tests**: Complete user journey testing
- **Security Tests**: Authentication and data protection validation

### Running Tests
```bash
# All tests
npm run test

# Frontend tests only
cd frontend && npm run test

# Backend tests only
cd backend && npm run test

# AI service tests only
cd ai-services && pytest
```

## 🔒 Security

### Security Features
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Data encryption at rest and in transit
- PII data masking (Aadhaar, PAN)
- Rate limiting and DDoS protection
- Input validation and sanitization
- Secure file upload with virus scanning

### Compliance Standards
- **GDPR**: Data portability, right to erasure, consent management
- **PCI DSS**: Secure payment data handling
- **SOC 2 Type II**: Security controls and monitoring
- **RBI Guidelines**: Indian regulatory compliance
- **FinCEN**: US AML reporting requirements

## 📊 Monitoring & Observability

### Application Monitoring
- Response time tracking (95th percentile)
- Error rate monitoring with alerts
- Resource utilization (CPU, memory, database)
- Business metrics (KYC processing times, AML accuracy)

### Logging
- Structured logging with Winston
- Audit trail for all compliance decisions
- Performance monitoring
- Security event logging

## 🚀 Deployment

### Production Deployment
1. Build all services: `npm run build`
2. Set production environment variables
3. Run database migrations: `npm run prisma:migrate`
4. Deploy using Docker containers or cloud services
5. Configure load balancers and SSL certificates
6. Set up monitoring and alerting

### Scaling Considerations
- Horizontal scaling for API services
- Database read replicas for performance
- Redis clustering for high availability
- CDN for static asset delivery
- Auto-scaling based on transaction volume

## 📝 API Documentation

### REST API Endpoints
- **Authentication**: `/api/auth/*`
- **KYC Services**: `/api/kyc/*`
- **AML Monitoring**: `/api/aml/*`
- **Compliance**: `/api/compliance/*`
- **Admin**: `/api/admin/*`

### AI Service Endpoints
- **Document AI**: `/ai/document/*`
- **Liveness AI**: `/ai/liveness/*`
- **Behavior AI**: `/ai/behavior/*`

API documentation is available at:
- Backend API: http://localhost:3000/docs
- AI Services: http://localhost:8001/docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new features
- Use conventional commit messages
- Update documentation for API changes
- Ensure security best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation at `/docs`
- Review the API documentation
- Contact the development team

---

**Built with ❤️ for FinTech Compliance**
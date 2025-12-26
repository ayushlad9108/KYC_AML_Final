import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo users with different roles
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      riskScore: 10,
      kycStatus: 'APPROVED',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          dateOfBirth: new Date('1985-01-01'),
          nationality: 'Indian',
          occupation: 'System Administrator',
          street: '123 Admin Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          postalCode: '400001',
        },
      },
    },
  });

  // Compliance Officer
  const complianceUser = await prisma.user.upsert({
    where: { email: 'compliance@demo.com' },
    update: {},
    create: {
      email: 'compliance@demo.com',
      password: hashedPassword,
      role: 'COMPLIANCE_OFFICER',
      status: 'ACTIVE',
      riskScore: 15,
      kycStatus: 'APPROVED',
      profile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          dateOfBirth: new Date('1988-05-15'),
          nationality: 'Indian',
          occupation: 'Compliance Officer',
          street: '456 Compliance Ave',
          city: 'Delhi',
          state: 'Delhi',
          country: 'India',
          postalCode: '110001',
        },
      },
    },
  });

  // Analyst user
  const analystUser = await prisma.user.upsert({
    where: { email: 'analyst@demo.com' },
    update: {},
    create: {
      email: 'analyst@demo.com',
      password: hashedPassword,
      role: 'ANALYST',
      status: 'ACTIVE',
      riskScore: 20,
      kycStatus: 'APPROVED',
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Smith',
          dateOfBirth: new Date('1990-03-20'),
          nationality: 'Indian',
          occupation: 'Risk Analyst',
          street: '789 Analysis Road',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          postalCode: '560001',
        },
      },
    },
  });

  // Customer users with various risk profiles
  const customers = [
    {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      riskScore: 25,
      kycStatus: 'APPROVED' as const,
    },
    {
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      riskScore: 45,
      kycStatus: 'PENDING_REVIEW' as const,
    },
    {
      email: 'bob.johnson@example.com',
      firstName: 'Bob',
      lastName: 'Johnson',
      riskScore: 75,
      kycStatus: 'IN_PROGRESS' as const,
    },
    {
      email: 'alice.brown@example.com',
      firstName: 'Alice',
      lastName: 'Brown',
      riskScore: 90,
      kycStatus: 'REJECTED' as const,
    },
  ];

  const createdCustomers = [];
  for (const customer of customers) {
    const user = await prisma.user.upsert({
      where: { email: customer.email },
      update: {},
      create: {
        email: customer.email,
        password: hashedPassword,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        riskScore: customer.riskScore,
        kycStatus: customer.kycStatus,
        profile: {
          create: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            dateOfBirth: new Date('1992-06-10'),
            nationality: 'Indian',
            occupation: 'Software Engineer',
            street: '123 Customer Street',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            postalCode: '411001',
          },
        },
      },
    });
    createdCustomers.push(user);
  }

  // Create sample compliance rules
  const complianceRules = [
    {
      ruleName: 'Large Transaction Alert',
      ruleType: 'TRANSACTION_MONITORING',
      conditions: {
        amount: { gte: 50000 },
        currency: 'INR',
      },
      actions: {
        createAlert: true,
        severity: 'HIGH',
        requireReview: true,
      },
      priority: 1,
      jurisdiction: 'IN',
    },
    {
      ruleName: 'Velocity Check',
      ruleType: 'VELOCITY_MONITORING',
      conditions: {
        transactionCount: { gte: 10 },
        timeWindow: '1h',
      },
      actions: {
        createAlert: true,
        severity: 'MEDIUM',
        flagAccount: true,
      },
      priority: 2,
      jurisdiction: 'IN',
    },
    {
      ruleName: 'Circular Transaction Pattern',
      ruleType: 'PATTERN_DETECTION',
      conditions: {
        patternType: 'circular',
        minParticipants: 3,
        maxHops: 5,
      },
      actions: {
        createAlert: true,
        severity: 'CRITICAL',
        blockTransactions: true,
      },
      priority: 1,
      jurisdiction: 'IN',
    },
  ];

  for (const rule of complianceRules) {
    await prisma.complianceRule.upsert({
      where: { ruleName: rule.ruleName },
      update: {},
      create: {
        ...rule,
        createdBy: adminUser.id,
      },
    });
  }

  // Create sample transactions
  const transactions = [
    {
      userId: createdCustomers[0].id,
      transactionType: 'TRANSFER' as const,
      amount: 75000,
      currency: 'INR',
      counterpartyId: createdCustomers[1].id,
      description: 'Business payment',
      riskScore: 85,
      amlStatus: 'FLAGGED' as const,
    },
    {
      userId: createdCustomers[1].id,
      transactionType: 'DEPOSIT' as const,
      amount: 25000,
      currency: 'INR',
      description: 'Salary deposit',
      riskScore: 15,
      amlStatus: 'CLEAR' as const,
    },
    {
      userId: createdCustomers[2].id,
      transactionType: 'WITHDRAWAL' as const,
      amount: 150000,
      currency: 'INR',
      description: 'Large withdrawal',
      riskScore: 95,
      amlStatus: 'UNDER_REVIEW' as const,
    },
  ];

  const createdTransactions = [];
  for (const transaction of transactions) {
    const tx = await prisma.transaction.create({
      data: {
        ...transaction,
        metadata: {
          location: 'Mumbai, India',
          deviceId: 'device_' + Math.random().toString(36).substr(2, 9),
          ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
        },
      },
    });
    createdTransactions.push(tx);
  }

  // Create sample AML alerts
  const amlAlerts = [
    {
      userId: createdCustomers[0].id,
      transactionId: createdTransactions[0].id,
      alertType: 'Large Transaction',
      severity: 'HIGH' as const,
      status: 'OPEN' as const,
      triggeredRules: ['LARGE_AMOUNT_RULE', 'VELOCITY_CHECK'],
      riskFactors: {
        amount: 75000,
        frequency: 'unusual',
        timeOfDay: 'off-hours',
        location: 'new',
      },
    },
    {
      userId: createdCustomers[2].id,
      transactionId: createdTransactions[2].id,
      alertType: 'Suspicious Pattern',
      severity: 'CRITICAL' as const,
      status: 'IN_PROGRESS' as const,
      triggeredRules: ['CIRCULAR_TRANSACTION', 'LAYERING_PATTERN'],
      riskFactors: {
        patternType: 'circular',
        participants: 5,
        totalAmount: 150000,
        complexity: 'high',
      },
      assignedTo: analystUser.id,
    },
    {
      userId: createdCustomers[1].id,
      alertType: 'Velocity Violation',
      severity: 'MEDIUM' as const,
      status: 'RESOLVED' as const,
      triggeredRules: ['TRANSACTION_VELOCITY'],
      riskFactors: {
        transactionCount: 15,
        timeWindow: '1 hour',
        totalAmount: 25000,
      },
      resolvedAt: new Date(),
      resolutionNotes: 'Legitimate business activity confirmed',
    },
  ];

  for (const alert of amlAlerts) {
    await prisma.aMLAlert.create({
      data: alert,
    });
  }

  // Create sample KYC verifications
  for (const customer of createdCustomers) {
    if (customer.kycStatus !== 'NOT_STARTED') {
      await prisma.kYCVerification.create({
        data: {
          userId: customer.id,
          documentType: 'PAN',
          documentNumber: 'ABCDE1234F',
          verificationStatus: customer.kycStatus === 'APPROVED' ? 'VERIFIED' : 'PENDING',
          confidenceScore: customer.kycStatus === 'APPROVED' ? 94 : 67,
          verificationMethod: 'AI_OCR_LIVENESS',
          verifiedAt: customer.kycStatus === 'APPROVED' ? new Date() : null,
          expiresAt: customer.kycStatus === 'APPROVED' ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null,
          verificationData: {
            ocrConfidence: 0.94,
            livenessScore: 0.89,
            faceMatchScore: 0.92,
            documentQuality: 'high',
          },
        },
      });
    }
  }

  // Create audit logs
  const auditActions = [
    'USER_LOGIN',
    'KYC_VERIFICATION_STARTED',
    'DOCUMENT_UPLOADED',
    'AML_ALERT_CREATED',
    'TRANSACTION_FLAGGED',
    'ALERT_RESOLVED',
  ];

  for (let i = 0; i < 20; i++) {
    await prisma.auditLog.create({
      data: {
        entityType: 'USER',
        entityId: createdCustomers[i % createdCustomers.length].id,
        action: auditActions[i % auditActions.length],
        actorId: i % 2 === 0 ? analystUser.id : complianceUser.id,
        actorType: 'USER',
        changes: {
          field: 'status',
          oldValue: 'pending',
          newValue: 'active',
        },
        metadata: {
          source: 'web_app',
          sessionId: 'session_' + Math.random().toString(36).substr(2, 9),
        },
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Created:');
  console.log(`   - ${customers.length + 3} users (admin, compliance, analyst, customers)`);
  console.log(`   - ${complianceRules.length} compliance rules`);
  console.log(`   - ${transactions.length} sample transactions`);
  console.log(`   - ${amlAlerts.length} AML alerts`);
  console.log(`   - ${customers.length - 1} KYC verifications`);
  console.log('   - 20 audit log entries');
  console.log('');
  console.log('🔑 Demo Login Credentials:');
  console.log('   Admin: admin@demo.com / password123');
  console.log('   Compliance: compliance@demo.com / password123');
  console.log('   Analyst: analyst@demo.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
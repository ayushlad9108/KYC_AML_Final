import { PrismaClient, Prisma } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
  errorFormat: 'pretty',
});

// ------------------------------
// Middleware: timestamps
// ------------------------------
prisma.$use(async (params, next) => {
  if (params.action === 'create') {
    params.args.data = {
      ...params.args.data,
      createdAt: new Date(),
    };
  }

  if (params.action === 'update' || params.action === 'updateMany') {
    params.args.data = {
      ...params.args.data,
      updatedAt: new Date(),
    };
  }

  return next(params);
});

// ------------------------------
// Middleware: audit logging
// ------------------------------
prisma.$use(async (params, next) => {
  const result = await next(params);

  const auditableActions = ['create', 'update', 'delete'];
  const auditableModels = ['User', 'Transaction', 'AMLAlert', 'KYCVerification'];

  if (
    params.model &&
    auditableActions.includes(params.action) &&
    auditableModels.includes(params.model)
  ) {
    console.log('🧾 Audit Log:', {
      action: params.action,
      model: params.model,
      timestamp: new Date().toISOString(),
    });
  }

  return result;
});

// ------------------------------
// Health check
// ------------------------------
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    return false;
  }
};

// ------------------------------
// Transaction helper (FIXED)
// ------------------------------
export async function runTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return callback(tx);
  });
}

// ------------------------------
// Graceful shutdown
// ------------------------------
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
};

export default prisma;

import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './utils/db';

const PORT = env.PORT;

async function startServer() {
  try {
    // Connect DB (won't crash deploy if fails)
    await connectDB();
    console.log('✅ Database connected');
  } catch (err) {
    console.error('⚠️ Database connection failed. Server will still run.');
  }

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
  });

  /* -------------------- Graceful Shutdown -------------------- */
  const shutdown = async () => {
    console.log('🛑 Shutting down server...');
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();

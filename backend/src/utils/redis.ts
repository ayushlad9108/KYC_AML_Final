import Redis from 'ioredis';
import { RiskAssessment } from '@/types';

class RedisClient {
  private client: Redis | null = null;
  private isConnected: boolean = false;
  private memoryCache: Map<string, { value: any; expiry?: number }> = new Map();
  private isRedisDisabled: boolean = false;

  constructor() {
    // Check if Redis is disabled in environment
    this.isRedisDisabled = process.env.REDIS_DISABLED === 'true';
    
    if (this.isRedisDisabled) {
      console.log('📝 Redis disabled - using memory cache');
      this.isConnected = true;
      return;
    }

    try {
      this.client = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || 'redis_password',
        enableReadyCheck: false,
        maxRetriesPerRequest: null,
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (error) => {
        console.error('❌ Redis connection error:', error);
        this.isConnected = false;
        // Fallback to memory cache
        console.log('📝 Falling back to memory cache');
        this.isRedisDisabled = true;
      });

      this.client.on('close', () => {
        console.log('🔌 Redis connection closed');
        this.isConnected = false;
      });
    } catch (error) {
      console.error('Redis initialization error:', error);
      this.isRedisDisabled = true;
      this.isConnected = true; // Memory cache is available
    }
  }

  // Generic cache operations
  async get(key: string): Promise<string | null> {
    if (this.isRedisDisabled) {
      const cached = this.memoryCache.get(key);
      if (cached && (!cached.expiry || cached.expiry > Date.now())) {
        return cached.value;
      }
      this.memoryCache.delete(key);
      return null;
    }

    if (!this.client) return null;

    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (this.isRedisDisabled) {
      const cacheEntry: { value: any; expiry?: number } = { value };
      if (ttlSeconds) {
        cacheEntry.expiry = Date.now() + (ttlSeconds * 1000);
      }
      this.memoryCache.set(key, cacheEntry);
      return true;
    }

    if (!this.client) return false;

    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (this.isRedisDisabled) {
      this.memoryCache.delete(key);
      return true;
    }

    if (!this.client) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (this.isRedisDisabled) {
      const cached = this.memoryCache.get(key);
      return cached !== undefined && (!cached.expiry || cached.expiry > Date.now());
    }

    if (!this.client) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // JSON operations
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const value = await this.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET JSON error:', error);
      return null;
    }
  }

  async setJSON<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      return await this.set(key, JSON.stringify(value), ttlSeconds);
    } catch (error) {
      console.error('Redis SET JSON error:', error);
      return false;
    }
  }

  // Session management
  async getSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`;
    return await this.getJSON(key);
  }

  async setSession(sessionId: string, sessionData: any, ttlSeconds: number = 86400): Promise<boolean> {
    const key = `session:${sessionId}`;
    return await this.setJSON(key, sessionData, ttlSeconds);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const key = `session:${sessionId}`;
    return await this.del(key);
  }

  // Rate limiting
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    if (this.isRedisDisabled) {
      // Simple memory-based rate limiting
      const rateLimitKey = `rate_limit:${key}`;
      const cached = this.memoryCache.get(rateLimitKey);
      const now = Date.now();
      
      if (!cached || (cached.expiry && cached.expiry < now)) {
        const resetTime = now + (windowSeconds * 1000);
        this.memoryCache.set(rateLimitKey, { 
          value: JSON.stringify({ count: 1, resetTime }),
          expiry: resetTime
        });
        return { allowed: true, remaining: limit - 1, resetTime };
      }
      
      const data = JSON.parse(cached.value);
      data.count++;
      this.memoryCache.set(rateLimitKey, { 
        value: JSON.stringify(data),
        expiry: data.resetTime
      });
      
      return {
        allowed: data.count <= limit,
        remaining: Math.max(0, limit - data.count),
        resetTime: data.resetTime,
      };
    }

    if (!this.client) {
      return { allowed: true, remaining: limit, resetTime: Date.now() + (windowSeconds * 1000) };
    }

    try {
      const current = await this.client.incr(key);
      
      if (current === 1) {
        await this.client.expire(key, windowSeconds);
      }
      
      const ttl = await this.client.ttl(key);
      const resetTime = Date.now() + (ttl * 1000);
      
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetTime,
      };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      return { allowed: true, remaining: limit, resetTime: Date.now() + (windowSeconds * 1000) };
    }
  }

  // Dashboard metrics caching
  async cacheDashboardMetrics(metrics: any, ttlSeconds: number = 300): Promise<boolean> {
    const key = 'dashboard:metrics';
    return await this.setJSON(key, metrics, ttlSeconds);
  }

  async getDashboardMetrics(): Promise<any | null> {
    const key = 'dashboard:metrics';
    return await this.getJSON(key);
  }

  // Health check
  async ping(): Promise<boolean> {
    if (this.isRedisDisabled) {
      return true; // Memory cache is always available
    }

    if (!this.client) return false;

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis ping error:', error);
      return false;
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    if (this.isRedisDisabled || !this.client) {
      console.log('🔌 Memory cache cleared');
      this.memoryCache.clear();
      return;
    }

    try {
      await this.client.quit();
      console.log('🔌 Redis disconnected gracefully');
    } catch (error) {
      console.error('Redis disconnect error:', error);
    }
  }

  // Get connection status
  get connected(): boolean {
    return this.isConnected;
  }
}

// Create singleton instance
const redisClient = new RedisClient();

export default redisClient;
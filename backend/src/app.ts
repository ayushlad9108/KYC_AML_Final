import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import routes from './routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (env.NODE_ENV === 'development') app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: env.RATE_WINDOW_MS, max: env.RATE_MAX });
app.use('/api', limiter);

// health
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok', ts: new Date().toISOString() }));

// api
app.use('/api', routes);

// 404
app.use('*', (req, res) => res.status(404).json({ success: false, error: { code: 'NOT_FOUND', path: req.originalUrl } }));

export default app;

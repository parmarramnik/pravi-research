import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import openApiSpec from './swagger/openapi.json';
import { AuthService } from './auth/auth.service';
import { authenticateJwt, AuthenticatedRequest } from './auth/auth.middleware';
import { StructuredLogger } from '@infrasphere/shared-utils';

dotenv.config();

const logger = new StructuredLogger('ApiGateway');
const app = express();
const port = process.env.PORT || 3000;
const authService = new AuthService();

// Downstream Service URLs
const ASSET_SERVICE_URL = process.env.ASSET_SERVICE_URL || 'http://localhost:3001';
const INSPECTION_SERVICE_URL = process.env.INSPECTION_SERVICE_URL || 'http://localhost:3002';
const MAINTENANCE_SERVICE_URL = process.env.MAINTENANCE_SERVICE_URL || 'http://localhost:3003';
const RISK_SERVICE_URL = process.env.RISK_SERVICE_URL || 'http://localhost:3004';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3005';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';
const AUDIT_SERVICE_URL = process.env.AUDIT_SERVICE_URL || 'http://localhost:3007';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting (100 req per minute per IP)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
});
app.use('/api/', limiter);

// Swagger API Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Health Check
app.get('/health', async (_req: Request, res: Response) => {
  res.json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    downstream: {
      assetService: ASSET_SERVICE_URL,
      inspectionService: INSPECTION_SERVICE_URL,
      maintenanceService: MAINTENANCE_SERVICE_URL,
      riskService: RISK_SERVICE_URL,
      aiService: AI_SERVICE_URL,
      notificationService: NOTIFICATION_SERVICE_URL,
      auditService: AUDIT_SERVICE_URL,
    },
  });
});

// Auth Routes (JSON body parsed)
const authRouter = express.Router();
authRouter.use(express.json());

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'Email and password required' } });
  }

  const result = await authService.login(email, password);
  if (!result) {
    return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
  }

  res.json({ success: true, data: result });
});

authRouter.get('/demo-users', (_req: Request, res: Response) => {
  res.json({ success: true, data: authService.getDemoUsers() });
});

authRouter.get('/me', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, data: req.user });
});

app.use('/api/auth', authRouter);

// Analytics Aggregator Endpoint
app.get('/api/analytics/dashboard', async (_req: Request, res: Response) => {
  try {
    const [assetStatsRes, maintStatsRes, riskMatrixRes] = await Promise.allSettled([
      fetch(`${ASSET_SERVICE_URL}/api/assets/statistics`),
      fetch(`${MAINTENANCE_SERVICE_URL}/api/maintenance/statistics`),
      fetch(`${RISK_SERVICE_URL}/api/risks/matrix`),
    ]);

    let assetStats: any = {};
    let maintStats: any = {};
    let riskMatrix: any = {};

    if (assetStatsRes.status === 'fulfilled' && assetStatsRes.value.ok) {
      const j = await assetStatsRes.value.json();
      assetStats = j.data || {};
    }
    if (maintStatsRes.status === 'fulfilled' && maintStatsRes.value.ok) {
      const j = await maintStatsRes.value.json();
      maintStats = j.data || {};
    }
    if (riskMatrixRes.status === 'fulfilled' && riskMatrixRes.value.ok) {
      const j = await riskMatrixRes.value.json();
      riskMatrix = j.data || {};
    }

    res.json({
      success: true,
      data: {
        totalAssets: assetStats.totalAssets || 0,
        activeAssets: assetStats.activeAssets || 0,
        criticalAssets: assetStats.criticalAssets || 0,
        underMaintenance: assetStats.underMaintenance || 0,
        openWorkOrders: maintStats.openWorkOrders || 0,
        totalMaintenanceSpend: maintStats.totalMaintenanceSpend || 0,
        categoryBreakdown: assetStats.categoryBreakdown || [],
        conditionDistribution: assetStats.conditionDistribution || [],
        riskMatrix,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'ANALYTICS_FAILED', message: error.message } });
  }
});

// Proxy routes to downstream services
// 1. Asset Service
app.use(
  '/api/assets',
  createProxyMiddleware({
    target: `${ASSET_SERVICE_URL}/api/assets`,
    changeOrigin: true,
  })
);

// 2. Inspection Service
app.use(
  '/api/inspections',
  createProxyMiddleware({
    target: `${INSPECTION_SERVICE_URL}/api/inspections`,
    changeOrigin: true,
  })
);

// 3. Maintenance Service
app.use(
  '/api/work-orders',
  createProxyMiddleware({
    target: `${MAINTENANCE_SERVICE_URL}/api/work-orders`,
    changeOrigin: true,
  })
);

app.use(
  '/api/maintenance',
  createProxyMiddleware({
    target: `${MAINTENANCE_SERVICE_URL}/api/maintenance`,
    changeOrigin: true,
  })
);

// 4. Risk Service
app.use(
  '/api/risks',
  createProxyMiddleware({
    target: `${RISK_SERVICE_URL}/api/risks`,
    changeOrigin: true,
  })
);

// 5. AI Service
app.use(
  '/api/ai',
  createProxyMiddleware({
    target: `${AI_SERVICE_URL}/api/ai`,
    changeOrigin: true,
  })
);

// 6. Notification Service
app.use(
  '/api/notifications',
  createProxyMiddleware({
    target: `${NOTIFICATION_SERVICE_URL}/api/notifications`,
    changeOrigin: true,
  })
);

// 7. Audit Service
app.use(
  '/api/audit',
  createProxyMiddleware({
    target: `${AUDIT_SERVICE_URL}/api/audit`,
    changeOrigin: true,
  })
);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled Gateway error', { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_GATEWAY_ERROR', message: err.message || 'An unexpected error occurred' },
  });
});

app.listen(port, () => {
  logger.info(`API Gateway active on port ${port}`);
  logger.info(`Swagger API Docs available at http://localhost:${port}/docs`);
});

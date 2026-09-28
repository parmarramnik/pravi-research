import { Router, Request, Response } from 'express';
import { RisksService } from './risks.service';
import { prisma } from '../../database/prisma';

const router = Router();
const service = new RisksService();

// 1. Get all calculated risks
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await service.getAllRisks(req.query as any);
    res.json({ success: true, data: result.risks, meta: result.meta });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'RISKS_FETCH_ERROR', message: error.message } });
  }
});

// 2. Risk Matrix
router.get('/matrix', async (_req: Request, res: Response) => {
  try {
    const matrix = await service.getRiskMatrix();
    res.json({ success: true, data: matrix });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'MATRIX_ERROR', message: error.message } });
  }
});

// 3. Get Risk Configuration
router.get('/config', async (_req: Request, res: Response) => {
  try {
    let config = await prisma.riskConfigRecord.findUnique({ where: { id: 'default' } });
    if (!config) {
      config = await prisma.riskConfigRecord.create({
        data: { id: 'default', conditionWeight: 0.35, ageWeight: 0.20, inspectionWeight: 0.20, maintenanceWeight: 0.25 },
      });
    }
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'CONFIG_ERROR', message: error.message } });
  }
});

// 4. Update Risk Configuration (Configurable scoring rules)
router.patch('/config', async (req: Request, res: Response) => {
  try {
    const { conditionWeight, ageWeight, inspectionWeight, maintenanceWeight } = req.body;
    const config = await prisma.riskConfigRecord.upsert({
      where: { id: 'default' },
      create: { id: 'default', conditionWeight, ageWeight, inspectionWeight, maintenanceWeight },
      update: { conditionWeight, ageWeight, inspectionWeight, maintenanceWeight },
    });
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CONFIG_UPDATE_FAILED', message: error.message } });
  }
});

// 5. Get Risk for Specific Asset
router.get('/:assetId', async (req: Request, res: Response) => {
  try {
    const risk = await service.getAssetRisk(req.params.assetId);
    if (!risk) {
      return res.status(404).json({ success: false, error: { code: 'RISK_NOT_FOUND', message: 'Risk record not found' } });
    }
    res.json({ success: true, data: risk });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
  }
});

// 6. Force Recalculate Risk for Asset
router.post('/:assetId/recalculate', async (req: Request, res: Response) => {
  try {
    const recalculated = await service.recalculateRisk(
      req.params.assetId,
      req.body.triggerEvent || 'api.manual_trigger',
      req.body.hints
    );
    res.json({ success: true, data: recalculated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'RECALCULATE_FAILED', message: error.message } });
  }
});

export const risksRouter = router;

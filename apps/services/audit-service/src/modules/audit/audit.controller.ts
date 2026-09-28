import { Router, Request, Response } from 'express';
import { AuditService } from './audit.service';

const router = Router();
const service = new AuditService();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json({ success: true, data: result.logs, meta: result.meta });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
  }
});

router.get('/entity/:entity/:entityId', async (req: Request, res: Response) => {
  try {
    const logs = await service.findByEntity(req.params.entity, req.params.entityId);
    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const created = await service.record(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'RECORD_FAILED', message: error.message } });
  }
});

export const auditRouter = router;

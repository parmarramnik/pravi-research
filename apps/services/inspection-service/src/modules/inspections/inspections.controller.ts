import { Router, Request, Response } from 'express';
import { InspectionsService } from './inspections.service';

const router = Router();
const inspectionsService = new InspectionsService();

// 1. Get Inspections list
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await inspectionsService.findAll(req.query as any);
    res.json({ success: true, data: result.inspections, meta: result.meta });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INSPECTIONS_FETCH_ERROR', message: error.message } });
  }
});

// 2. Get Inspections for specific asset
router.get('/asset/:assetId', async (req: Request, res: Response) => {
  try {
    const inspections = await inspectionsService.findByAssetId(req.params.assetId);
    res.json({ success: true, data: inspections });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'ASSET_INSPECTIONS_ERROR', message: error.message } });
  }
});

// 3. Get Inspection by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const inspection = await inspectionsService.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, error: { code: 'INSPECTION_NOT_FOUND', message: 'Inspection not found' } });
    }
    res.json({ success: true, data: inspection });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'INSPECTION_FETCH_ERROR', message: error.message } });
  }
});

// 4. Create / Schedule Inspection
router.post('/', async (req: Request, res: Response) => {
  try {
    const created = await inspectionsService.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'INSPECTION_CREATE_FAILED', message: error.message } });
  }
});

// 5. Add Finding to Inspection
router.post('/:id/findings', async (req: Request, res: Response) => {
  try {
    const finding = await inspectionsService.addFinding(req.params.id, req.body);
    res.status(201).json({ success: true, data: finding });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'FINDING_ADD_FAILED', message: error.message } });
  }
});

// 6. Complete Inspection (Triggers RabbitMQ inspection.completed)
router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const completed = await inspectionsService.completeInspection(req.params.id, req.body);
    if (!completed) {
      return res.status(404).json({ success: false, error: { code: 'INSPECTION_NOT_FOUND', message: 'Inspection not found' } });
    }
    res.json({ success: true, data: completed });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'INSPECTION_COMPLETE_FAILED', message: error.message } });
  }
});

export const inspectionsRouter = router;

import { Router, Request, Response } from 'express';
import { WorkOrdersService } from './workorders.service';

const router = Router();
const service = new WorkOrdersService();

// 1. Get Work Orders
router.get('/work-orders', async (req: Request, res: Response) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json({ success: true, data: result.workOrders, meta: result.meta });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'WORK_ORDERS_FETCH_ERROR', message: error.message } });
  }
});

// 2. Get Work Order by ID
router.get('/work-orders/:id', async (req: Request, res: Response) => {
  try {
    const order = await service.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
  }
});

// 3. Create Work Order
router.post('/work-orders', async (req: Request, res: Response) => {
  try {
    const created = await service.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: error.message } });
  }
});

// 4. Update Work Order
router.patch('/work-orders/:id', async (req: Request, res: Response) => {
  try {
    const updated = await service.update(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
  }
});

// 5. Complete Work Order (Triggers RabbitMQ workorder.completed & maintenance.completed)
router.post('/work-orders/:id/complete', async (req: Request, res: Response) => {
  try {
    const completed = await service.completeWorkOrder(req.params.id, req.body);
    if (!completed) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Work order not found' } });
    }
    res.json({ success: true, data: completed });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'COMPLETE_FAILED', message: error.message } });
  }
});

// 6. Maintenance records by asset
router.get('/maintenance/asset/:assetId', async (req: Request, res: Response) => {
  try {
    const history = await service.getMaintenanceHistory(req.params.assetId);
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'HISTORY_FETCH_ERROR', message: error.message } });
  }
});

// 7. Maintenance statistics
router.get('/maintenance/statistics', async (_req: Request, res: Response) => {
  try {
    const stats = await service.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'STATS_ERROR', message: error.message } });
  }
});

export const maintenanceRouter = router;

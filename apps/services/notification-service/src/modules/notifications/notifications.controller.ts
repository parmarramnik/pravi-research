import { Router, Request, Response } from 'express';
import { NotificationsService } from './notifications.service';

const router = Router();
const service = new NotificationsService();

router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await service.findAll(req.query as any);
    res.json({ success: true, data: result.notifications, meta: result.meta });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: error.message } });
  }
});

router.get('/unread-count', async (_req: Request, res: Response) => {
  try {
    const count = await service.getUnreadCount();
    res.json({ success: true, data: { unreadCount: count } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'COUNT_ERROR', message: error.message } });
  }
});

router.patch('/:id/read', async (req: Request, res: Response) => {
  try {
    const updated = await service.markAsRead(req.params.id);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
  }
});

router.patch('/read-all', async (_req: Request, res: Response) => {
  try {
    await service.markAllAsRead();
    res.json({ success: true, data: { message: 'All notifications marked as read' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const created = await service.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_FAILED', message: error.message } });
  }
});

export const notificationsRouter = router;

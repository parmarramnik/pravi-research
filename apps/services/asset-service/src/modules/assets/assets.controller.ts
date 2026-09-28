import { Router, Request, Response } from 'express';
import multer from 'multer';
import { AssetsService } from './assets.service';
import { StorageService } from '../../storage/minio';
import { prisma } from '../../database/prisma';

const router = Router();
const assetsService = new AssetsService();
const storageService = StorageService.getInstance();
const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } }); // 25MB max

// 1. Get Assets List with pagination & filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await assetsService.findAll(req.query);
    res.json({ success: true, data: result.assets, meta: result.meta });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'ASSETS_FETCH_ERROR', message: error.message } });
  }
});

// 2. Get Map GeoJSON Markers
router.get('/map', async (req: Request, res: Response) => {
  try {
    const markers = await assetsService.getMapMarkers(req.query as any);
    res.json({ success: true, data: markers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'MAP_MARKERS_ERROR', message: error.message } });
  }
});

// 3. Get Dashboard Counts & Statistics
router.get('/statistics', async (_req: Request, res: Response) => {
  try {
    const stats = await assetsService.getDashboardStatistics();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'STATS_FETCH_ERROR', message: error.message } });
  }
});

// 4. Get Asset by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const asset = await assetsService.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, error: { code: 'ASSET_NOT_FOUND', message: 'Asset not found' } });
    }
    res.json({ success: true, data: asset });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'ASSET_FETCH_ERROR', message: error.message } });
  }
});

// 5. Create Asset
router.post('/', async (req: Request, res: Response) => {
  try {
    const created = await assetsService.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'ASSET_CREATION_FAILED', message: error.message } });
  }
});

// 6. Update Asset
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await assetsService.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: { code: 'ASSET_NOT_FOUND', message: 'Asset not found' } });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'ASSET_UPDATE_FAILED', message: error.message } });
  }
});

// 7. Delete Asset
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await assetsService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: { code: 'ASSET_NOT_FOUND', message: 'Asset not found' } });
    }
    res.json({ success: true, data: { message: 'Asset deleted successfully' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'ASSET_DELETE_FAILED', message: error.message } });
  }
});

// 8. Get Asset Dependencies & Failure Impact Simulation
router.get('/:id/dependencies', async (req: Request, res: Response) => {
  try {
    const graph = await assetsService.getDependencyGraph(req.params.id);
    if (!graph) {
      return res.status(404).json({ success: false, error: { code: 'ASSET_NOT_FOUND', message: 'Asset not found' } });
    }
    res.json({ success: true, data: graph });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'DEPENDENCY_GRAPH_ERROR', message: error.message } });
  }
});

// 9. Add Dependency Link
router.post('/:id/dependencies', async (req: Request, res: Response) => {
  try {
    const { targetAssetId, relationship, criticality, notes } = req.body;
    const link = await assetsService.addDependency(req.params.id, targetAssetId, relationship, criticality, notes);
    res.status(201).json({ success: true, data: link });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'DEPENDENCY_ADD_FAILED', message: error.message } });
  }
});

// 10. Remove Dependency Link
router.delete('/:id/dependencies/:depId', async (req: Request, res: Response) => {
  try {
    await assetsService.removeDependency(req.params.depId);
    res.json({ success: true, data: { message: 'Dependency removed' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'DEPENDENCY_REMOVE_FAILED', message: error.message } });
  }
});

// 11. Upload File (MinIO)
router.post('/:id/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file provided' } });
    }

    const { storageKey, url } = await storageService.upload(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      `assets/${req.params.id}`
    );

    const doc = await prisma.assetDocument.create({
      data: {
        assetId: req.params.id,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        storageKey,
        url,
        uploadedBy: (req as any).user?.name || 'System Admin',
      },
    });

    res.status(201).json({ success: true, data: doc });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'UPLOAD_FAILED', message: error.message } });
  }
});

// 12. Stream File Download from MinIO
router.get('/files/:key(*)', async (req: Request, res: Response) => {
  try {
    const stream = await storageService.getObjectStream(req.params.key);
    stream.pipe(res);
  } catch (error: any) {
    res.status(404).json({ success: false, error: { code: 'FILE_NOT_FOUND', message: 'Object not found' } });
  }
});

export const assetsRouter = router;

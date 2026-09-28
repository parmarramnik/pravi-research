import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AiAssistantService } from './services/ai.service';
import { StructuredLogger } from '@infrasphere/shared-utils';

dotenv.config();

const logger = new StructuredLogger('AiService:Main');
const app = express();
const port = process.env.PORT || 3005;
const aiService = new AiAssistantService();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    service: 'ai-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Chat Endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { query, assetId, history } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: { code: 'EMPTY_QUERY', message: 'Query string is required' } });
    }

    const response = await aiService.chat(query, assetId, history);
    res.json({ success: true, data: response });
  } catch (error: any) {
    logger.error('Error handling AI chat request', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'AI_CHAT_ERROR', message: error.message } });
  }
});

// Direct Explain Risk Endpoint
app.post('/api/ai/explain-risk/:assetId', async (req: Request, res: Response) => {
  try {
    const assetId = req.params.assetId;
    const response = await aiService.chat('Explain why this asset was calculated at its current risk level', assetId);
    res.json({ success: true, data: response });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'EXPLAIN_RISK_ERROR', message: error.message } });
  }
});

app.listen(port, () => {
  logger.info(`AI Service listening on port ${port}`);
});

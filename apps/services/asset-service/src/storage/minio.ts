import { Client as MinioClient } from 'minio';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { StructuredLogger } from '@infrasphere/shared-utils';

const logger = new StructuredLogger('AssetService:Storage');

export class StorageService {
  private static instance: StorageService;
  private client: MinioClient | null = null;
  private bucket: string;
  private useLocalFallback: boolean = false;
  private localStorageDir: string;

  private constructor() {
    const endPoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = parseInt(process.env.MINIO_PORT || '9000', 10);
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    const accessKey = process.env.MINIO_ACCESS_KEY || 'infrasphere_admin';
    const secretKey = process.env.MINIO_SECRET_KEY || 'infrasphere_password';
    this.bucket = process.env.MINIO_BUCKET_NAME || 'infrasphere-assets';
    this.localStorageDir = process.env.LOCAL_STORAGE_DIR || path.resolve(process.env.TEMP || '/tmp', 'infrasphere-uploads');

    if (!fs.existsSync(this.localStorageDir)) {
      fs.mkdirSync(this.localStorageDir, { recursive: true });
    }

    try {
      this.client = new MinioClient({
        endPoint,
        port,
        useSSL,
        accessKey,
        secretKey,
      });
      this.ensureBucket();
    } catch (err: any) {
      logger.warn('MinIO client initialization failed, falling back to local storage', { error: err.message });
      this.useLocalFallback = true;
    }
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private async ensureBucket() {
    if (!this.client || this.useLocalFallback) return;
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, 'us-east-1');
        logger.info('Created MinIO bucket', { bucket: this.bucket });
      }
    } catch (err: any) {
      logger.warn('MinIO bucket unreachable, active fallback to local storage enabled', { error: err.message });
      this.useLocalFallback = true;
    }
  }

  public async upload(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    prefix: string = 'assets'
  ): Promise<{ storageKey: string; url: string }> {
    const ext = originalName.split('.').pop() || 'bin';
    const uniqueId = crypto.randomUUID();
    const storageKey = `${prefix}/${uniqueId}.${ext}`;

    if (!this.useLocalFallback && this.client) {
      try {
        await this.ensureBucket();
        await this.client.putObject(this.bucket, storageKey, fileBuffer, fileBuffer.length, {
          'Content-Type': mimeType,
        });
        const url = `/api/assets/files/${encodeURIComponent(storageKey)}`;
        logger.info('Uploaded file to MinIO object storage', { storageKey, bucket: this.bucket });
        return { storageKey, url };
      } catch (err: any) {
        logger.warn('MinIO putObject failed, writing to resilient local storage', { error: err.message });
        this.useLocalFallback = true;
      }
    }

    // Local resilient storage fallback
    const targetDir = path.join(this.localStorageDir, prefix);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const filePath = path.join(this.localStorageDir, storageKey);
    fs.writeFileSync(filePath, fileBuffer);
    const url = `/api/assets/files/${encodeURIComponent(storageKey)}`;
    logger.info('Uploaded file to persistent local storage', { storageKey, filePath });
    return { storageKey, url };
  }

  public async getObjectStream(storageKey: string): Promise<Readable> {
    if (!this.useLocalFallback && this.client) {
      try {
        return await this.client.getObject(this.bucket, storageKey);
      } catch (err: any) {
        logger.warn('MinIO getObject failed, attempting local fallback stream', { error: err.message });
      }
    }

    const filePath = path.join(this.localStorageDir, storageKey);
    if (fs.existsSync(filePath)) {
      return fs.createReadStream(filePath);
    }
    throw new Error(`Storage file not found: ${storageKey}`);
  }
}

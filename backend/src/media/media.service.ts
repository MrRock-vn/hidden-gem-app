import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import * as path from 'path';

@Injectable()
export class MediaService {
  private s3Client: S3Client;
  private useS3: boolean;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get('AWS_S3_BUCKET', 'hidden-gem-media');

    // Check if S3 credentials are configured
    const accessKey = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretKey = this.configService.get('AWS_SECRET_ACCESS_KEY');

    this.useS3 =
      accessKey &&
      secretKey &&
      accessKey !== 'your_key' &&
      secretKey !== 'your_secret';

    if (this.useS3) {
      this.s3Client = new S3Client({
        region: this.configService.get('AWS_REGION', 'ap-southeast-1'),
        credentials: {
          accessKeyId: accessKey!,
          secretAccessKey: secretKey!,
        },
      });
    }
  }

  /**
   * Optimize image using Sharp
   * - Resize to max dimensions
   * - Convert to WebP (smaller file size)
   * - Compress
   */
  async optimizeImage(
    buffer: Buffer,
    options?: { width?: number; height?: number; quality?: number },
  ): Promise<Buffer> {
    try {
      const width = options?.width || 1200;
      const height = options?.height || 1200;
      const quality = options?.quality || 80;

      let pipeline = sharp(buffer).resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      });

      // Convert to WebP with compression
      pipeline = pipeline.webp({ quality });

      return await pipeline.toBuffer();
    } catch (error) {
      throw new BadRequestException(
        'Lỗi xử lý ảnh. Vui lòng kiểm tra lại file',
      );
    }
  }

  /**
   * Generate thumbnail for preview
   */
  async generateThumbnail(buffer: Buffer, size: number = 300): Promise<Buffer> {
    try {
      return await sharp(buffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 70 })
        .toBuffer();
    } catch (error) {
      throw new BadRequestException('Lỗi tạo thumbnail');
    }
  }

  /**
   * Upload file to S3 or local storage
   */
  async uploadFile(
    buffer: Buffer,
    type: 'place-image' | 'avatar' | 'thumbnail' | 'chat-image',
    originalName: string,
  ): Promise<string> {
    const fileExtension = '.webp'; // Sharp output is WebP
    const fileName = `${uuid()}${fileExtension}`;
    const folderPath = `${type}s/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const fullPath = `${folderPath}/${fileName}`;

    if (this.useS3) {
      // Upload to S3
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: fullPath,
          Body: buffer,
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000', // 1 year cache
        }),
      );

      // Return CloudFront URL or S3 URL
      const cloudFrontDomain = this.configService.get('AWS_CLOUDFRONT_DOMAIN');
      if (cloudFrontDomain) {
        return `https://${cloudFrontDomain}/${fullPath}`;
      }

      const region = this.configService.get('AWS_REGION');
      return `https://${this.bucket}.s3.${region}.amazonaws.com/${fullPath}`;
    } else {
      // Fallback to local storage
      const fs = await import('fs/promises');
      const uploadDir = path.join(process.cwd(), 'uploads', folderPath);

      try {
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, fileName), buffer);
        return `/uploads/${folderPath}/${fileName}`;
      } catch (error) {
        throw new BadRequestException('Lỗi lưu file');
      }
    }
  }

  /**
   * Process place images: optimize + upload
   */
  async processPlaceImages(files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const urls: string[] = [];

    for (const file of files) {
      // Validate file
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException(
          `File ${file.originalname} không phải là ảnh`,
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        throw new BadRequestException(
          `File ${file.originalname} quá lớn (max 10MB)`,
        );
      }

      // Optimize image
      const optimized = await this.optimizeImage(file.buffer, {
        width: 1200,
        height: 1200,
        quality: 80,
      });

      // Upload to S3 or local
      const url = await this.uploadFile(
        optimized,
        'place-image',
        file.originalname,
      );
      urls.push(url);
    }

    return urls;
  }

  /**
   * Process avatar: optimize + upload
   */
  async processAvatar(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('Không có file ảnh');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File không phải là ảnh');
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit for avatars
      throw new BadRequestException('File quá lớn (max 5MB)');
    }

    // Optimize avatar (square)
    const optimized = await this.optimizeImage(file.buffer, {
      width: 400,
      height: 400,
      quality: 85,
    });

    return this.uploadFile(optimized, 'avatar', file.originalname);
  }

  /**
   * Process chat image: optimize + upload
   */
  async processChatImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('Không có file ảnh');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('File không phải là ảnh');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File quá lớn (max 10MB)');
    }

    const optimized = await this.optimizeImage(file.buffer, {
      width: 1200,
      height: 1200,
      quality: 80,
    });

    return this.uploadFile(optimized, 'chat-image', file.originalname);
  }
}

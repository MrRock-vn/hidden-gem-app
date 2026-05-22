import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Validates critical environment variables on application startup
 */
@Injectable()
export class EnvValidationService {
  private readonly logger = new Logger(EnvValidationService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Validate all required environment variables
   * Called during application initialization
   */
  validateEnvironment(): void {
    this.logger.log('Validating environment variables...');

    const requiredVars = {
      // Essential
      NODE_ENV: ['development', 'staging', 'production'],
      PORT: null,

      // Database
      DATABASE_HOST: null,
      DATABASE_PORT: null,
      DATABASE_NAME: null,
      DATABASE_USERNAME: null, // Used by app.module.ts TypeORM config
      DATABASE_PASSWORD: null,

      // Redis
      REDIS_HOST: null,
      REDIS_PORT: null,

      // JWT
      JWT_SECRET: null,
      JWT_REFRESH_SECRET: null,
    };

    const warnings = {
      // Optional but recommended
      FIREBASE_SERVICE_ACCOUNT_PATH: 'Push notifications disabled',
      GOOGLE_CLIENT_ID: 'Google OAuth disabled',
      APPLE_CLIENT_ID: 'Apple OAuth disabled',
      ELASTICSEARCH_URL: 'Full-text search disabled',
      AWS_S3_BUCKET: 'Image optimization disabled',
      SENTRY_DSN: 'Error tracking disabled',
    };

    // Check required variables
    const missing: string[] = [];
    const invalid: { [key: string]: string } = {};

    for (const [key, validValues] of Object.entries(requiredVars)) {
      const value = this.configService.get<string>(key);

      if (!value) {
        missing.push(key);
      } else if (Array.isArray(validValues) && !validValues.includes(value)) {
        invalid[key] =
          `Must be one of: ${validValues.join(', ')}. Got: ${value}`;
      }
    }

    // Check optional warnings
    for (const [key, message] of Object.entries(warnings)) {
      const value = this.configService.get<string>(key);
      if (!value) {
        this.logger.warn(`⚠️  ${key} not configured - ${message}`);
      }
    }

    // Throw error if required variables missing
    if (missing.length > 0) {
      const error = `Missing required environment variables:\n${missing.map((v) => `  - ${v}`).join('\n')}`;
      this.logger.error(error);
      throw new Error(error);
    }

    // Throw error if invalid values
    if (Object.keys(invalid).length > 0) {
      const error = `Invalid environment variable values:\n${Object.entries(
        invalid,
      )
        .map(([key, msg]) => `  - ${key}: ${msg}`)
        .join('\n')}`;
      this.logger.error(error);
      throw new Error(error);
    }

    this.logger.log('✓ All environment variables valid');
    this.printEnvironmentInfo();
  }

  /**
   * Print safe environment info (no secrets)
   */
  private printEnvironmentInfo(): void {
    const nodeEnv = this.configService.get('NODE_ENV');
    const port = this.configService.get('PORT');
    const dbHost = this.configService.get('DATABASE_HOST');
    const elasticsearchUrl = this.configService.get('ELASTICSEARCH_URL');
    const s3Bucket = this.configService.get('AWS_S3_BUCKET');

    this.logger.log(`
    ╔════════════════════════════════════════════╗
    ║     Hidden Gem Backend Configuration       ║
    ╠════════════════════════════════════════════╣
    ║ Environment: ${nodeEnv?.padEnd(30) || 'unknown'} ║
    ║ Port: ${port?.padEnd(32) || 'unknown'} ║
    ║ Database: ${dbHost?.padEnd(30) || 'unknown'} ║
    ║ Elasticsearch: ${elasticsearchUrl ? '✓ Enabled' : '✗ Disabled'} ${' '.repeat(20)} ║
    ║ AWS S3: ${s3Bucket ? '✓ Enabled' : '✗ Disabled'} ${' '.repeat(24)} ║
    ╚════════════════════════════════════════════╝
    `);
  }

  /**
   * Get typed config value with default
   */
  getConfig<T = string>(key: string, defaultValue?: T): T | undefined {
    if (defaultValue !== undefined) {
      return this.configService.get<T>(key, defaultValue);
    }
    return this.configService.get<T>(key);
  }

  /**
   * Get boolean config value
   */
  getBoolean(key: string, defaultValue = false): boolean {
    const value = this.configService.get<string>(key);
    if (!value) return defaultValue;
    return ['true', '1', 'yes', 'enabled'].includes(value.toLowerCase());
  }

  /**
   * Get number config value
   */
  getNumber(key: string, defaultValue = 0): number {
    const value = this.configService.get<string>(key);
    if (!value) return defaultValue;
    const num = parseInt(value, 10);
    return isNaN(num) ? defaultValue : num;
  }

  /**
   * Get comma-separated values as array
   */
  getArray(key: string, defaultValue: string[] = []): string[] {
    const value = this.configService.get<string>(key);
    if (!value) return defaultValue;
    return value.split(',').map((v) => v.trim());
  }
}

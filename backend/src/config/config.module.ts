import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvValidationService } from './env-validation.service';

/**
 * Configuration Module
 * Handles environment variables validation and access
 */
@Module({
  imports: [ConfigModule],
  providers: [EnvValidationService],
  exports: [EnvValidationService, ConfigModule],
})
export class AppConfigModule {}

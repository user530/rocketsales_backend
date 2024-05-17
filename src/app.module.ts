import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService, EntitiesManipulationService } from './services';
import { ConfigModule } from '@nestjs/config';
import { amoConfig } from './config/amoCRM.config';
import { plainToClass } from 'class-transformer';
import { AmoConfig } from './config/amoCRM.schema';
import { validateSync } from 'class-validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [amoConfig],
      isGlobal: true,
      validate: (config: Record<string, unknown>) => {
        // Transform using schema
        const transformedConfig = plainToClass(AmoConfig, config);

        // Validation errors
        const errors = validateSync(transformedConfig, { skipMissingProperties: false });

        // Handle missing or incorrect data
        if (errors.length > 0)
          throw new Error(errors.toString());

        return transformedConfig;
      }
    }),
  ],
  controllers: [ApiController],
  providers: [ApiService, EntitiesManipulationService],
})
export class AppModule { }

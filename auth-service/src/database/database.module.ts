import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from '@nestjs-modules/ioredis';
import databaseConfig from '../config/database.config';
// import { AdminSeeder } from './seeders/admin.seeder';
// import { DatabaseSeederService } from './seeders/database-seeder.service';
import { BcryptService } from 'src/common/services/bcrypt.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('database.mongo.uri'),
        onConnectionCreate: (connection) => {
          connection.on('connected', () => {
            console.log('✅ MongoDB connected');
          });

          connection.on('error', (err) => {
            console.error('❌ MongoDB error:', err);
          });

          return connection;
        },
      }),
    }),
    RedisModule.forRootAsync({
      useFactory: () => {
        const redisConfig = databaseConfig().database.redis;
        // If URL is provided, use it
        if (redisConfig.url) {
          return {
            type: 'single',
            url: redisConfig.url,
          };
        }

        // Otherwise construct from individual config
        let url = `redis://${redisConfig.host}:${redisConfig.port}`;
        if (redisConfig.password) {
          url = `redis://:${redisConfig.password}@${redisConfig.host}:${redisConfig.port}`;
        }
        if (redisConfig.db) {
          url += `/${redisConfig.db}`;
        }

        return {
          type: 'single',
          url,
          options: {
            retryStrategy: (times: number) => {
              if (times > redisConfig.retryAttempts) {
                return null; // Stop retrying
              }
              return Math.min(times * redisConfig.retryDelay, 3000);
            },
            enableReadyCheck: true,
            maxRetriesPerRequest: 3,
          },
        };
      },
    }),
  ],
  exports: [RedisModule, MongooseModule],
  providers: [BcryptService /* AdminSeeder */ /* DatabaseSeederService */],
})
export class DatabaseModule {}

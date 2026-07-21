import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AdminSeeder } from './admin.seeder';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  constructor(private readonly adminSeeder: AdminSeeder) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.adminSeeder.seed();
  }
}

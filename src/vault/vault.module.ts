import { Module } from '@nestjs/common';
import { VaultService } from './vault.service';
import { VaultController } from './vault.controller';
import { Vault } from './vault.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Vault])],
  controllers: [VaultController],
  providers: [VaultService],
})
export class VaultModule {}

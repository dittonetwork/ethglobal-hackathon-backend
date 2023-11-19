import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CreateVaultDto } from './vault.dto';
import { VaultService } from './vault.service';

@Controller('vault')
export class VaultController {
  constructor(private readonly vaultService: VaultService) {}

  @Get('/:address')
  async getVaultsByUserAddress(
    @Param('address') address: string,
  ): Promise<{ address: string; chainId: number }[]> {
    return this.vaultService.getVaultsByUserAddress(address);
  }

  @Post()
  async addVault(@Body() createVaultDto: CreateVaultDto) {
    return this.vaultService.addVault(createVaultDto);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Vault } from './vault.entity';
import { CreateVaultDto } from './vault.dto';

@Injectable()
export class VaultService {
  constructor(
    @InjectRepository(Vault)
    private vaultRepository: Repository<Vault>,
  ) {}

  async addVault(createVaultDto: CreateVaultDto): Promise<Vault> {
    const newVault = this.vaultRepository.create(createVaultDto);
    return this.vaultRepository.save(newVault);
  }

  async getVaultsByUserAddress(
    address: string,
  ): Promise<{ address: string; chainId: number }[]> {
    const vaults = await this.vaultRepository.find({
      where: { userAddress: ILike(address) },
    });
    return vaults.map((vault) => ({
      address: vault.address,
      chainId: vault.chainid,
    }));
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { AccountDto } from './account.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async addAccount(accountDto: AccountDto): Promise<Account> {
    const newAccount = this.accountRepository.create(accountDto);
    return this.accountRepository.save(newAccount);
  }
}

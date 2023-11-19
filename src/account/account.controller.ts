import { Controller, Post, Body } from '@nestjs/common';
import { AccountDto } from './account.dto';
import { AccountService } from './account.service';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async addAccount(@Body() createAccountDto: AccountDto) {
    return this.accountService.addAccount(createAccountDto);
  }
}

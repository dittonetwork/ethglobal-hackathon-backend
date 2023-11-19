import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/account/account.entity';
import { Event } from 'src/event/event.entity';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  async getNotifications(addresses: string[]): Promise<string[]> {
    let notifications: string[] = [];
    for (const address of addresses) {
      const account = await this.accountRepository.findOne({
        where: { address: ILike(address) },
      });
      if (account && account.notify) {
        const events = await this.eventRepository.find({
          where: { accountAddress: ILike(address), send: false },
          order: { date: 'DESC' },
        });
        notifications = events.map((event) => event.name);
        for (const event of events) {
          event.send = true;
          await this.eventRepository.save(event);
        }
      }
    }
    return notifications;
  }

  async addNotificationAddress(address: string): Promise<any> {
    let account = await this.accountRepository.findOne({
      where: { address },
    });
    if (!account) {
      console.log(address);
      account = this.accountRepository.create({ address, notify: true });
      await this.accountRepository.save(account);
      return { status: 'Account created and notification enabled' };
    }
    account.notify = true;
    await this.accountRepository.save(account);
    return { status: 'Notification enabled' };
  }

  async deleteNotificationAddress(address: string): Promise<any> {
    const account = await this.accountRepository.findOne({
      where: { address },
    });
    if (account) {
      account.notify = false;
      await this.accountRepository.save(account);
      return { status: 'Notification disabled' };
    }
    return { status: 'Account not found' };
  }

  async getNotificationState(address: string): Promise<boolean> {
    const account = await this.accountRepository.findOne({
      where: { address },
    });
    if (account) {
      return account.notify;
    }
    throw new NotFoundException('Account not found');
  }
}

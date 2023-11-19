import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('notifications')
  async getNotifications(
    @Body('addresses') addresses: string[],
  ): Promise<any[]> {
    console.log(addresses);
    return this.notificationsService.getNotifications(addresses);
  }

  @Post('add-address')
  async addNotificationAddress(@Body('address') address: string): Promise<any> {
    return this.notificationsService.addNotificationAddress(address);
  }

  @Post('del-address')
  async deleteNotificationAddress(
    @Body('address') address: string,
  ): Promise<any> {
    return this.notificationsService.deleteNotificationAddress(address);
  }

  @Get('state/:address')
  async getNotificationState(
    @Param('address') address: string,
  ): Promise<boolean> {
    return this.notificationsService.getNotificationState(address);
  }
}

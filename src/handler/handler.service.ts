import { Injectable, Logger } from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { Web3DataProviderService } from './web3dataProvider.service';
import { EventListenerService } from 'src/listener/eventListener.service';

@Injectable()
export class BlockchainEventListenerManager {
  private logger = new Logger(BlockchainEventListenerManager.name);

  constructor(
    private readonly web3DataProviderService: Web3DataProviderService,
    private readonly listenerService: EventListenerService,
  ) {}

  // @Cron(CronExpression.EVERY_MINUTE)
  handleScheduledListening() {
    const chainIds = this.web3DataProviderService.getChains();
    Promise.all(
      chainIds.map(async (chainId) => {
        const provider = this.web3DataProviderService.getProvider(chainId);
        if (provider) {
          await this.listenerService.processLastLogs(
            provider,
            chainId.toString(),
          );
        }
      }),
    );
  }
}

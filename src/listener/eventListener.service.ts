import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Web3, { FMT_BYTES, FMT_NUMBER, LogBase } from 'web3';
import { LastBlock } from './lastBlock.model';
import {
  ParsedTransaction,
  TransactionParserService,
} from './transactionParser.service';
import { abiInterface } from './abiInterface';

const createEvent = '';
const actionEvent = '';

const topics = [
  abiInterface.getEvent(createEvent)?.topicHash,
  abiInterface.getEvent(actionEvent)?.topicHash,
] as string[];

@Injectable()
export class EventListenerService {
  private logger = new Logger(EventListenerService.name);

  constructor(
    // web3DataProviderService: Web3DataProviderService,
    private readonly transactionParserService: TransactionParserService,
    @InjectRepository(LastBlock)
    private readonly lastBlockRepository: Repository<LastBlock>,
  ) {}

  async processLastLogs(provider: Web3, chainId: string) {
    try {
      const lastScannedBlock = await this.getLastScannedBlockNumber(chainId);
      if (!lastScannedBlock) {
        this.logger.debug('Initializing last scanned block number');
        try {
          const lastBlock = await provider.eth.getBlockNumber();
          await this.updateLastScannedBlockNumber(lastBlock, chainId);
          return;
        } catch (e) {
          this.logger.error(`Error while getting last block number. ${e}`);
          return;
        }
      } else {
        const currentBlock = await provider.eth.getBlockNumber();
        try {
          const logs = await provider.eth.getPastLogs({
            topics: [topics],
            fromBlock: lastScannedBlock + 1,
            toBlock: currentBlock,
          });
          if (logs && logs.length) {
            this.logger.debug(`Found ${logs.length} logs for processing.`);
            this.processLogs(provider, chainId, logs);
          }
        } catch (e) {
          this.logger.error(
            `Error while processing logs for block ${currentBlock} ${e} ${lastScannedBlock}`,
          );
          return;
        }
        await this.updateLastScannedBlockNumber(currentBlock, chainId);
      }
    } catch (e) {
      this.logger.error(`Error while processing logs ${chainId} ${e}`);
    }
  }

  async processLogs(
    provider: Web3,
    chainId: string,
    logs: (LogBase<bigint, string> | string)[],
  ) {
    const hashes = this.getTransactionsHashes(logs);
    hashes.forEach(async (hash) => {
      try {
        this.logger.debug(`Process logs for transaction hash ${hash}`);
        const tx = await provider.eth.getTransactionReceipt(hash, {
          bytes: FMT_BYTES.HEX,
          number: FMT_NUMBER.NUMBER,
        });
        const parsedTx = this.transactionParserService.parseTransaction(tx);
        const txLogs = parsedTx.logs;
        console.log(txLogs);
        //Events
        this.storeEvent(chainId, parsedTx);
        //Termination states (success, canceled)
      } catch (e) {
        this.logger.error(`Error while processing logs for tx ${hash}`);
      }
    });
  }

  storeEvent(chainId: string, tx: ParsedTransaction) {
    // const workflowKey = this.getWorkflowKeyEvent(tx.logs)?.args[0];
    // const vaultAddress = this.getWorkflowVaultEvent(tx.logs)?.address;
    try {
      console.log(chainId, tx);
    } catch (e) {
      this.logger.error(
        '', // `Error while processing event: vaultAddress: ${vaultAddress}, workflowKey: ${workflowKey}`,
      );
    }
  }

  /* 
  getWorkflowKeyEvent(logs: ParsedLog[]) {
    return logs.find((log) => workflowKeyEvents.some((e) => e === log.name));
  }

  getWorkflowVaultEvent(logs: ParsedLog[]) {
    return logs.find((log) =>
      workflowVaultAddressEvents.some((e) => e === log.name),
    );
  } */

  getTransactionsHashes(logs: (LogBase<bigint, string> | string)[]) {
    const hashes = new Set<string>();
    logs.forEach((log) => {
      if (typeof log === 'string' || !log.transactionHash) {
        return;
      }
      hashes.add(log.transactionHash);
    });
    return [...hashes];
  }

  async getLastScannedBlockNumber(chainId: string) {
    const lastScannedBlock = await this.lastBlockRepository.findOneBy({
      chainId,
    });
    if (lastScannedBlock) return Number(lastScannedBlock.blockNumber);
    return null;
  }

  async updateLastScannedBlockNumber(blockNumber: bigint, chainId: string) {
    let lastBlock = await this.lastBlockRepository.findOneBy({ chainId });
    if (!lastBlock) {
      lastBlock = this.lastBlockRepository.create({
        blockNumber: String(blockNumber),
        chainId,
      });
    } else {
      lastBlock.blockNumber = String(blockNumber);
    }
    return this.lastBlockRepository.save(lastBlock);
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import Web3, { FMT_BYTES, FMT_NUMBER, LogBase } from 'web3';
import { LastBlock } from './lastBlock.model';
import {
  ParsedTransaction,
  TransactionParserService,
} from './transactionParser.service';
import { abiInterface } from './abiInterface';
import { Vault } from 'src/vault/vault.entity';
import { Event } from 'src/event/event.entity';
import { Account } from 'src/account/account.entity';

const createEvent = 'DittoDimondVaultCreated';
const actionEvent = 'DittoCollectedTokenAndExecutedAction';

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
    @InjectRepository(Vault)
    private readonly vaultRepository: Repository<Vault>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
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
      }

      const currentBlock = await provider.eth.getBlockNumber();
      const logs = await provider.eth.getPastLogs({
        topics: [topics],
        fromBlock: lastScannedBlock,
        toBlock: currentBlock,
      });
      if (logs && logs.length) {
        this.logger.debug(`Found ${logs.length} logs for processing.`);
        this.processLogs(provider, chainId, logs);
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
        //Events
        await this.storeEvent(chainId, parsedTx);
        //Termination states (success, canceled)
      } catch (e) {
        this.logger.error(`Error while processing logs for tx ${hash}`);
      }
    });
  }

  async storeEvent(chainId: string, tx: ParsedTransaction) {
    try {
      const eventText = 'Action has been successfully executed';
      await Promise.all(
        tx.logs.map(async (log) => {
          if (log.name === 'DittoDimondVaultCreated') {
            const vault = log.address;
            const owner = tx.from;
            await this.saveVault(vault, owner, chainId);
          } else if (log.name === 'DittoCollectedTokenAndExecutedAction') {
            console.log(log);
            const vault = log.address;
            const tx = log.transactionHash;
            await this.saveEvent(vault, chainId, tx, eventText);
          }
        }),
      );
    } catch (e) {
      this.logger.error(`Error while processing event`);
    }
  }

  async saveVault(vaultAddress: string, userAddress: string, chainId: string) {
    const vault = new Vault();
    const account = await this.getAccountAddress(userAddress);
    vault.address = vaultAddress;
    vault.userAddress = userAddress;
    vault.chainId = parseInt(chainId);
    await this.vaultRepository.save(vault);
    if (!account) {
      const acc = new Account();
      acc.address = userAddress;
      acc.notify = true;
      await this.accountRepository.save(acc);
    }
  }

  async saveEvent(
    vault: string,
    chainId: string,
    tx: string,
    eventText: string,
  ) {
    console.log(
      'DittoCollectedTokenAndExecutedAction',
      vault,
      chainId,
      tx,
      eventText,
    );
    const account = await this.getAccount(vault);
    if (account) {
      const event = new Event();
      event.vaultAddress = vault;
      const account = await this.getAccount(vault);
      event.accountAddress = account;
      event.name = `${eventText} (chainId ${chainId})`;
      event.description = 'DittoCollectedTokenAndExecutedAction';
      event.date = 0;
      event.send = false;
      await this.eventRepository.save(event);
    }
  }

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

  async getAccount(vault_address: string): Promise<string | null> {
    const vault = await this.vaultRepository.findOne({
      where: {
        address: ILike(vault_address),
      },
    });
    return vault ? vault.userAddress : null;
  }

  async getAccountAddress(address: string): Promise<string | null> {
    const account = await this.accountRepository.findOne({
      where: {
        address: ILike(address),
      },
    });
    return account ? account.address : null;
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

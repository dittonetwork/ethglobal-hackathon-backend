import { Injectable } from '@nestjs/common';
import { Log, LogBase, TransactionReceipt } from 'web3';
import { abiInterface } from './abiInterface';
import { LogDescription } from 'ethers';

export type ParsedLog = LogBase<bigint, string> & LogDescription;

export type ParsedTransaction = Omit<TransactionReceipt, 'logs'> & {
  logs: ParsedLog[];
  timestamp?: Date;
};

@Injectable()
export class TransactionParserService {
  parseTransaction(tx: TransactionReceipt): ParsedTransaction {
    const parsedLogs = this.parseLogs(tx.logs);
    return { ...tx, logs: parsedLogs };
  }

  parseLogs(logs: (LogBase<bigint, string> | string | Log)[]): ParsedLog[] {
    return logs
      .map((log) => {
        try {
          if (typeof log === 'string') {
            return null;
          }
          const { data, topics } = log;
          if (!topics || !data) return null;
          const parsed = abiInterface.parseLog({
            topics: topics as string[],
            data: data as string,
          });
          if (!parsed) return null;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { fragment, ...rest } = parsed;
          return {
            ...log,
            ...rest,
            args: parsed.args.map((arg) =>
              typeof arg === 'bigint' ? Number(arg) : arg,
            ),
          };
        } catch (e) {
          return null;
        }
      })
      .filter((log): log is ParsedLog => Boolean(log));
  }
}

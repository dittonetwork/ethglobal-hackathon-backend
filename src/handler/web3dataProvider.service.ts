import { Injectable, Logger } from '@nestjs/common';
import Web3 from 'web3';

interface NetworkConfig {
  rpcUrl: string | undefined;
  blockExplorerUrl: string;
  name: string;
}

const AVAX_FUJI_RPC_PROVIDER = 'https://api.avax-test.network/ext/bc/C/rpc';
const POLYGON_MUMBAI_RPC_PROVIDER = 'https://rpc-mumbai.maticvigil.com/';
const OPTIMISM_GOERLI_RPC_PROVIDER = 'https://opt-goerli.g.alchemy.com/v2/demo';

@Injectable()
export class Web3DataProviderService {
  private logger = new Logger(Web3DataProviderService.name);
  private providers: Record<string, Web3> = {};
  private networks: Record<number, NetworkConfig>;

  constructor() {
    const networks: Record<number, NetworkConfig> = {
      43113: {
        rpcUrl: AVAX_FUJI_RPC_PROVIDER,
        blockExplorerUrl: 'https://testnet.snowtrace.io/',
        name: 'avax_fuji',
      },
      80001: {
        rpcUrl: POLYGON_MUMBAI_RPC_PROVIDER,
        blockExplorerUrl: 'https://polygonscan.com/',
        name: 'polygon_mumbai',
      },
      420: {
        rpcUrl: OPTIMISM_GOERLI_RPC_PROVIDER,
        blockExplorerUrl: 'https://goerli-optimism.etherscan.io/',
        name: 'optimism_goerli',
      },
    };
    this.networks = networks;
    Object.entries(networks).map(([chainId, networkConfig]) => {
      if (networkConfig?.rpcUrl) {
        this.providers[Number(chainId)] = new Web3(networkConfig.rpcUrl);
      }
    });
  }

  getProvider(chainId: string): Web3 {
    return this.providers[Number(chainId)];
  }

  getChains() {
    const chainIds = Object.keys(this.networks);
    return chainIds;
  }

  getExplorer(chainId: string): string | undefined {
    const network = this.networks[Number(chainId)];
    return network ? network.blockExplorerUrl : undefined;
  }

  async getTransactionTimestamp(
    blockNumber: string,
    chainId: string,
  ): Promise<Date | null> {
    try {
      const provider = this.getProvider(chainId);
      const block = await provider.eth.getBlock(blockNumber);
      const timestampNumber = Number(block.timestamp.toString());
      const date = new Date(timestampNumber * 1000);
      return date;
    } catch (e) {
      return null;
    }
  }
}

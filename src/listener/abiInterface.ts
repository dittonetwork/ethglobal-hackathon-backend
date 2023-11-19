import aaevents from './abi/aaevents';
import { Interface } from 'ethers';

export const abiInterface = new Interface([...aaevents]);

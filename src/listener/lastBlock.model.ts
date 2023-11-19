import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class LastBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chain_id', nullable: true })
  chainId: string;

  @Column({ type: 'bigint', name: 'block_number' })
  blockNumber!: string;

  @UpdateDateColumn({ name: 'updated_at' })
  createdAt!: Date;
}

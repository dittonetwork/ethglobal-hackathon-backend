import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'account_address' })
  accountAddress: string;

  @Column({ name: 'vault_address' })
  vaultAddress: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  date: number;

  @Column({ name: 'send' })
  send: boolean;
}

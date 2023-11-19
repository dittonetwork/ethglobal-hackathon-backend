import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Vault {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_address' })
  userAddress: string;

  @Column()
  address: string;

  @Column()
  chainid: number;
}

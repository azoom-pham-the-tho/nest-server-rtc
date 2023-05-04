import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Call {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'string' })
  name: string;

  @Column({ type: 'string' })
  pass: string;

  @Column({ type: 'string' })
  img: string;
}

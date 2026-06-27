import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Move } from './move.entity';
import { STARTING_FEN } from '@repo/shared';

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', default: STARTING_FEN })
  currentFen!: string;

  @Column({ type: 'varchar', length: 20, default: 'playing' })
  status!: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  result!: string | null;

  @Column({ type: 'int', default: 0 })
  moveCount!: number;

  @Column({ type: 'int', default: 3 })
  hintsRemaining!: number;

  @Column({ type: 'varchar', length: 20, default: 'medium' })
  difficulty!: string;

  @Column({ type: 'boolean', default: false })
  aiThinking!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  recentAiMove!: { uci: string; fen: string; evaluation?: number } | null;

  @OneToMany(() => Move, (move) => move.game, { cascade: true })
  moves!: Move[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Game } from './game.entity';

@Entity('moves')
export class Move {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Game, (game) => game.moves, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'game_id' })
  game!: Game;

  @Column({ type: 'uuid' })
  gameId!: string;

  @Column({ type: 'int' })
  moveNumber!: number;

  @Column({ type: 'varchar', length: 4 })
  uciMove!: string;

  @Column({ type: 'text' })
  fenBefore!: string;

  @Column({ type: 'text' })
  fenAfter!: string;

  @Column({ type: 'int', nullable: true })
  evaluationBefore!: number | null;

  @Column({ type: 'int', nullable: true })
  evaluationAfter!: number | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  classification!: string | null;

  @Column({ type: 'boolean', default: false })
  isCheck!: boolean;

  @Column({ type: 'boolean', default: false })
  isCapture!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}

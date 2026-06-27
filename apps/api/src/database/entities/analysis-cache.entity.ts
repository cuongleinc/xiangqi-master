import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('analysis_cache')
export class AnalysisCache {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 64, unique: true, name: 'fen_hash' })
  fenHash!: string;

  @Column({ type: 'text' })
  fen!: string;

  @Column({ length: 4, name: 'best_move' })
  bestMove!: string;

  @Column({ type: 'integer' })
  score!: number;

  @Column({ type: 'integer', nullable: true })
  mate!: number | null;

  @Column({ type: 'integer' })
  depth!: number;

  @Column({ type: 'simple-array', nullable: true })
  pv!: string[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'expires_at' })
  expiresAt!: Date | null;
}

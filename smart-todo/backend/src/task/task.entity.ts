import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  rawInput: string;

  @Column({ default: 'other' })
  category: string;

  @Column({ type: 'simple-json', default: '[]' })
  tags: string[];

  @Column({ default: 'medium' })
  priority: string;

  @Column({ default: 'todo' })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'integer', nullable: true })
  estimatedMinutes: number;

  @Column({ type: 'integer', nullable: true })
  actualMinutes: number;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'float', nullable: true })
  aiConfidence: number;

  @Column({ type: 'simple-json', nullable: true })
  aiSuggestions: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

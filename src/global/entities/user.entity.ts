import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProviderType } from '../enums/user.enum';

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ProviderType, nullable: false })
  provider_type: ProviderType;

  @Column({ unique: true, nullable: false })
  user_id: string;

  @Column({ nullable: true, select: false })
  passwordHash: string;

  @Column({ nullable: false })
  nickname: string;

  @Column()
  profile_image_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

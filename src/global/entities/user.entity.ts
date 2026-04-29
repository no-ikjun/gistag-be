import { Entity, PrimaryGeneratedColumn, BaseEntity, Column } from 'typeorm';
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

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' })
  updated_at: Date;
}

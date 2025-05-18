import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from '../products/product.entity';

/**
 * Enum para definir os papéis de usuário
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

/**
 * Entidade User para gerenciamento de usuários
 */
@Entity({ name: 'users' })
export class User {
  /**
   * Identificador único do usuário
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Nome de usuário
   */
  @Column({ unique: true })
  username: string;

  /**
   * Senha do usuário (hash)
   */
  @Column()
  password: string;

  /**
   * Email do usuário (opcional)
   */
  @Column({ nullable: true })
  email?: string;

  /**
   * Papel/função do usuário no sistema
   */
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  /**
   * Relação com produtos criados por este usuário
   */
  @OneToMany(() => Product, product => product.seller)
  products: Product[];
}
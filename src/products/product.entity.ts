import { User } from 'src/users/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

/**
 * Enum to define the product currency
 */
export enum Currency {
  BRL = 'BRL',
  USD = 'USD',
  SATS = 'SATS'
}

/**
 * Enum to define the product condition
 */
export enum Condition {
  NEW = 'new',
  USED = 'used'
}

/**
 * Product entity for the Bitcoin Lightning Network marketplace
 */
@Entity({ name: 'products' })
export class Product {
  /**
   * Unique product identifier
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Product title (maximum 120 characters)
   */
  @Column({ length: 120 })
  title: string;

  /**
   * Detailed product description
   */
  @Column({ type: 'text' })
  description: string;

  /**
   * Product price (in fiat or sats, depending on the currency)
   */
  @Column({ type: 'float' })
  price: number;

  /**
   * Currency used to define the price
   */
  @Column({
    type: 'enum',
    enum: Currency,
  })
  currency: Currency;

  /**
   * Available quantity in stock
   */
  @Column({ type: 'int', name: 'stock_quantity' })
  stockQuantity: number;

  /**
   * Product condition: new or used
   */
  @Column({
    type: 'enum',
    enum: Condition,
  })
  condition: Condition;

  /**
   * Indicates if the product is active for sale
   */
  @Column({ default: true })
  active: boolean;

  /**
   * Seller user ID
   */
  @Column({ name: 'seller_id' })
  sellerId: string;

  /**
   * Relationship with the seller user
   * Allows direct access to the related user object
   */
  @ManyToOne(() => User, (user: User) => user.products, {
    onDelete: 'CASCADE', // If the user is deleted, their products will be too
  })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  /**
   * Record creation date
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Record last update date
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
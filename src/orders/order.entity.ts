import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

/**
 * Enum para definir o status do pedido
 */
export enum OrderStatus {
  PENDING = 'pending',       // Pedido criado, aguardando pagamento
  PAID = 'paid',             // Pagamento confirmado
  PROCESSING = 'processing', // Em processamento pelo vendedor
  SHIPPED = 'shipped',       // Enviado
  DELIVERED = 'delivered',   // Entregue ao comprador
  CANCELLED = 'cancelled',   // Cancelado
  REFUNDED = 'refunded'      // Reembolsado
}

/**
 * Entidade Order para representar pedidos no marketplace
 */
@Entity({ name: 'orders' })
export class Order {
  /**
   * Identificador único do pedido
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * ID do comprador
   */
  @Column({ name: 'buyer_id' })
  buyerId: string;

  /**
   * Relação com o usuário comprador
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  /**
   * Status atual do pedido
   */
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  /**
   * Valor total do pedido
   */
  @Column({ type: 'float' })
  totalAmount: number;

  /**
   * Moeda utilizada no pedido
   */
  @Column()
  currency: string;

  /**
   * Itens do pedido
   */
  @ManyToMany(() => OrderItem, item => item.order)
  items: OrderItem[];

  /**
   * Endereço de entrega
   */
  @Column({ type: 'text', nullable: true })
  shippingAddress: string;

  /**
   * CEP para cálculo do frete
   */
  @Column({ nullable: true })
  zipCode: string;
  
  /**
   * ID da transação de pagamento, quando aplicável
   */
  @Column({ name: 'payment_id', nullable: true })
  paymentId: string;

  /**
   * Notas ou observações do pedido
   */
  @Column({ type: 'text', nullable: true })
  notes: string;

  /**
   * Data de criação do pedido
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Data da última atualização do pedido
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

/**
 * Entidade que representa um item específico em um pedido
 * Com quantidade e preço no momento da compra
 */
@Entity({ name: 'order_items' })
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'float' })
  price: number;

  @Column()
  currency: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
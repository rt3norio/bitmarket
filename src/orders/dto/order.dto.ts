import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../order.entity';
import { ProductDto } from '../../products/dto/produto.dto';

/**
 * DTO para representar um item do pedido nas respostas da API
 */
@Exclude()
export class OrderItemDto {
  /**
   * ID único do item do pedido
   */
  @Expose()
  @ApiProperty({
    description: 'ID único do item do pedido',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  /**
   * Informações do produto
   */
  @Expose()
  @Type(() => ProductDto)
  @ApiProperty({
    description: 'Informações do produto',
    type: ProductDto
  })
  product: ProductDto;

  /**
   * Quantidade adquirida
   */
  @Expose()
  @ApiProperty({
    description: 'Quantidade adquirida',
    example: 2
  })
  quantity: number;

  /**
   * Preço unitário no momento da compra
   */
  @Expose()
  @ApiProperty({
    description: 'Preço unitário no momento da compra',
    example: 250.50
  })
  price: number;

  /**
   * Moeda da transação
   */
  @Expose()
  @ApiProperty({
    description: 'Moeda da transação',
    example: 'BRL'
  })
  currency: string;
}

/**
 * DTO para retornar informações de pedidos
 */
@Exclude()
export class OrderDto {
  /**
   * ID único do pedido
   */
  @Expose()
  @ApiProperty({
    description: 'ID único do pedido',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  /**
   * ID do comprador
   */
  @Expose()
  @ApiProperty({
    description: 'ID do comprador',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  buyerId: string;

  /**
   * Status do pedido
   */
  @Expose()
  @ApiProperty({
    description: 'Status do pedido',
    enum: OrderStatus,
    example: OrderStatus.PENDING
  })
  status: OrderStatus;

  /**
   * Valor total do pedido
   */
  @Expose()
  @ApiProperty({
    description: 'Valor total do pedido',
    example: 501.00
  })
  totalAmount: number;

  /**
   * Moeda utilizada
   */
  @Expose()
  @ApiProperty({
    description: 'Moeda utilizada',
    example: 'BRL'
  })
  currency: string;

  /**
   * Itens do pedido
   */
  @Expose()
  @Type(() => OrderItemDto)
  @ApiProperty({
    description: 'Itens do pedido',
    type: [OrderItemDto]
  })
  items: OrderItemDto[];

  /**
   * Endereço de entrega
   */
  @Expose()
  @ApiProperty({
    description: 'Endereço de entrega',
    example: 'Rua das Flores, 123 - São Paulo, SP',
    nullable: true
  })
  shippingAddress: string;

  /**
   * CEP para cálculo do frete
   */
  @Expose()
  @ApiProperty({
    description: 'CEP para cálculo do frete',
    example: '01001-000',
    nullable: true
  })
  zipCode: string;

  /**
   * ID do pagamento
   */
  @Expose()
  @ApiProperty({
    description: 'ID do pagamento',
    example: 'ln_invoice_123456',
    nullable: true
  })
  paymentId: string;

  /**
   * Notas ou observações
   */
  @Expose()
  @ApiProperty({
    description: 'Notas ou observações',
    example: 'Por favor, embrulhar para presente.',
    nullable: true
  })
  notes: string;

  /**
   * Data de criação
   */
  @Expose()
  @ApiProperty({
    description: 'Data de criação do pedido',
    example: '2025-05-17T10:30:00Z'
  })
  createdAt: Date;

  /**
   * Data da última atualização
   */
  @Expose()
  @ApiProperty({
    description: 'Data da última atualização do pedido',
    example: '2025-05-17T10:35:00Z'
  })
  updatedAt: Date;
}
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../order.entity';

/**
 * DTO para atualização de pedido
 */
export class UpdateOrderDto {
  /**
   * Status do pedido
   */
  @ApiPropertyOptional({
    description: 'Status do pedido',
    enum: OrderStatus,
    example: OrderStatus.PAID
  })
  @IsEnum(OrderStatus, { message: 'Status inválido' })
  @IsOptional()
  status?: OrderStatus;

  /**
   * Endereço de entrega
   */
  @ApiPropertyOptional({
    description: 'Endereço de entrega',
    example: 'Rua das Flores, 123 - São Paulo, SP'
  })
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  /**
   * CEP para cálculo do frete
   */
  @ApiPropertyOptional({
    description: 'CEP para cálculo do frete',
    example: '01001-000'
  })
  @IsString()
  @IsOptional()
  zipCode?: string;

  /**
   * ID da transação de pagamento
   */
  @ApiPropertyOptional({
    description: 'ID da transação de pagamento',
    example: 'ln_invoice_123456'
  })
  @IsString()
  @IsOptional()
  paymentId?: string;

  /**
   * Notas ou observações do pedido
   */
  @ApiPropertyOptional({
    description: 'Notas ou observações do pedido',
    example: 'Por favor, embrulhar para presente.'
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
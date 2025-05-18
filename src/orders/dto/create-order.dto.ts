import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrderStatus } from '../order.entity';

/**
 * DTO para representar um item no pedido durante a criação
 */
export class CreateOrderItemDto {
  /**
   * ID do produto a ser adicionado
   */
  @ApiProperty({
    description: 'ID do produto (UUID)',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty({ message: 'ID do produto é obrigatório' })
  productId: string;

  /**
   * Quantidade do produto
   */
  @ApiProperty({
    description: 'Quantidade do produto',
    example: 2,
    minimum: 1
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Quantidade é obrigatória' })
  quantity: number;
}

/**
 * DTO para criação de um novo pedido
 */
export class CreateOrderDto {
  /**
   * Itens do pedido
   */
  @ApiProperty({
    description: 'Lista de produtos no pedido',
    type: [CreateOrderItemDto],
    example: [
      {
        productId: '123e4567-e89b-12d3-a456-426614174000',
        quantity: 2
      },
      {
        productId: '456e7890-e89b-12d3-a456-426614174000',
        quantity: 1
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsNotEmpty({ message: 'O pedido deve conter pelo menos um item' })
  items: CreateOrderItemDto[];

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
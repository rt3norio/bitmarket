import { IsString, IsNumber, IsEnum, IsInt, IsBoolean, IsUUID, IsOptional, MaxLength, Min } from 'class-validator';
import { Currency, Condition } from '../product.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for product update
 */
export class UpdateProductDto {
  /**
   * Product title (maximum 120 characters)
   */
  @ApiPropertyOptional({
    description: 'Product title',
    maxLength: 120,
    example: 'Updated Bitcoin Hardware Wallet'
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MaxLength(120, { message: 'Title must be at most 120 characters' })
  title?: string;

  /**
   * Detailed product description
   */
  @ApiPropertyOptional({
    description: 'Detailed product description',
    example: 'Updated description for hardware wallet'
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  /**
   * Product price (in fiat or sats, depending on the currency)
   */
  @ApiPropertyOptional({
    description: 'Product price in the specified currency',
    minimum: 0,
    example: 89.99
  })
  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price?: number;

  /**
   * Currency used to define the price
   */
  @ApiPropertyOptional({
    description: 'Currency for the product price',
    enum: Currency,
    example: 'USD'
  })
  @IsOptional()
  @IsEnum(Currency, { message: 'Invalid currency. Use BRL, USD or SATS' })
  currency?: Currency;

  /**
   * Available quantity in stock
   */
  @ApiPropertyOptional({
    description: 'Available quantity in stock',
    minimum: 0,
    example: 15
  })
  @IsOptional()
  @IsInt({ message: 'Stock quantity must be an integer' })
  @Min(0, { message: 'Stock quantity cannot be negative' })
  stockQuantity?: number;

  /**
   * Product condition: new or used
   */
  @ApiPropertyOptional({
    description: 'Product condition',
    enum: Condition,
    example: 'NEW'
  })
  @IsOptional()
  @IsEnum(Condition, { message: 'Invalid condition. Use new or used' })
  condition?: Condition;

  /**
   * Indicates if the product is active for sale
   */
  @ApiPropertyOptional({
    description: 'Indicates if the product is active for sale',
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'Active field must be a boolean' })
  active?: boolean;
}
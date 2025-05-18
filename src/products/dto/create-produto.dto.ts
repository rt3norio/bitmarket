import { IsString, IsNumber, IsEnum, IsInt, IsBoolean, IsNotEmpty, MaxLength, Min } from 'class-validator';
import { Currency, Condition } from '../product.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new product
 */
export class CreateProductDto {
  /**
   * Product title (maximum 120 characters)
   */
  @ApiProperty({
    description: 'Product title',
    maxLength: 120,
    example: 'Bitcoin Hardware Wallet'
  })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MaxLength(120, { message: 'Title must be at most 120 characters' })
  title: string;

  /**
   * Detailed product description
   */
  @ApiProperty({
    description: 'Detailed product description',
    example: 'Hardware wallet for securely storing your Bitcoin and other cryptocurrencies'
  })
  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'Description must be a string' })
  description: string;

  /**
   * Product price (in fiat or sats, depending on the currency)
   */
  @ApiProperty({
    description: 'Product price in the specified currency',
    minimum: 0,
    example: 99.99
  })
  @IsNotEmpty({ message: 'Price is required' })
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  price: number;

  /**
   * Currency used to define the price
   */
  @ApiProperty({
    description: 'Currency for the product price',
    enum: Currency,
    example: 'USD'
  })
  @IsNotEmpty({ message: 'Currency is required' })
  @IsEnum(Currency, { message: 'Invalid currency. Use BRL, USD or SATS' })
  currency: Currency;

  /**
   * Available quantity in stock
   */
  @ApiProperty({
    description: 'Available quantity in stock',
    minimum: 0,
    example: 10
  })
  @IsNotEmpty({ message: 'Stock quantity is required' })
  @IsInt({ message: 'Stock quantity must be an integer' })
  @Min(0, { message: 'Stock quantity cannot be negative' })
  stockQuantity: number;

  /**
   * Product condition: new or used
   */
  @ApiProperty({
    description: 'Product condition',
    enum: Condition,
    example: 'new'
  })
  @IsNotEmpty({ message: 'Condition is required' })
  @IsEnum(Condition, { message: 'Invalid condition. Use new or used' })
  condition: Condition;

  /**
   * Indicates if the product is active for sale
   */
  @ApiProperty({
    description: 'Indicates if the product is active for sale',
    default: true,
    required: false,
    example: true
  })
  @IsBoolean({ message: 'Active field must be a boolean' })
  active?: boolean = true;
}
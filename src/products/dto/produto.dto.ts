import { Exclude, Expose } from 'class-transformer';
import { Condition, Currency } from '../product.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for returning product information
 */
@Exclude()
export class ProductDto {
  /**
   * Unique product identifier
   */
  @ApiProperty({
    description: 'Unique product identifier (UUID)',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @Expose()
  id: string;

  /**
   * Product title
   */
  @ApiProperty({
    description: 'Product title',
    example: 'Bitcoin Hardware Wallet'
  })
  @Expose()
  title: string;

  /**
   * Detailed product description
   */
  @ApiProperty({
    description: 'Detailed product description',
    example: 'Hardware wallet for securely storing your Bitcoin and other cryptocurrencies'
  })
  @Expose()
  description: string;

  /**
   * Product price
   */
  @ApiProperty({
    description: 'Product price in the specified currency',
    example: 99.99
  })
  @Expose()
  price: number;

  /**
   * Currency used to define the price
   */
  @ApiProperty({
    description: 'Currency for the product price',
    enum: Currency,
    example: 'USD'
  })
  @Expose()
  currency: Currency;

  /**
   * Available quantity in stock
   */
  @ApiProperty({
    description: 'Available quantity in stock',
    example: 10
  })
  @Expose()
  stockQuantity: number;

  /**
   * Product condition: new or used
   */
  @ApiProperty({
    description: 'Product condition',
    enum: Condition,
    example: 'NEW'
  })
  @Expose()
  condition: Condition;

  /**
   * Indicates if the product is active for sale
   */
  @ApiProperty({
    description: 'Indicates if the product is active for sale',
    example: true
  })
  @Expose()
  active: boolean;

  /**
   * Seller user ID
   */
  @ApiProperty({
    description: 'Seller user ID (UUID)',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @Expose()
  sellerId: string;

  /**
   * Record creation date
   */
  @ApiProperty({
    description: 'Record creation date',
    type: Date,
    example: '2023-01-01T00:00:00Z'
  })
  @Expose()
  createdAt: Date;

  /**
   * Record last update date
   */
  @ApiProperty({
    description: 'Record last update date',
    type: Date,
    example: '2023-01-02T00:00:00Z'
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<ProductDto>) {
    Object.assign(this, partial);
  }
}
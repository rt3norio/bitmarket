import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-produto.dto';
import { UpdateProductDto } from './dto/update-produto.dto';
import { ProductDto } from './dto/produto.dto';
import { plainToInstance } from 'class-transformer';
import { UserRole } from '../users/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  /**
   * Creates a new product
   * @param createProductDto - Product data to be created
   * @param sellerId - ID of the seller from the JWT token
   * @returns The created product
   */
  async create(createProductDto: CreateProductDto, sellerId: string): Promise<ProductDto> {
    const product = this.productRepository.create({
      ...createProductDto,
      sellerId
    });
    const savedProduct = await this.productRepository.save(product);
    return plainToInstance(ProductDto, savedProduct);
  }

  /**
   * Fetches all active products
   * @returns List of products
   */
  async findAll(): Promise<ProductDto[]> {
    const products = await this.productRepository.find({
      where: { active: true },
      relations: ['seller'],
    });
    return plainToInstance(ProductDto, products);
  }

  /**
   * Fetches a product by ID
   * @param id - Product ID
   * @returns The found product
   * @throws NotFoundException if the product is not found
   */
  async findOne(id: string): Promise<ProductDto> {
    const product = await this.productRepository.findOne({
      where: { id, active: true },
      relations: ['seller'],
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return plainToInstance(ProductDto, product);
  }

  /**
   * Fetches all products from a seller
   * @param sellerId - Seller ID
   * @returns List of seller's products
   */
  async findBySeller(sellerId: string): Promise<ProductDto[]> {
    const products = await this.productRepository.find({
      where: { sellerId },
      relations: ['seller'],
    });
    return plainToInstance(ProductDto, products);
  }

  /**
   * Updates a product
   * @param id - Product ID
   * @param updateProductDto - Data for update
   * @param userId - ID of the user performing the update
   * @returns The updated product
   * @throws NotFoundException if the product is not found
   * @throws ForbiddenException if the user is not the product owner
   */
  async update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<ProductDto> {
    const product = await this.productRepository.findOne({
      where: { id },
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    // Check if the user is the product owner
    if (product.sellerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this product');
    }
    
    // Apply updates
    Object.assign(product, updateProductDto);
    
    const updatedProduct = await this.productRepository.save(product);
    return plainToInstance(ProductDto, updatedProduct);
  }

  /**
   * Deactivates (soft delete) a product
   * @param id - Product ID
   * @param userId - ID of the user performing the removal
   * @returns true if the product was successfully removed
   * @throws NotFoundException if the product is not found
   * @throws ForbiddenException if the user is not the product owner
   */
  async remove(id: string, userId: string): Promise<boolean> {
    const product = await this.productRepository.findOne({
      where: { id },
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    // Check if the user is the product owner
    if (product.sellerId !== userId) {
      throw new ForbiddenException('You do not have permission to remove this product');
    }
    
    // Soft delete - just mark as inactive
    product.active = false;
    await this.productRepository.save(product);
    return true;
  }

  /**
   * Permanently removes a product from the database
   * Only administrators can perform this action.
   * Regular users can only perform soft delete.
   * 
   * @param id - Product ID
   * @param userId - ID of the user performing the deletion
   * @param userRole - User's role in the system
   * @returns true if the product was successfully deleted
   * @throws NotFoundException if the product is not found
   * @throws ForbiddenException if the user is not the product owner or not an administrator
   */
  async hardDelete(id: string, userId: string, userRole: string): Promise<boolean> {
    const product = await this.productRepository.findOne({
      where: { id },
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    // Only administrators can perform hard delete
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can permanently delete a product');
    }
    
    // Even as an administrator, they can only delete products they own
    if (product.sellerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this product');
    }
    
    await this.productRepository.remove(product);
    return true;
  }

  /**
   * Reactivates a previously deactivated product
   * @param id - Product ID
   * @param userId - ID of the user performing the reactivation
   * @returns The reactivated product
   * @throws NotFoundException if the product is not found
   * @throws ForbiddenException if the user is not the product owner
   */
  async reactivate(id: string, userId: string): Promise<ProductDto> {
    const product = await this.productRepository.findOne({
      where: { id },
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    // Check if the user is the product owner
    if (product.sellerId !== userId) {
      throw new ForbiddenException('You do not have permission to reactivate this product');
    }
    
    // Reactivate the product
    product.active = true;
    const reactivatedProduct = await this.productRepository.save(product);
    return plainToInstance(ProductDto, reactivatedProduct);
  }

  /**
   * Updates stock quantity
   * @param id - Product ID
   * @param quantity - New quantity
   * @param userId - ID of the user performing the update
   * @returns The updated product
   */
  async updateStock(id: string, quantity: number, userId: string): Promise<ProductDto> {
    const product = await this.productRepository.findOne({
      where: { id },
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    // Check if the user is the product owner
    if (product.sellerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this product');
    }
    
    product.stockQuantity = quantity;
    const updatedProduct = await this.productRepository.save(product);
    return plainToInstance(ProductDto, updatedProduct);
  }
}
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Patch, 
  UseGuards, 
  Request, 
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Query
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-produto.dto';
import { UpdateProductDto } from './dto/update-produto.dto';
import { ProductDto } from './dto/produto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../users/user.entity';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBody, 
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiNoContentResponse
} from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Creates a new product
   * @param createProductDto - Product data
   * @param req - Request with authenticated user information
   * @returns The created product
   */
  @ApiOperation({ summary: 'Create a new product' })
  @ApiCreatedResponse({ 
    description: 'The product has been successfully created.',
    type: ProductDto 
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - JWT token is missing or invalid' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Request() req): Promise<ProductDto> {
    // Pass the seller ID from the JWT token directly to the service
    return this.productsService.create(createProductDto, req.user.userId);
  }

  /**
   * Lists all active products
   * @returns List of products
   */
  @ApiOperation({ summary: 'List all active products' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns an array of products',
    type: [ProductDto]
  })
  @Get()
  async findAll(): Promise<ProductDto[]> {
    return this.productsService.findAll();
  }

  /**
   * Fetches a product by ID
   * @param id - Product ID
   * @returns The found product
   */
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the product with the specified ID',
    type: ProductDto
  })
  @ApiNotFoundResponse({ description: 'Product with specified ID not found' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductDto> {
    return this.productsService.findOne(id);
  }

  /**
   * Lists all products from a specific seller
   * @param sellerId - Seller ID
   * @returns List of products
   */
  @ApiOperation({ summary: 'Get all products from a specific seller' })
  @ApiParam({ name: 'sellerId', description: 'Seller ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns an array of products from the specified seller',
    type: [ProductDto]
  })
  @Get('seller/:sellerId')
  async findBySeller(@Param('sellerId') sellerId: string): Promise<ProductDto[]> {
    return this.productsService.findBySeller(sellerId);
  }

  /**
   * Lists products of the authenticated user
   * @param req - Request with user information
   * @returns List of user's products
   */
  @ApiOperation({ summary: 'Get all products of the authenticated user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns an array of products belonging to the authenticated user',
    type: [ProductDto]
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - JWT token is missing or invalid' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('my/products')
  async findMyProducts(@Request() req): Promise<ProductDto[]> {
    return this.productsService.findBySeller(req.user.userId);
  }

  /**
   * Updates a product
   * @param id - Product ID
   * @param updateProductDto - Data for update
   * @param req - Request with user information
   * @returns The updated product
   */
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the updated product',
    type: ProductDto
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - JWT token is missing or invalid' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not the owner of the product' })
  @ApiNotFoundResponse({ description: 'Product with specified ID not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
  ): Promise<ProductDto> {
    return this.productsService.update(id, updateProductDto, req.user.userId);
  }

  /**
   * Removes (soft delete) a product
   * @param id - Product ID
   * @param req - Request with user information
   * @returns Success message
   */
  @ApiOperation({ summary: 'Remove a product (soft delete)' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiNoContentResponse({ description: 'Product has been successfully deactivated' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - JWT token is missing or invalid' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not the owner of the product' })
  @ApiNotFoundResponse({ description: 'Product with specified ID not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    await this.productsService.remove(id, req.user.userId);
  }

  /**
   * Permanently removes a product
   * Only administrators can perform this operation
   * 
   * @param id - Product ID
   * @param req - Request with user information
   * @returns Success message
   */
  @ApiOperation({ summary: 'Permanently remove a product (admin only)' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiNoContentResponse({ description: 'Product has been permanently deleted' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - JWT token is missing or invalid' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not an administrator or not the owner of the product' })
  @ApiNotFoundResponse({ description: 'Product with specified ID not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardDelete(@Param('id') id: string, @Request() req): Promise<void> {
    const userId = req.user.userId;
    const userRole = req.user.role || UserRole.USER; // Default to USER if no role is present

    await this.productsService.hardDelete(id, userId, userRole);
  }

  /**
   * Reactivates a previously deactivated product
   * @param id - Product ID
   * @param req - Request with user information
   * @returns The reactivated product
   */
  @ApiOperation({ summary: 'Reactivate a previously deactivated product' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the reactivated product',
    type: ProductDto
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - JWT token is missing or invalid' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not the owner of the product' })
  @ApiNotFoundResponse({ description: 'Product with specified ID not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id/reactivate')
  async reactivate(@Param('id') id: string, @Request() req): Promise<ProductDto> {
    return this.productsService.reactivate(id, req.user.userId);
  }

  /**
   * Updates stock quantity
   * @param id - Product ID
   * @param quantity - New quantity
   * @param req - Request with user information
   * @returns The updated product
   */
  @ApiOperation({ summary: 'Update product stock quantity' })
  @ApiParam({ name: 'id', description: 'Product ID (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          description: 'New stock quantity',
          minimum: 0,
          example: 25
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the updated product',
    type: ProductDto
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - JWT token is missing or invalid' })
  @ApiForbiddenResponse({ description: 'Forbidden - User is not the owner of the product' })
  @ApiNotFoundResponse({ description: 'Product with specified ID not found' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id/stock')
  async updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Request() req,
  ): Promise<ProductDto> {
    return this.productsService.updateStock(id, quantity, req.user.userId);
  }
}
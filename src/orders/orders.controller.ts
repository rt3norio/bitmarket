import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
  ForbiddenException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrderDto } from './dto/order.dto';
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
  ApiBadRequestResponse
} from '@nestjs/swagger';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Cria um novo pedido
   * @param createOrderDto - Dados do pedido
   * @param req - Requisição com informações do usuário autenticado
   * @returns O pedido criado
   */
  @ApiOperation({ summary: 'Criar um novo pedido' })
  @ApiCreatedResponse({
    description: 'O pedido foi criado com sucesso.',
    type: OrderDto
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou produto indisponível' })
  @ApiUnauthorizedResponse({ description: 'Não autorizado - token JWT ausente ou inválido' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req): Promise<OrderDto> {
    return this.ordersService.create(createOrderDto, req.user.userId);
  }

  /**
   * Lista todos os pedidos do usuário autenticado
   * @param req - Requisição com informações do usuário autenticado
   * @returns Lista dos pedidos
   */
  @ApiOperation({ summary: 'Listar todos os pedidos do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Retorna uma lista de pedidos do usuário autenticado',
    type: [OrderDto]
  })
  @ApiUnauthorizedResponse({ description: 'Não autorizado - token JWT ausente ou inválido' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req): Promise<OrderDto[]> {
    return this.ordersService.findAll(req.user.userId, req.user.role);
  }

  /**
   * Busca um pedido específico pelo ID
   * @param id - ID do pedido
   * @param req - Requisição com informações do usuário autenticado
   * @returns O pedido encontrado
   */
  @ApiOperation({ summary: 'Buscar um pedido pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do pedido (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Retorna o pedido com o ID especificado',
    type: OrderDto
  })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  @ApiForbiddenResponse({ description: 'Acesso negado - Você não tem permissão para acessar este pedido' })
  @ApiUnauthorizedResponse({ description: 'Não autorizado - token JWT ausente ou inválido' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<OrderDto> {
    return this.ordersService.findOne(id, req.user.userId, req.user.role);
  }

  /**
   * Atualiza um pedido existente
   * @param id - ID do pedido
   * @param updateOrderDto - Dados para atualização
   * @param req - Requisição com informações do usuário autenticado
   * @returns O pedido atualizado
   */
  @ApiOperation({ summary: 'Atualizar um pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Retorna o pedido atualizado',
    type: OrderDto
  })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  @ApiForbiddenResponse({ description: 'Acesso negado - Você não tem permissão para atualizar este pedido' })
  @ApiUnauthorizedResponse({ description: 'Não autorizado - token JWT ausente ou inválido' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Request() req,
  ): Promise<OrderDto> {
    return this.ordersService.update(id, updateOrderDto, req.user.userId, req.user.role);
  }

  /**
   * Cancela um pedido
   * @param id - ID do pedido
   * @param req - Requisição com informações do usuário autenticado
   * @returns O pedido cancelado
   */
  @ApiOperation({ summary: 'Cancelar um pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido (UUID)', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Retorna o pedido cancelado',
    type: OrderDto
  })
  @ApiNotFoundResponse({ description: 'Pedido não encontrado' })
  @ApiForbiddenResponse({ description: 'Acesso negado - Você não tem permissão para cancelar este pedido' })
  @ApiBadRequestResponse({ description: 'O pedido não pode ser cancelado no estado atual' })
  @ApiUnauthorizedResponse({ description: 'Não autorizado - token JWT ausente ou inválido' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @Request() req): Promise<OrderDto> {
    return this.ordersService.cancel(id, req.user.userId, req.user.role);
  }

  /**
   * Lista todos os pedidos relacionados ao vendedor
   * @param req - Requisição com informações do usuário autenticado
   * @returns Lista de pedidos com produtos do vendedor
   */
  @ApiOperation({ summary: 'Listar todos os pedidos com produtos do vendedor' })
  @ApiResponse({
    status: 200,
    description: 'Retorna uma lista de pedidos que contêm produtos do vendedor autenticado',
    type: [OrderDto]
  })
  @ApiUnauthorizedResponse({ description: 'Não autorizado - token JWT ausente ou inválido' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('seller/my-orders')
  async findByCurrentSeller(@Request() req): Promise<OrderDto[]> {
    return this.ordersService.findBySeller(req.user.userId);
  }
}
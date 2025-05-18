import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order, OrderItem, OrderStatus } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductsService } from '../products/products.service';
import { OrderDto } from './dto/order.dto';
import { plainToInstance } from 'class-transformer';
import { UserRole } from '../users/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly productsService: ProductsService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Cria um novo pedido
   * @param createOrderDto - Dados do pedido
   * @param buyerId - ID do usuário comprador
   * @returns O pedido criado
   */
  async create(createOrderDto: CreateOrderDto, buyerId: string): Promise<OrderDto> {
    // Verificar se os produtos existem e estão disponíveis
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('O pedido deve conter pelo menos um item');
    }

    // Usar uma transação para garantir que todas as operações sejam executadas juntas
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Primeiro, pré-calcular o valor total e determinar a moeda
      let totalAmount = 0;
      let currency = '';

      // Verificar produtos e calcular valores antes de criar o pedido
      for (const item of createOrderDto.items) {
        const product = await this.productsService.findOne(item.productId);
        
        // Verificar se o produto existe e está ativo
        if (!product || !product.active) {
          throw new BadRequestException(`Produto ${item.productId} não está disponível`);
        }

        // Verificar disponibilidade em estoque
        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(`Quantidade insuficiente em estoque para o produto ${product.title}`);
        }

        // Definir moeda padrão para o pedido baseado no primeiro item
        if (currency === '') {
          currency = product.currency;
        }

        // Validar consistência da moeda entre produtos
        if (currency !== product.currency) {
          throw new BadRequestException('Todos os produtos devem usar a mesma moeda');
        }
        
        // Calcular subtotal e adicionar ao total
        totalAmount += product.price * item.quantity;
      }

      // Criar o pedido com valores já calculados
      const order = new Order();
      order.buyerId = buyerId;
      order.status = OrderStatus.PENDING;
      order.shippingAddress = createOrderDto.shippingAddress || ''; 
      order.zipCode = createOrderDto.zipCode || ''; // Salvar o CEP para cálculo de frete
      order.notes = createOrderDto.notes || '';
      order.totalAmount = totalAmount; // Definir o valor total calculado
      order.currency = currency;       // Definir a moeda

      // Salvar o pedido para obter o ID
      const savedOrder = await queryRunner.manager.save(Order, order) as Order;

      // Criar os itens do pedido
      const orderItems: OrderItem[] = [];

      for (const item of createOrderDto.items) {
        const product = await this.productsService.findOne(item.productId);
        
        // Criar o item do pedido
        const orderItem = new OrderItem();
        orderItem.orderId = savedOrder.id;
        orderItem.productId = product.id;
        orderItem.quantity = item.quantity;
        orderItem.price = product.price;
        orderItem.currency = product.currency;
        
        // Atualizar o estoque do produto
        await this.productsService.updateStock(
          product.id, 
          product.stockQuantity - item.quantity,
          buyerId
        );

        orderItems.push(await queryRunner.manager.save(OrderItem, orderItem));
      }
      
      await queryRunner.commitTransaction();

      // Retornar o pedido criado
      return this.findOne(savedOrder.id, buyerId);
    } catch (error) {
      // Em caso de erro, reverter todas as alterações
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Liberar o queryRunner
      await queryRunner.release();
    }
  }

  /**
   * Lista todos os pedidos (admin) ou pedidos do usuário
   * @param userId - ID do usuário
   * @param userRole - Papel do usuário
   * @returns Lista de pedidos
   */
  async findAll(userId: string, userRole: string): Promise<OrderDto[]> {
    let orders: Order[];
    
    if (userRole === UserRole.ADMIN) {
      // Admins podem ver todos os pedidos
      orders = await this.orderRepository.find({
        relations: ['buyer'],
        order: { createdAt: 'DESC' },
      });
    } else {
      // Usuários regulares veem apenas seus próprios pedidos
      orders = await this.orderRepository.find({
        where: { buyerId: userId },
        order: { createdAt: 'DESC' },
      });
    }

    // Para cada pedido, buscar os itens relacionados
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await this.orderItemRepository.find({
          where: { orderId: order.id },
          relations: ['product'],
        });
        order.items = items;
        return order;
      })
    );

    return plainToInstance(OrderDto, ordersWithItems);
  }

  /**
   * Busca um pedido pelo ID
   * @param id - ID do pedido
   * @param userId - ID do usuário solicitante
   * @param userRole - Papel do usuário (opcional)
   * @returns O pedido encontrado
   */
  async findOne(id: string, userId: string, userRole?: string): Promise<OrderDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    // Verificar se o usuário tem permissão para acessar este pedido
    if (order.buyerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Você não tem permissão para acessar este pedido');
    }

    // Buscar os itens do pedido
    const items = await this.orderItemRepository.find({
      where: { orderId: order.id },
      relations: ['product'],
    });

    order.items = items;

    return plainToInstance(OrderDto, order);
  }

  /**
   * Atualiza um pedido
   * @param id - ID do pedido
   * @param updateOrderDto - Dados para atualização
   * @param userId - ID do usuário solicitante
   * @param userRole - Papel do usuário (opcional)
   * @returns O pedido atualizado
   */
  async update(id: string, updateOrderDto: UpdateOrderDto, userId: string, userRole?: string): Promise<OrderDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    // Verificar permissões para atualizar o pedido
    // Admins podem atualizar qualquer pedido
    // Compradores só podem atualizar seus próprios pedidos
    if (order.buyerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Você não tem permissão para atualizar este pedido');
    }

    // Compradores regulares só podem atualizar alguns campos
    if (userRole !== UserRole.ADMIN) {
      // Compradores só podem atualizar endereço, CEP e notas
      const allowedFields = ['shippingAddress', 'zipCode', 'notes'];
      const requestedUpdates = Object.keys(updateOrderDto);
      
      // Verificar se há campos não permitidos
      const disallowedFields = requestedUpdates.filter(field => !allowedFields.includes(field));
      if (disallowedFields.length > 0) {
        throw new ForbiddenException(
          `Você não tem permissão para atualizar os seguintes campos: ${disallowedFields.join(', ')}`
        );
      }
    }

    // Realizar a atualização
    Object.assign(order, updateOrderDto);
    const updatedOrder = await this.orderRepository.save(order);

    // Retornar o pedido atualizado
    return this.findOne(id, userId, userRole);
  }

  /**
   * Cancela um pedido
   * @param id - ID do pedido
   * @param userId - ID do usuário solicitante
   * @param userRole - Papel do usuário (opcional)
   * @returns O pedido cancelado
   */
  async cancel(id: string, userId: string, userRole?: string): Promise<OrderDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    // Verificar permissões para cancelar o pedido
    if (order.buyerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Você não tem permissão para cancelar este pedido');
    }

    // Verificar se o pedido pode ser cancelado
    const cancelableStatuses = [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.PROCESSING];
    if (!cancelableStatuses.includes(order.status)) {
      throw new BadRequestException(`Não é possível cancelar um pedido com status ${order.status}`);
    }

    // Usar uma transação para garantir que todas as operações sejam executadas juntas
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar os itens do pedido
      const items = await this.orderItemRepository.find({
        where: { orderId: order.id },
      });

      // Restaurar o estoque dos produtos
      for (const item of items) {
        // Primeiro obter o produto para verificar o estoque atual
        const product = await this.productsService.findOne(item.productId);
        // Calcular o novo estoque adicionando a quantidade do item cancelado
        const newStockQuantity = product.stockQuantity + item.quantity;
        // Atualizar o estoque
        await this.productsService.updateStock(
          item.productId,
          newStockQuantity,
          userId
        );
      }

      // Atualizar o status do pedido
      order.status = OrderStatus.CANCELLED;
      await queryRunner.manager.save(Order, order);
      
      await queryRunner.commitTransaction();

      // Retornar o pedido cancelado
      return this.findOne(id, userId, userRole);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Lista os pedidos de um vendedor específico
   * @param sellerId - ID do vendedor
   * @returns Lista de pedidos que contêm produtos do vendedor
   */
  async findBySeller(sellerId: string): Promise<OrderDto[]> {
    // Esta é uma operação mais complexa:
    // 1. Primeiro precisamos encontrar todos os OrderItems que correspondem a produtos do vendedor
    const orderItems = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoinAndSelect('orderItem.product', 'product')
      .where('product.sellerId = :sellerId', { sellerId })
      .getMany();

    // 2. Extrair os IDs de pedidos únicos desses itens
    const orderIds = [...new Set(orderItems.map(item => item.orderId))];

    // 3. Buscar os pedidos completos com esses IDs
    const orders = await this.orderRepository.find({
      where: { id: In(orderIds) },
      order: { createdAt: 'DESC' },
    });

    // 4. Para cada pedido, buscar apenas os itens que são do vendedor
    const sellerOrders = await Promise.all(
      orders.map(async (order) => {
        // Buscar apenas os itens desse vendedor para cada pedido
        const sellerItems = await this.orderItemRepository
          .createQueryBuilder('orderItem')
          .innerJoinAndSelect('orderItem.product', 'product')
          .where('orderItem.orderId = :orderId', { orderId: order.id })
          .andWhere('product.sellerId = :sellerId', { sellerId })
          .getMany();
        
        order.items = sellerItems;
        return order;
      })
    );

    return plainToInstance(OrderDto, sellerOrders);
  }
}
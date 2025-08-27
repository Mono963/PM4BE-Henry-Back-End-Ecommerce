import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { Users } from '../users/Entyties/users.entity';
import { Product } from '../products/Entities/products.entity';
import { CartItem } from './entities/cart.item.entity';
import {
  AddToCartDTO,
  CartItemResponseDTO,
  CartResponseDTO,
  UpdateCartItemDTO,
} from './dto/create-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly dataSource: DataSource,
  ) {}

  async getCart(userId: string): Promise<CartResponseDTO> {
    const cart = await this.getOrCreateCart(userId);
    return this.mapCartToResponse(cart);
  }

  async addProductToCart(
    userId: string,
    dto: AddToCartDTO,
  ): Promise<CartResponseDTO> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Obtener o crear carrito
      let cart = await queryRunner.manager.findOne(Cart, {
        where: { user: { id: userId } },
        relations: ['user', 'items', 'items.product'],
      });

      if (!cart) {
        const user = await queryRunner.manager.findOne(Users, {
          where: { id: userId },
        });
        if (!user) {
          throw new NotFoundException(`User with ID ${userId} not found`);
        }
        cart = queryRunner.manager.create(Cart, { user, total: 0, items: [] });
        await queryRunner.manager.save(cart);
      }

      // Validar producto
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: dto.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${dto.productId} not found`,
        );
      }

      // Verificar stock
      if (product.stock < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${product.stock}, Requested: ${dto.quantity}`,
        );
      }

      // Buscar item existente
      let cartItem = cart.items?.find(
        (item) => item.product.id === dto.productId,
      );

      if (cartItem) {
        // Actualizar cantidad existente
        const newQuantity = cartItem.quantity + dto.quantity;
        if (product.stock < newQuantity) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${product.stock}, Total requested: ${newQuantity}`,
          );
        }
        cartItem.quantity = newQuantity;
        cartItem.subtotal = parseFloat(
          (newQuantity * Number(cartItem.priceAtAddition)).toFixed(2),
        );
      } else {
        // Crear nuevo item
        cartItem = queryRunner.manager.create(CartItem, {
          cart,
          product,
          quantity: dto.quantity,
          priceAtAddition: Number(product.price),
          subtotal: parseFloat(
            (dto.quantity * Number(product.price)).toFixed(2),
          ),
        });
        if (!cart.items) cart.items = [];
        cart.items.push(cartItem);
      }

      await queryRunner.manager.save(cartItem);

      // Recalcular total
      cart.total = parseFloat(
        cart.items
          .reduce((sum, item) => sum + Number(item.subtotal), 0)
          .toFixed(2),
      );

      await queryRunner.manager.save(cart);
      await queryRunner.commitTransaction();

      return this.getCart(userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Could not add product to cart');
    } finally {
      await queryRunner.release();
    }
  }

  async updateCartItemQuantity(
    userId: string,
    cartItemId: string,
    dto: UpdateCartItemDTO,
  ): Promise<CartResponseDTO> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { user: { id: userId } },
        relations: ['items', 'items.product'],
      });

      if (!cart) {
        throw new NotFoundException(`Cart not found for user`);
      }

      const cartItem = cart.items?.find((item) => item.id === cartItemId);
      if (!cartItem) {
        throw new NotFoundException(`Cart item not found`);
      }

      if (dto.quantity === 0) {
        // Remover item
        await queryRunner.manager.remove(cartItem);
        cart.items = cart.items.filter((item) => item.id !== cartItemId);
      } else {
        // Verificar stock
        if (cartItem.product.stock < dto.quantity) {
          throw new BadRequestException(
            `Insufficient stock. Available: ${cartItem.product.stock}, Requested: ${dto.quantity}`,
          );
        }

        // Actualizar cantidad
        cartItem.quantity = dto.quantity;
        cartItem.subtotal = parseFloat(
          (dto.quantity * Number(cartItem.priceAtAddition)).toFixed(2),
        );
        await queryRunner.manager.save(cartItem);
      }

      // Recalcular total
      cart.total = parseFloat(
        cart.items
          .reduce((sum, item) => sum + Number(item.subtotal), 0)
          .toFixed(2),
      );

      await queryRunner.manager.save(cart);
      await queryRunner.commitTransaction();

      return this.getCart(userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Could not update cart item');
    } finally {
      await queryRunner.release();
    }
  }

  async removeCartItem(
    userId: string,
    cartItemId: string,
  ): Promise<{ message: string; cart: CartResponseDTO }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { user: { id: userId } },
        relations: ['items', 'items.product'],
      });

      if (!cart) {
        throw new NotFoundException(`Cart not found for user`);
      }

      const cartItem = cart.items?.find((item) => item.id === cartItemId);
      if (!cartItem) {
        throw new NotFoundException(`Cart item not found`);
      }

      await queryRunner.manager.remove(cartItem);
      cart.items = cart.items.filter((item) => item.id !== cartItemId);

      // Recalcular total
      cart.total = parseFloat(
        cart.items
          .reduce((sum, item) => sum + Number(item.subtotal), 0)
          .toFixed(2),
      );

      await queryRunner.manager.save(cart);
      await queryRunner.commitTransaction();

      const updatedCart = await this.getCart(userId);
      return {
        message: 'Item removed from cart successfully',
        cart: updatedCart,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Could not remove cart item');
    } finally {
      await queryRunner.release();
    }
  }

  async clearCart(userId: string): Promise<{ message: string }> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['items'],
    });

    if (!cart) {
      throw new NotFoundException(`Cart not found for user`);
    }

    await this.cartItemRepository.remove(cart.items);
    cart.total = 0;
    await this.cartRepository.save(cart);

    return { message: 'Cart cleared successfully' };
  }

  private async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.product'],
    });

    if (!cart) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      cart = this.cartRepository.create({ user, total: 0, items: [] });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  private mapCartToResponse(cart: Cart): CartResponseDTO {
    const items: CartItemResponseDTO[] =
      cart.items?.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        priceAtAddition: Number(item.priceAtAddition),
        subtotal: Number(item.subtotal),
        product: {
          id: item.product.id,
          name: item.product.name,
          description: item.product.description,
          price: Number(item.product.price),
          stock: item.product.stock,
          imgUrls: item.product.imgUrls || [],
        },
      })) || [];

    return {
      id: cart.id,
      total: Number(cart.total),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }
}

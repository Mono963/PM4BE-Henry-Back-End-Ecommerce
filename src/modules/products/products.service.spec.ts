import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { Product } from './Entities/products.entity';
import { CategoriesService } from '../category/category.service';
import { Category } from '../category/entities/category.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: Partial<Record<keyof Repository<Product>, jest.Mock>>;
  let categoriesService: jest.Mocked<Pick<CategoriesService, 'findByName'>>;

  const mockCategory: Category = {
    id: 'cat-1',
    categoryName: 'Category 1',
    products: [],
  };

  const mockProduct: Product = {
    id: 'prod-1',
    name: 'Product 1',
    description: 'desc',
    price: 100,
    stock: 5,
    category: mockCategory,
    orderDetails: [],
    files: [],
    imgUrls: [],
  };

  const productsArray = [mockProduct];

  beforeEach(async () => {
    categoriesService = {
      findByName: jest.fn(),
    };

    repo = {
      find: jest.fn().mockResolvedValue(productsArray),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: repo,
        },
        {
          provide: CategoriesService,
          useValue: categoriesService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('getProducts', () => {
    it('should return all products if no pagination', async () => {
      await service.getProducts();
      expect(repo.find).toHaveBeenCalledWith({
        relations: ['category', 'orderDetails', 'files'],
      });
    });

    it('should return paginated products if page and limit provided', async () => {
      (repo.find as jest.Mock).mockResolvedValueOnce([mockProduct]);
      const result = await service.getProducts(1, 1);
      expect(result).toHaveLength(1);
    });
  });

  describe('getProductById', () => {
    it('should return product DTO if found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce(mockProduct);
      const result = await service.getProductById('prod-1');
      expect(result.name).toBe('Product 1');
    });

    it('should throw NotFoundException if not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.getProductById('no-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createProduct', () => {
    it('should create and save product if category found', async () => {
      categoriesService.findByName.mockResolvedValueOnce(mockCategory);
      (repo.create as jest.Mock).mockReturnValueOnce(mockProduct);
      (repo.save as jest.Mock).mockResolvedValueOnce(mockProduct);

      const dto = {
        name: 'New',
        categoryName: 'Category 1',
        price: 10,
        stock: 1,
        description: '',
      };
      const result = await service.createProduct(dto);
      expect(result).toBe(mockProduct);
    });

    it('should throw NotFoundException if category not found', async () => {
      categoriesService.findByName.mockResolvedValue(null);
      await expect(
        service.createProduct({
          name: 'New',
          categoryName: 'Missing',
          price: 10,
          stock: 1,
          description: '',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProduct', () => {
    it('should update product and save if found and category exists', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce(mockProduct);
      categoriesService.findByName.mockResolvedValueOnce(mockCategory);
      (repo.save as jest.Mock).mockResolvedValueOnce(mockProduct);

      const result = await service.updateProduct('prod-1', {
        name: 'Updated',
        categoryName: 'Category 1',
      });

      expect(result).toEqual({ id: 'prod-1' });
    });

    it('should throw NotFoundException if product not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.updateProduct('no-id', {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if new category not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce(mockProduct);
      categoriesService.findByName.mockResolvedValueOnce(null);
      await expect(
        service.updateProduct('prod-1', { categoryName: 'Missing' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteProduct', () => {
    it('should remove product if found', async () => {
      (repo.findOneBy as jest.Mock).mockResolvedValueOnce(mockProduct);
      (repo.remove as jest.Mock).mockResolvedValueOnce(mockProduct);

      const result = await service.deleteProduct('prod-1');
      expect(result).toEqual({ id: 'prod-1' });
    });

    it('should throw NotFoundException if product not found', async () => {
      (repo.findOneBy as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.deleteProduct('no-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findProductEntityById', () => {
    it('should return product entity if found', async () => {
      // Creamos un mock parcial de QueryBuilder con encadenamiento
      const qbMock: Partial<SelectQueryBuilder<Product>> = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: function (this: void) {
          return Promise.resolve(mockProduct);
        },
      };

      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qbMock);

      const result = await service.findProductEntityById('prod-1');
      expect(result).toBe(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      const qbMock: Partial<SelectQueryBuilder<Product>> = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: function (this: void) {
          return Promise.resolve(null);
        },
      };

      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qbMock);

      await expect(service.findProductEntityById('no-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('saveProductEntity', () => {
    it('should save the product entity', async () => {
      (repo.save as jest.Mock).mockResolvedValueOnce(mockProduct);
      await service.saveProductEntity(mockProduct);
      expect(repo.save).toHaveBeenCalledWith(mockProduct);
    });
  });
});

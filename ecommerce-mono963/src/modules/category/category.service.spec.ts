import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoriesService } from './category.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repo: jest.Mocked<Repository<Category>>;

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<Repository<Category>>> = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get(CategoriesService);
    repo = module.get(getRepositoryToken(Category));
  });

  describe('preloadCategories', () => {
    it('debería guardar categorías únicas y retornar mensaje de éxito', async () => {
      jest.spyOn(service, 'findByName').mockResolvedValueOnce(null);

      const mockCategory: Category = {
        id: '1',
        categoryName: 'Zapatillas',
        products: [],
      };

      jest.spyOn(repo, 'save').mockResolvedValueOnce(mockCategory);

      const result = await service.preloadCategories();

      expect(result).toEqual({
        message: 'Categorías precargadas correctamente',
      });
      jest.spyOn(service, 'findByName').mockResolvedValueOnce(null);
    });

    it('debería lanzar error si todas las categorías ya existen', async () => {
      jest.spyOn(service, 'findByName').mockResolvedValue({} as Category);

      await expect(service.preloadCategories()).rejects.toThrow(
        new HttpException('Las categorías ya existen', HttpStatus.CONFLICT),
      );
    });
  });

  describe('getCategories', () => {
    it('debería retornar un array de categorías con relaciones', async () => {
      const fakeCategories: Category[] = [
        { id: 'uuid1', categoryName: 'Zapatillas', products: [] },
      ];
      jest.spyOn(repo, 'find').mockResolvedValueOnce(fakeCategories);

      const result = await service.getCategories();

      expect(result).toEqual(fakeCategories);
      jest.spyOn(service, 'findByName').mockResolvedValue({} as Category);
    });
  });

  describe('findByName', () => {
    it('debería retornar una categoría si existe', async () => {
      const mockCategory: Category = {
        id: 'uuid',
        categoryName: 'Ropa',
        products: [],
      };
      jest.spyOn(repo, 'findOneBy').mockResolvedValueOnce(mockCategory);

      const result = await service.findByName('Ropa');

      expect(result).toEqual(mockCategory);
    });
  });

  describe('createCategory', () => {
    it('debería crear y retornar una nueva categoría', async () => {
      const dto: CreateCategoryDto = { categoryName: 'Deportes' };

      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null);

      const mockCategory: Category = {
        id: 'uuid',
        categoryName: dto.categoryName,
        products: [],
      };

      jest.spyOn(repo, 'create').mockReturnValue(mockCategory);
      jest.spyOn(repo, 'save').mockResolvedValue(mockCategory);

      const result = await service.createCategory(dto);

      expect(result).toEqual(mockCategory);
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null);
    });

    it('debería lanzar error si la categoría ya existe', async () => {
      const dto: CreateCategoryDto = { categoryName: 'Ropa' };
      jest.spyOn(repo, 'findOneBy').mockResolvedValue({} as Category);

      await expect(service.createCategory(dto)).rejects.toThrow(
        new HttpException(`La categoría "Ropa" ya existe`, HttpStatus.CONFLICT),
      );
    });
  });

  describe('getByIdCategory', () => {
    it('debería retornar una categoría si existe', async () => {
      const mockCategory: Category = {
        id: 'uuid',
        categoryName: 'Libros',
        products: [],
      };
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(mockCategory);

      const result = await service.getByIdCategory('uuid');

      expect(result).toEqual(mockCategory);
    });

    it('debería lanzar error si no existe la categoría', async () => {
      jest.spyOn(repo, 'findOneBy').mockResolvedValue(null);

      await expect(service.getByIdCategory('uuid')).rejects.toThrow(
        'La categoria no existe',
      );
    });
  });
});

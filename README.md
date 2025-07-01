<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
  <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
  <a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
  <a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
  <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

---

## 📦 E-Commerce API con NestJS

Proyecto backend para un sistema de e-commerce construido con [NestJS](https://nestjs.com/), usando TypeORM, PostgreSQL y Cloudinary.

---

## 🚀 Funcionalidades

### 🔐 Autenticación y Usuarios

- Registro de usuario (`/auth/signup`)
- Login con JWT (`/auth/signin`)
- Validación con roles (`isAdmin`)
- Guards para rutas protegidas
- Encriptado de contraseñas (bcrypt)
- Filtros y DTOs de respuesta para proteger campos sensibles

### 🛍️ Productos

- CRUD de productos (`/products`)
- Relación con categorías
- Paginación opcional
- Subida de imágenes (con Multer + Cloudinary)
- Asociación de múltiples imágenes a cada producto
- Endpoint para precarga de productos (`/products/seeder`) sin duplicados

### 🗂️ Categorías

- CRUD de categorías (`/categories`)
- Relación 1:N con productos
- Precarga automática desde archivo fuente (`/categories/seeder`)
- Prevención de duplicados por nombre

### 📁 Archivos

- Gestión de archivos de imagen (entidad `File`)
- Asociación a productos mediante relación OneToMany
- DTO de respuesta con URLs

### 🧾 Órdenes _(en desarrollo o ya disponible según implementación)_

- Creación de órdenes (`/orders`)
- Asociación con productos y usuarios
- Detalles de la orden (cantidad, subtotal, total)

### 🧪 Testing

- Pruebas unitarias con Jest
- Cobertura de servicios y DTOs
- Validaciones de errores
- Uso de mocks personalizados (`jest.fn()`)

---

## ⚙️ Instalación del proyecto

```bash
npm install

# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Pruebas
npm run test
npm run test:watch
npm run test:e2e
npm run test:cov

# Migraciones TypeORM
npm run migration:create
npm run migration:generate
npm run migration:run
npm run migration:revert
```

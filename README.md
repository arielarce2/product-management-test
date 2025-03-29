# Product Management API

REST API for product and category management developed with Laravel.

## Prerequisites

### Supported PHP Versions
- PHP 7.3 (until July 26, 2022)
- PHP 7.4 (until January 24, 2023)
- PHP 8.0 (recommended)
- PHP 8.1 (recommended)

### Other Dependencies
- Composer
- MySQL >= 5.7
- Node.js >= 18.19.0 (for frontend)
- npm >= 6.14.18
- Angular CLI >= 19.2.5
- Xdebug (for coverage reports)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/product-management-test.git
cd product-management-test
```

2. Install PHP dependencies:
```bash
cd product-management-api
composer install
```

3. Configure environment file:
```bash
cp .env.example .env
php artisan key:generate
```

4. Configure database in `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=product_management
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

5. Configure database (option 1 - Migrations and Seeders):
```bash
php artisan migrate
php artisan db:seed
```

Or

5. Configure database (option 2 - Import complete database):
```bash
# Create database
mysql -u your_username -p -e "CREATE DATABASE product_management;"

# Import provided SQL file
mysql -u your_username -p product_management < database/product_management.sql
```

6. Install frontend dependencies:
```bash
cd ../product-management-ui
npm install
```

## Xdebug Configuration

To generate coverage reports, you need to have Xdebug installed and configured:

1. Download Xdebug from https://xdebug.org/download
2. Place the `php_xdebug.dll` file in your PHP extensions folder
3. Add these lines to your `php.ini`:
```ini
zend_extension=xdebug
xdebug.mode=coverage
xdebug.client_host=127.0.0.1
xdebug.client_port=9003
```

## Execution

### API (Backend)

1. Start development server:
```bash
cd product-management-api
php artisan serve
```

2. Run tests:
```bash
php artisan test
```

3. Generate coverage report:
```bash
php artisan test --coverage-html coverage
```

### Frontend

1. Start development server:
```bash
cd product-management-ui
ng serve
```

## API Endpoints

### Authentication

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Categories

- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/categories/{id}` - Get category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Products

- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

## Project Structure

```
product-management-test/
├── product-management-api/     # Laravel Backend
│   ├── app/
│   ├── tests/
│   └── ...
└── product-management-ui/      # Angular Frontend
    ├── src/
    ├── e2e/
    └── ...
```

## Technologies Used

### Backend
- Laravel Framework 8.83.29
- PHP 7.3, 7.4, 8.0, 8.1 (see compatibility notes)
- MySQL 5.7+
- Laravel Sanctum for authentication

### Frontend
- Angular CLI 19.2.5
- Node.js 18.19.0
- npm 6.14.18
- Angular Material
- RxJS
- TypeScript

## Compatibility Notes

### PHP
- PHP 7.3: Support until July 26, 2022
- PHP 7.4: Support until January 24, 2023
- PHP 8.0: Recommended version
- PHP 8.1: Recommended version

### Laravel
- Laravel 8.83.29 is the latest version in the 8.x series
- Compatible with all PHP versions mentioned above
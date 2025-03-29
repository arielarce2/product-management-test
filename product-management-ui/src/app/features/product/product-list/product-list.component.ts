import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, ProductCreateUpdate } from '../product.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: { id: number; name: string }[] = [];
  filters = {
    name: '',
    category: ''
  };
  sortDirection: 'asc' | 'desc' = 'asc';
  categorySortDirection: 'asc' | 'desc' = 'asc';
  showModal = false;
  showDeleteModal = false;
  currentProduct: ProductCreateUpdate & { id?: number } = {
    name: '',
    category_id: 0
  };
  productToDelete?: Product;
  errorMessage = '';

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products = response.data;
        this.filteredProducts = [...this.products];
        this.applyFilters();
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  private handleError(error: any): void {
    console.error('Error:', error);
    this.errorMessage = error.error?.message || 'An error occurred';
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(this.filters.name.toLowerCase());
      const categoryMatch = !this.filters.category || product.category.id === Number(this.filters.category);
      return nameMatch && categoryMatch;
    });
    this.sortProducts();
  }

  sortByName(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.categorySortDirection = 'asc';
    this.sortProducts();
  }

  sortByCategory(): void {
    this.categorySortDirection = this.categorySortDirection === 'asc' ? 'desc' : 'asc';
    this.sortDirection = 'asc';
    this.sortProducts();
  }

  sortProducts(): void {
    let sorted = [...this.filteredProducts];

    // Aplicar el ordenamiento activo (nombre o categoría)
    sorted.sort((a, b) => {
      if (this.categorySortDirection === 'desc') {
        // Ordenar por categoría
        const categoryComparison = b.category.name.localeCompare(a.category.name);
        return categoryComparison;
      } else {
        // Ordenar por nombre
        const nameComparison = this.sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
        return nameComparison;
      }
    });

    this.filteredProducts = sorted;
  }

  openModal(): void {
    this.currentProduct = {
      name: '',
      category_id: 0
    };
    this.errorMessage = '';
    this.showModal = true;
  }

  editProduct(product: Product): void {
    this.currentProduct = {
      id: product.id,
      name: product.name,
      category_id: product.category.id
    };
    this.errorMessage = '';
    this.showModal = true;
  }

  openDeleteModal(product: Product): void {
    this.productToDelete = product;
    this.errorMessage = '';
    this.showDeleteModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.errorMessage = '';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.errorMessage = '';
    this.productToDelete = undefined;
  }

  onSubmit(): void {
    const productData: ProductCreateUpdate = {
      name: this.currentProduct.name,
      category_id: this.currentProduct.category_id
    };

    if (this.currentProduct.id) {
      this.productService.updateProduct(this.currentProduct.id, productData).subscribe({
        next: () => {
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error updating product';
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          this.closeModal();
          this.loadProducts();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error creating product';
        }
      });
    }
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;

    this.productService.deleteProduct(this.productToDelete.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadProducts();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error deleting product';
      }
    });
  }

  navigateToCategories(): void {
    this.router.navigate(['/categories']);
  }

  openAddModal(): void {
    this.openModal();
  }
}

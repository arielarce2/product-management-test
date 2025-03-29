import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../category.service';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  nameFilter: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  showModal: boolean = false;
  showDeleteModal: boolean = false;
  modalTitle: string = '';
  currentCategory: Partial<Category> = {
    name: ''
  };
  categoryToDelete?: Category;
  error: string = '';

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.applyFilters();
        this.error = '';
      },
      error: (err) => {
        this.error = err.error?.message || 'Error loading categories';
      }
    });
  }

  applyFilters(): void {
    this.filteredCategories = this.categories.filter(category =>
      category.name.toLowerCase().includes(this.nameFilter.toLowerCase())
    );
    this.sortCategories();
  }

  sortByName(): void {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortCategories();
  }

  sortCategories(): void {
    this.filteredCategories.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  openAddModal(): void {
    this.modalTitle = 'Add New Category';
    this.currentCategory = {
      name: ''
    };
    this.error = '';
    this.showModal = true;
  }

  openEditModal(category: Category): void {
    this.modalTitle = 'Edit Category';
    this.currentCategory = {
      id: category.id,
      name: category.name
    };
    this.error = '';
    this.showModal = true;
  }

  openDeleteModal(category: Category): void {
    this.categoryToDelete = category;
    this.error = '';
    this.showDeleteModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.error = '';
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.error = '';
    this.categoryToDelete = undefined;
  }

  onSubmit(): void {
    if (!this.currentCategory.name) {
      this.error = 'Category name is required';
      return;
    }

    if (this.currentCategory.id) {
      this.categoryService.updateCategory(this.currentCategory.id, this.currentCategory).subscribe({
        next: () => {
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
            this.error = err;
          }
      });
    } else {
      this.categoryService.createCategory(this.currentCategory as Omit<Category, 'id' | 'created_at' | 'updated_at'>).subscribe({
        next: () => {
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => {
            this.error = err;
          }
      });
    }
  }

  confirmDelete(): void {
    if (!this.categoryToDelete) return;

    this.categoryService.deleteCategory(this.categoryToDelete.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadCategories();
      },
      error: (err) => {
        this.error = err;
      }
    });
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }
} 
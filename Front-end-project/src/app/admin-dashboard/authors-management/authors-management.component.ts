import { Component, OnInit } from '@angular/core';
import { AuthorService } from '../../services/author.service';
import { Author } from '../../shared/models/author.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-author-management',
  templateUrl: './authors-management.component.html',
  styleUrls: ['./authors-management.component.css']
})
export class AuthorManagementComponent implements OnInit {
  authors: Author[] = [];
  selectedAuthor: Author | null = null;
  isEditing = false;
  isLoading = false;
  error: string | null = null;
  showForm = false;
  showSearchForm = false;
  showAuthorModal = false;
  
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  Math = Math;
  
  authorForm: FormGroup;
  searchForm: FormGroup;
  
  specializations: string[] = [
    'Artificial Intelligence',
    'Machine Learning',
    'Data Science',
    'Software Engineering',
    'Computer Networks',
    'Cybersecurity',
    'Database Systems',
    'Web Development',
    'Mobile Development',
    'Cloud Computing',
    'Computer Graphics',
    'Game Development',
    'Operating Systems',
    'Computer Architecture',
    'Natural Language Processing',
    'Computer Vision',
    'Robotics',
    'Blockchain',
    'Quantum Computing',
    'Human-Computer Interaction'
  ];
  filteredSpecializations: string[] = [];
  showSpecializationDropdown = false;
  
  constructor(
    private authorService: AuthorService,
    private fb: FormBuilder
  ) {
    this.authorForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[^\d]*$/)]],
      email: ['', [Validators.required, Validators.email]],
      bio: ['', Validators.required],
      specialization: ['', Validators.required],
    });

    this.searchForm = this.fb.group({
      query: [''],
      specialization: [''],
      email: ['']
    });
  }

  ngOnInit(): void {
    this.loadAuthors();
  }

  get paginatedAuthors(): Author[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.authors.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  loadAuthors(): void {
    this.isLoading = true;
    this.error = null;

    this.authorService.getAuthors().subscribe({
      next: authors => {
        this.authors = authors;
        this.totalItems = authors.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.currentPage = 1; 
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error loading authors:', error);
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  createAuthor(): void {
    if (this.authorForm.valid) {
      this.isLoading = true;
      this.error = null;

      const newAuthor: Author = {
        id: 0, 
        name: this.authorForm.value.name,
        email: this.authorForm.value.email,
        bio: this.authorForm.value.bio,
        specialization: this.authorForm.value.specialization
      };

      this.authorService.createAuthor(newAuthor).subscribe({
        next: (author) => {
          this.authors = [...this.authors, author];
          this.showForm = false;
          this.resetAuthorForm();
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error creating author:', error);
          if (error.error && error.error.message) {
            this.error = error.error.message;
          } else {
            this.error = 'An author with the same email already exists.';
          } 
          this.isLoading = false;
        }
      });
    }
  }

  editAuthor(author: Author): void {
    this.selectedAuthor = { ...author };
    this.isEditing = true;
    this.showForm = true;
    
    this.authorForm.patchValue({
      name: author.name,
      email: author.email,
      bio: author.bio,
      specialization: author.specialization
    });
  }

  viewAuthorDetails(author: Author): void {
    this.selectedAuthor = author;
    this.showAuthorModal = true;
  }

  closeAuthorModal(): void {
    this.showAuthorModal = false;
    this.selectedAuthor = null;
  }

  submitAuthorUpdate(): void {
    if (this.authorForm.valid && this.selectedAuthor) {
      this.isLoading = true;
      this.error = null;

      const updatedAuthor: Author = {
        id: this.selectedAuthor.id,
        name: this.authorForm.value.name,
        email: this.authorForm.value.email,
        bio: this.authorForm.value.bio,
        specialization: this.authorForm.value.specialization
      };

      this.authorService.updateAuthor(updatedAuthor.id, updatedAuthor).subscribe({
        next: (author) => {
          const index = this.authors.findIndex(a => a.id === author.id);
          if (index !== -1) {
            this.authors[index] = author;
            this.authors = [...this.authors];
          }
          this.showForm = false;
          this.resetAuthorForm();
          this.isLoading = false;
        },
        error: (error: Error) => {
          console.error('Error updating author:', error);
          this.error = error.message;
          this.isLoading = false;
        }
      });
    }
  }

  deleteAuthor(id: number): void {
    if (confirm('Are you sure you want to delete this author?')) {
      this.isLoading = true;
      this.error = null;

      this.authorService.deleteAuthor(id).subscribe({
        next: () => {
          this.authors = this.authors.filter(a => a.id !== id);
          this.isLoading = false;
        },
        error: (error: Error) => {
          console.error('Error deleting author:', error);
          this.error = error.message;
          this.isLoading = false;
        }
      });
    }
  }

  createEmptyAuthor(): void {
    this.selectedAuthor = null;
    this.isEditing = false;
    this.showForm = true;
    this.resetAuthorForm();
  }

  cancelEdit(): void {
    this.selectedAuthor = null;
    this.isEditing = false;
    this.showForm = false;
    this.resetAuthorForm();
  }

  resetAuthorForm(): void {
    this.authorForm.reset();
    this.selectedAuthor = null;
  }

  retryLoading(): void {
    this.error = null;
    this.loadAuthors();
  }

  toggleSearchForm(): void {
    this.showSearchForm = !this.showSearchForm;
    if (!this.showSearchForm) {
      this.searchForm.reset();
      this.loadAuthors();
    }
  }

  performSearch(): void {
    if (this.searchForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.error = null;

    const { query, specialization, email } = this.searchForm.value;

    this.authorService.getAuthors().subscribe({
      next: authors => {
        let filtered = authors;

        if (query) {
          const q = query.toLowerCase();
          filtered = filtered.filter(a =>
            (a.name?.toLowerCase().includes(q)) ||
            (a.bio?.toLowerCase().includes(q))
          );
        }

        if (specialization) {
          filtered = filtered.filter(a => a.specialization === specialization);
        }

        if (email) {
          filtered = filtered.filter(a => a.email?.toLowerCase().includes(email.toLowerCase()));
        }

        this.authors = filtered;
        this.totalItems = filtered.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error filtering authors:', error);
        this.error = error.message;
        this.isLoading = false;
      }
    });
  }

  resetSearch(): void {
    this.searchForm.reset();
    this.loadAuthors();
  }

  onSpecializationSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredSpecializations = this.specializations.filter(spec => 
      spec.toLowerCase().includes(term)
    );
    this.showSpecializationDropdown = true;
  }

  selectSpecialization(spec: string): void {
    this.searchForm.patchValue({ specialization: spec });
    this.showSpecializationDropdown = false;
  }

  onSpecializationBlur(): void {
    setTimeout(() => {
      this.showSpecializationDropdown = false;
    }, 200);
  }
}

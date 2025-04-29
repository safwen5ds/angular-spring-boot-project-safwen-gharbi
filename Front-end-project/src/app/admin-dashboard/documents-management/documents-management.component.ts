import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { DocumentService } from '../../services/document.service';
import { AuthorService } from '../../services/author.service';
import { Document } from '../../shared/models/document.model';
import { Author } from '../../shared/models/author.model';

@Component({
  selector: 'app-document-management',
  templateUrl: './documents-management.component.html',
  styleUrls: ['./documents-management.component.css']
})
export class DocumentManagementComponent implements OnInit {
  documents: Document[] = [];
  filteredAuthors: Author[] = [];
  selectedDocument: Document | null = null;
  isEditing = false;
  isLoading = false;
  error: string | null = null;
  showDocumentForm = false;
  showSearchForm = false;
  showDocumentModal = false;

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  Math = Math;

  documentForm: FormGroup;
  searchForm: FormGroup;
  authorSearchControl: FormControl;

  themes = [
    'Artificial Intelligence & Machine Learning',
    'Big Data & Data Mining',
    'Cybersecurity & Cryptography',
    'Networks, Telecommunications & Internet of Things (IoT)',
    'Embedded Computing & Real-Time Systems',
    'Computer Graphics, Virtual Reality & Computer Vision',
    'Human-Computer Interaction & User Experience (UX)',
    'Cloud Computing, Distributed Systems & Edge Computing',
    'Theoretical Computer Science, Algorithms & Complexity',
    'Blockchain & Decentralized Technologies'
  ];
  fileTypes = ['PDF', 'DOCX', 'TXT', 'HTML', 'Other'];

  constructor(
    private documentService: DocumentService,
    private authorService: AuthorService,
    private fb: FormBuilder
  ) {
    this.documentForm = this.fb.group({
      title:           ['', Validators.required],
      author:          ['', Validators.required],
      authorEmail:     ['', [Validators.required, Validators.email]],
      theme:           ['', Validators.required],
      summary:         ['', Validators.required],
      keywords:        ['', Validators.required],
      publicationDate: ['', Validators.required],
      fileType:        ['', Validators.required],
      fileUrl: [
        '',
        [
          Validators.required,
          Validators.pattern(/^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/)
        ]
      ]
    });

    this.searchForm = this.fb.group({
      query: [''],
      theme: [''],
      author: [''],
      startDate: [''],
      endDate: [''],
      fileType: ['']
    });

    this.authorSearchControl = new FormControl('');
  }

  ngOnInit(): void {
    this.loadDocuments();

    this.authorSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.trim() === '') {
          return of([]);
        }
        return this.authorService.searchAuthors(term);
      })
    ).subscribe({
      next: authors => {
        this.filteredAuthors = authors;
      },
      error: error => {
        console.error('Error searching authors:', error);
        this.filteredAuthors = [];
      }
    });
  }

  selectAuthor(author: Author): void {
    this.documentForm.patchValue({
      author: author.id.toString(),
      authorEmail: author.email
    });
    
    this.authorSearchControl.setValue(author.name, { emitEvent: false });
    
    this.filteredAuthors = [];
  }


  private formatForBackend(dateString: string): string {
    const d = new Date(dateString);
    return d.toISOString().substring(0, 10);
  }

  get paginatedDocuments(): Document[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.documents.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.error = null;

    this.documentService.getDocuments().subscribe({
      next: docs => {
        this.documents = docs;
        this.totalItems = docs.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.currentPage = 1; 
        this.isLoading = false;
      },
      error: err => {
        console.error('Error loading documents:', err);
        this.error = 'Failed to load documents. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  createDocument(): void {
    if (this.documentForm.invalid) {
      return;
    }

    const fv = this.documentForm.value;
    const pubDateTime = this.formatForBackend(fv.publicationDate);

    const newDoc: Document = {
      id: 0,
      title: fv.title,
      author: {
        id: +fv.author,
        email: fv.authorEmail,
        name: this.filteredAuthors.find(a => a.id === +fv.author)?.name || '',
        bio: this.filteredAuthors.find(a => a.id === +fv.author)?.bio,
        specialization: this.filteredAuthors.find(a => a.id === +fv.author)?.specialization
      },
      theme: fv.theme,
      summary: fv.summary,
      keywords: fv.keywords.split(',').map((k: string) => k.trim()),
      publicationDate: pubDateTime,
      fileType: fv.fileType,
      fileUrl: fv.fileUrl
    };

    this.documentService.createDocument(newDoc).subscribe({
      next: doc => {
        this.documents.push(doc);
        this.showDocumentForm = false;
        this.resetDocumentForm();
      },
      error: (error: Error) => {
        console.error('Error creating document:', error);
        this.error = error.message;
      }
    });
  }

  editDocument(document: Document): void {
    this.selectedDocument = { ...document };
    this.isEditing = true;
    this.showDocumentForm = true;

    this.authorSearchControl.setValue(document.author.name, { emitEvent: false });

    this.documentForm.patchValue({
      title: document.title,
      author: document.author.id.toString(),
      authorEmail: document.author.email,
      theme: document.theme,
      summary: document.summary,
      keywords: document.keywords.join(', '),
      publicationDate: document.publicationDate,
      fileType: document.fileType,
      fileUrl: document.fileUrl
    });

    this.documentForm.get('author')?.disable();
  }

  viewDocumentDetails(document: Document): void {
    this.selectedDocument = document;
    this.showDocumentModal = true;
  }

  closeDocumentModal(): void {
    this.showDocumentModal = false;
    this.selectedDocument = null;
  }

  openDocumentUrl(url: string): void {
    if (url && url.trim() !== '') {
      window.open(url, '_blank');
    }
  }

  hasValidUrl(url?: string): boolean {
    return !!url && url.trim() !== '';
  }

  submitDocumentUpdate(): void {
    if (this.documentForm.invalid || !this.selectedDocument) {
      return;
    }

    const fv = this.documentForm.value;
    const pubDateTime = this.formatForBackend(fv.publicationDate);

    const updated: Document = {
      id: this.selectedDocument.id,
      title: fv.title,
      author: {
        id: +fv.author,
        email: fv.authorEmail,
        name: this.filteredAuthors.find(a => a.id === +fv.author)?.name || '',
        bio: this.filteredAuthors.find(a => a.id === +fv.author)?.bio,
        specialization: this.filteredAuthors.find(a => a.id === +fv.author)?.specialization
      },
      theme: fv.theme,
      summary: fv.summary,
      keywords: fv.keywords.split(',').map((k: string) => k.trim()),
      publicationDate: pubDateTime,
      fileType: fv.fileType,
      fileUrl: fv.fileUrl
    };

    this.documentService.updateDocument(updated.id, updated).subscribe({
      next: doc => {
        const idx = this.documents.findIndex(d => d.id === doc.id);
        if (idx !== -1) {
          this.documents[idx] = doc;
          this.documents = [...this.documents];
        }
        this.showDocumentForm = false;
        this.resetDocumentForm();
        this.isEditing = false;
      },
      error: (error: Error) => {
        console.error('Error updating document:', error);
        this.error = error.message;
      }
    });
  }

  deleteDocument(id: number): void {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }
    this.documentService.deleteDocument(id).subscribe({
      next: () => {
        this.documents = this.documents.filter(d => d.id !== id);
      },
      error: (error: Error) => {
        console.error('Error deleting document:', error);
        this.error = error.message;
      }
    });
  }

  createEmptyDocument(): void {
    this.selectedDocument = null;
    this.isEditing = false;
    this.showDocumentForm = true;
    this.resetDocumentForm();
  }

  cancelEdit(): void {
    this.selectedDocument = null;
    this.isEditing = false;
    this.showDocumentForm = false;
    this.resetDocumentForm();
    this.documentForm.get('author')?.enable();
  }

  resetDocumentForm(): void {
    this.documentForm.reset();
    this.selectedDocument = null;
    this.documentForm.get('author')?.enable();
  }

  retryLoading(): void {
    this.error = null;
    this.loadDocuments();
  }

  toggleSearchForm(): void {
    this.showSearchForm = !this.showSearchForm;
    if (!this.showSearchForm) {
      this.searchForm.reset();
      this.loadDocuments();
    }
  }

  performSearch(): void {
    if (this.searchForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.error = null;

    const { query, theme, author, startDate, endDate, fileType } = this.searchForm.value;

    this.documentService.getDocuments().subscribe({
      next: docs => {
        let filtered = docs;

        if (query) {
          const q = query.toLowerCase();
          filtered = filtered.filter(d =>
            (d.title?.toLowerCase().includes(q)) ||
            (d.summary?.toLowerCase().includes(q)) ||
            (d.author?.name?.toLowerCase().includes(q)) ||
            (d.keywords.some(k => k.toLowerCase().includes(q)))
          );
        }

        if (theme) {
          filtered = filtered.filter(d => d.theme === theme);
        }

        if (author) {
          const authorSearchTerm = author.toLowerCase();
          filtered = filtered.filter(d => d.author?.name?.toLowerCase().includes(authorSearchTerm));
        }

        if (fileType) {
          filtered = filtered.filter(d => d.fileType === fileType);
        }

        if (startDate) {
          const start = new Date(startDate);
          filtered = filtered.filter(d => new Date(d.publicationDate) >= start);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filtered = filtered.filter(d => new Date(d.publicationDate) <= end);
        }

        this.documents = filtered;
        this.totalItems = filtered.length;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.currentPage = 1;
        this.isLoading = false;
      },
      error: err => {
        console.error('Error filtering documents:', err);
        this.error = 'Failed to search documents. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  resetSearch(): void {
    this.searchForm.reset();
    this.loadDocuments();
  }
}

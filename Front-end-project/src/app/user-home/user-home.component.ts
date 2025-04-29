import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { DocumentService } from '../services/document.service';
import { AuthorService } from '../services/author.service';
import { Document } from '../shared/models/document.model';
import { Author } from '../shared/models/author.model';
import { ChatbotContextService } from '../services/chatbot-context.service';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css']
})
export class UserHomeComponent implements OnInit {
  documents: Document[] | null = null;
  authors: Author[] = [];
  filteredAuthors: Author[] = [];
  selectedAuthor: Author | null = null;
  isLoading = false;
  error: string | null = null;
  
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  Math = Math;
  
  showDocumentModal = false;
  showAuthorModal = false;
  selectedDocument: Document | null = null;
  
  themes: string[] = [
    'All',
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

  searchForm: FormGroup;
  authorSearchControl: FormControl;

  constructor(
    private documentService: DocumentService,
    private authorService: AuthorService,
    private fb: FormBuilder,
    private chatbotContextService: ChatbotContextService
  ) {
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
    this.loadAuthors();

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
    this.selectedAuthor = author;
    this.searchForm.patchValue({
      author: author.name
    });
    this.filteredAuthors = [];
  }

  filterDocuments(): Document[] {
    const searchValue = this.searchForm.value;
    const filtered = this.documents?.filter(doc => {
      const matchesSearch = !searchValue.query || 
        doc.title.toLowerCase().includes(searchValue.query.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchValue.query.toLowerCase()) ||
        doc.keywords.some(keyword => keyword.toLowerCase().includes(searchValue.query.toLowerCase()));
      
      const matchesTheme = !searchValue.theme || searchValue.theme === 'All' || doc.theme === searchValue.theme;
      
      const matchesAuthor = !searchValue.author || 
        (doc.author && doc.author.name.toLowerCase().includes(searchValue.author.toLowerCase()));
      
      const matchesFileType = !searchValue.fileType || doc.fileType === searchValue.fileType;
      
      const matchesDateRange = (!searchValue.startDate || new Date(doc.publicationDate) >= new Date(searchValue.startDate)) &&
        (!searchValue.endDate || new Date(doc.publicationDate) <= new Date(searchValue.endDate));
      
      return matchesSearch && matchesTheme && matchesAuthor && matchesFileType && matchesDateRange;
    }) || [];

    this.updatePagination(filtered);
    return this.getPaginatedDocuments(filtered);
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.error = null;
    this.documents = null;
    
    this.documentService.getDocuments().subscribe({
      next: (documents) => {
        console.log('Received documents:', documents);
        this.documents = documents.map(doc => {
          if (doc.author && typeof doc.author === 'object' && doc.author.name) {
            return {
              ...doc,
              author: {
                id: doc.author.id || 0,
                name: doc.author.name,
                email: doc.author.email || '',
                bio: doc.author.bio || '',
                specialization: doc.author.specialization || ''
              }
            };
          } else {
            return {
              ...doc,
              author: {
                id: 0,
                name: 'Unknown Author',
                email: '',
                bio: '',
                specialization: ''
              }
            };
          }
        });
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading documents:', error);
        this.error = 'Failed to load documents. Please try again later.';
        this.documents = [];
        this.isLoading = false;
      }
    });
  }

  loadAuthors(): void {
    this.isLoading = true;
    this.error = null;
    
    this.authorService.getAuthors().subscribe({
      next: (authors) => {
        this.authors = authors.map(author => ({
          id: author.id,
          name: author.name,
          email: author.email || '',
          bio: author.bio || '',
          specialization: author.specialization || ''
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading authors:', error);
        this.error = 'Failed to load authors. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  private updatePagination(filteredDocs?: Document[]): void {
    const docs = filteredDocs || this.documents || [];
    this.totalItems = docs.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  getPaginatedDocuments(docs: Document[]): Document[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return docs.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getAuthorName(doc: Document): string {
    if (!doc.author) return 'Unknown Author';
    return doc.author.name || 'Unknown Author';
  }

  retryLoading(): void {
    this.error = null;
    this.loadDocuments();
    this.loadAuthors();
  }

  openDocumentDetails(doc: Document): void {
    this.selectedDocument = doc;
    this.showDocumentModal = true;
    this.chatbotContextService.setDocumentContext(doc);
  }

  closeDocumentModal(): void {
    this.showDocumentModal = false;
    this.selectedDocument = null;
    this.chatbotContextService.setDocumentContext(null);
  }

  openAuthorDetails(author: Author): void {
    this.selectedAuthor = author;
    this.showAuthorModal = true;
  }

  closeAuthorModal(): void {
    this.showAuthorModal = false;
    this.selectedAuthor = null;
  }

  getAuthorDocuments(authorId: number | undefined): Document[] {
    if (!authorId) return [];
    return this.documents?.filter(doc => doc.author && doc.author.id === authorId) || [];
  }

  openDocumentUrl(url: string): void {
    if (url && url.trim() !== '') {
      window.open(url, '_blank');
    }
  }

  hasValidUrl(url?: string): boolean {
    return !!url && url.trim() !== '';
  }

  resetSearch(): void {
    this.searchForm.reset();
    this.currentPage = 1;
  }
}

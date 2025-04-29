import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { AuthorService } from '../../services/author.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  documentCount: number = 0;
  authorCount: number = 0;
  isLoading: boolean = true;

  constructor(
    private documentService: DocumentService,
    private authorService: AuthorService
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.isLoading = true;
    
    this.documentService.getDocuments().subscribe({
      next: (documents) => {
        this.documentCount = documents.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading document count:', error);
        this.isLoading = false;
      }
    });

    this.authorService.getAuthors().subscribe({
      next: (authors) => {
        this.authorCount = authors.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading author count:', error);
        this.isLoading = false;
      }
    });
  }
}

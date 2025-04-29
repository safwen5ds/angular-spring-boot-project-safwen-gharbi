import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Document } from '../shared/models/document.model';

@Injectable({
  providedIn: 'root'
})
export class ChatbotContextService {
  private documentContext = new BehaviorSubject<Document | null>(null);
  documentContext$ = this.documentContext.asObservable();

  setDocumentContext(document: Document | null): void {
    this.documentContext.next(document);
  }

  getDocumentContext(): Document | null {
    return this.documentContext.value;
  }

  formatDocumentForChat(document: Document): string {
    return `
Title: ${document.title}
Author: ${document.author?.name || 'Unknown Author'}
Theme: ${document.theme}
Summary: ${document.summary}
Keywords: ${document.keywords.join(', ')}
Publication Date: ${document.publicationDate}
File Type: ${document.fileType}
${document.fileUrl ? `File URL: ${document.fileUrl}` : ''}
    `.trim();
  }
} 
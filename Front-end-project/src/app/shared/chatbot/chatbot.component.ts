import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Document } from '../../shared/models/document.model';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, OnDestroy {
  @Input() documents: Document[] = [];
  messages: Message[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  private ai: any;
  private model = 'gemini-2.5-flash-preview-04-17';
  private currentResponse = '';
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {
    this.ai = new GoogleGenAI({
      apiKey: 'AIzaSyCqQ5zoX8Peo_ed29hZgIFw64gUX4MC0Y4'
    });
  }

  ngOnInit(): void {
    this.addMessage(
      'assistant',
      `Hi there! I’m your document assistant.  
Ask me anything about your existing documents, or tell me what topic you’d like a new doc on.`
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.currentResponse = '';
  }

  private addMessage(role: Message['role'], content: string) {
    this.messages.push({ role, content });
    this.cdr.detectChanges();
  }

  private formatDocumentsForPrompt(): string {
    if (!this.documents || this.documents.length === 0) {
      return '';
    }
    return this.documents.map(doc => `
Document: ${doc.title}
Author: ${doc.author?.name || 'Unknown'}
Theme: ${doc.theme}
Summary: ${doc.summary}
Keywords: ${doc.keywords.join(', ')}
Publication Date: ${doc.publicationDate}
File Type: ${doc.fileType}
${doc.fileUrl ? `File URL: ${doc.fileUrl}` : ''}
-------------------`).join('\n');
  }

  private createPrompt(userInput: string): string {
    const docsBlock = this.formatDocumentsForPrompt();

    if (!docsBlock) {
      return `
You are a friendly, conversational document assistant.
You can chat normally with the user, ask follow-up questions, and help them find or suggest documents on any topic.
If they ask you to suggest a new document, describe one that would be relevant.

User: ${userInput}
Assistant:`;
    }

    return `
You are a friendly, conversational document assistant.
You have access to the following documents (titles, authors, themes, summaries, keywords, etc.):

${docsBlock}

You can:
 • Answer any questions about these documents, referencing titles or sections.  
 • Ask the user follow-up questions if their request is ambiguous.  
 • Suggest one of the above documents if it fits their need.  
 • Recommend a new document topic (with a mock title/summary) if they ask you to “give me” or “suggest” a doc on something not already provided.

User: ${userInput}
Assistant:`;
  }

  async sendMessage() {
    if (!this.userInput.trim()) return;

    this.addMessage('user', this.userInput);
    this.isLoading = true;
    this.currentResponse = '';
    this.cdr.detectChanges();

    try {
      const prompt = this.createPrompt(this.userInput);
      const config = { responseMimeType: 'text/plain' };
      const contents = [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ];

      this.addMessage('assistant', '');
      this.cdr.detectChanges();

      const response = await this.ai.models.generateContentStream({
        model: this.model,
        config,
        contents
      });

      for await (const chunk of response) {
        this.currentResponse += chunk.text;
        this.messages[this.messages.length - 1].content = this.currentResponse;
        this.cdr.detectChanges();
      }

    } catch (error) {
      console.error('Error:', error);
      this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      this.cdr.detectChanges();
    } finally {
      this.isLoading = false;
      this.userInput = '';
      this.currentResponse = '';
      this.cdr.detectChanges();
    }
  }
}

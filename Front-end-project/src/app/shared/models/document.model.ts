import { Author } from './author.model';

export interface Document {
    id: number;
    title: string;
    author: Author;
    theme: string;
    summary: string;
    keywords: string[];
    publicationDate: string;
    fileType: string;
    fileUrl?: string;
} 
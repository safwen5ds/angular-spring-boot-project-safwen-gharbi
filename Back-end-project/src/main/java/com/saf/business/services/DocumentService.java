package com.saf.business.services;

import com.saf.dao.entities.Document;
import com.saf.exceptions.DuplicateDocumentException;
import java.util.List;
import java.util.Optional;

public interface DocumentService {
    List<Document> getAllDocuments();
    Optional<Document> getDocumentById(Long id);
    Document createDocument(Document document) throws DuplicateDocumentException;
    Document updateDocument(Long id, Document document) throws DuplicateDocumentException;
    void deleteDocument(Long id);
    List<Document> searchDocuments(String query);
} 
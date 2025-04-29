package com.saf.business.serviceImpl;

import com.saf.business.services.DocumentService;
import com.saf.dao.entities.Document;
import com.saf.dao.entities.Author;
import com.saf.dao.repository.DocumentRepository;
import com.saf.dao.repository.AuthorRepository;
import com.saf.exceptions.DuplicateDocumentException;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentServiceImpl implements DocumentService {
    private static final Logger log = LoggerFactory.getLogger(DocumentServiceImpl.class);
    private final DocumentRepository documentRepository;
    private final AuthorRepository authorRepository;

    @Autowired
    public DocumentServiceImpl(DocumentRepository documentRepository, AuthorRepository authorRepository) {
        this.documentRepository = documentRepository;
        this.authorRepository = authorRepository;
    }

    @Override
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }

    @Override
    public Optional<Document> getDocumentById(Long id) {
        return documentRepository.findById(id);
    }

    @Override
    @Transactional
    public Document createDocument(Document document) throws DuplicateDocumentException {
        log.info("Attempting to create document: {}", document);

        try {
            boolean titleExists = documentRepository.findAll().stream()
                .anyMatch(d ->
                    d.getTitle() != null
                    && d.getTitle().equals(document.getTitle())
                );
            if (titleExists) {
                log.error("Duplicate title on create: {}", document.getTitle());
                throw new DuplicateDocumentException(
                    "A document with the title '" + document.getTitle() + "' already exists."
                );
            }

            Author author = null;
            if (document.getAuthor() != null) {
                Author incoming = document.getAuthor();

                if (incoming.getId() != null) {
                    author = authorRepository.findById(incoming.getId())
                        .orElseThrow(() -> {
                            log.error("Author not found with id: {}", incoming.getId());
                            return new EntityNotFoundException(
                                "Author not found with id: " + incoming.getId()
                            );
                        });

                } else if (incoming.getEmail() != null && !incoming.getEmail().trim().isEmpty()) {
                    Optional<Author> byEmail = authorRepository.findAll().stream()
                        .filter(a -> incoming.getEmail().equals(a.getEmail()))
                        .findFirst();
                    if (byEmail.isPresent()) {
                        author = byEmail.get();
                    } else {
                        author = authorRepository.save(incoming);
                    }

                } else {
                    author = authorRepository.save(incoming);
                }
            }
            document.setAuthor(author);

            if (document.getPublicationDate() == null) {
                document.setPublicationDate(LocalDateTime.now());
            }

            validateRequiredFields(document);

            try {
                Document savedDocument = documentRepository.save(document);
                log.info("Successfully created document with id: {}", savedDocument.getId());
                return savedDocument;

            } catch (DataIntegrityViolationException e) {
                log.error("Integrity violation on create: {}", e.getMessage());
                throw new DuplicateDocumentException(
                    "A document with the same title already exists."
                );
            }
        } catch (DuplicateDocumentException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error creating document: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create document: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public Document updateDocument(Long id, Document document) throws DuplicateDocumentException {
        log.info("Attempting to update document with id: {}", id);

        Document existing = documentRepository.findById(id)
            .orElseThrow(() -> {
                log.error("Document not found with id: {}", id);
                return new EntityNotFoundException("Document not found with id: " + id);
            });

        boolean titleConflict = documentRepository.findAll().stream()
            .filter(d -> d.getTitle() != null
                         && d.getTitle().equals(document.getTitle()))
            .anyMatch(d -> !d.getId().equals(id));
        if (titleConflict) {
            log.error("Duplicate title on update: {}", document.getTitle());
            throw new DuplicateDocumentException(
                "A document with the title '" + document.getTitle() + "' already exists."
            );
        }

        Author author = null;
        if (document.getAuthor() != null) {
            Author incoming = document.getAuthor();
            if (incoming.getId() != null) {
                author = authorRepository.findById(incoming.getId())
                    .orElseThrow(() -> {
                        log.error("Author not found with id: {}", incoming.getId());
                        return new EntityNotFoundException(
                            "Author not found with id: " + incoming.getId()
                        );
                    });
            } else if (incoming.getEmail() != null && !incoming.getEmail().trim().isEmpty()) {
                Optional<Author> byEmail = authorRepository.findAll().stream()
                    .filter(a -> incoming.getEmail().equals(a.getEmail()))
                    .findFirst();
                author = byEmail.orElseGet(() -> authorRepository.save(incoming));
            } else {
                author = authorRepository.save(incoming);
            }
        }

        existing.setTitle(document.getTitle());
        existing.setTheme(document.getTheme());
        existing.setSummary(document.getSummary());
        existing.setFileType(document.getFileType());
        existing.setFileUrl(document.getFileUrl());
        existing.setPublicationDate(
            document.getPublicationDate() != null
                ? document.getPublicationDate()
                : existing.getPublicationDate());
        existing.setAuthor(author);

        validateRequiredFields(existing);

        try {
            Document updated = documentRepository.save(existing);
            log.info("Successfully updated document with id: {}", id);
            return updated;

        } catch (DataIntegrityViolationException e) {
            log.error("Integrity violation on update (shouldn't happen): {}", e.getMessage());
            throw new DuplicateDocumentException(
                "A document with the same title already exists."
            );
        } catch (Exception e) {
            log.error("Unexpected error updating document: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update document: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteDocument(Long id) {
        log.info("Attempting to delete document with id: {}", id);

        if (!documentRepository.existsById(id)) {
            log.error("Document not found with id: {}", id);
            throw new EntityNotFoundException("Document not found with id: " + id);
        }

        documentRepository.deleteById(id);
        log.info("Successfully deleted document with id: {}", id);
    }

    @Override
    public List<Document> searchDocuments(String query) {
        return documentRepository.searchDocuments(query);
    }

    private void validateRequiredFields(Document document) {
        StringBuilder missingFields = new StringBuilder();

        if (document.getTitle() == null || document.getTitle().trim().isEmpty()) {
            missingFields.append("title, ");
        }
        if (document.getTheme() == null || document.getTheme().trim().isEmpty()) {
            missingFields.append("theme, ");
        }
        if (document.getSummary() == null || document.getSummary().trim().isEmpty()) {
            missingFields.append("summary, ");
        }
        if (document.getFileType() == null || document.getFileType().trim().isEmpty()) {
            missingFields.append("fileType, ");
        }
        if (document.getFileUrl() == null || document.getFileUrl().trim().isEmpty()) {
            missingFields.append("fileUrl, ");
        }

        if (missingFields.length() > 0) {
            String errorMessage = "Missing required fields: "
                + missingFields.substring(0, missingFields.length() - 2);
            log.error(errorMessage);
            throw new IllegalArgumentException(errorMessage);
        }
    }
}

package com.saf.business.serviceImpl;

import com.saf.business.services.AuthorService;
import com.saf.dao.entities.Author;
import com.saf.dao.repository.AuthorRepository;
import com.saf.exceptions.DuplicateAuthorException;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AuthorServiceImpl implements AuthorService {
    private static final Logger log = LoggerFactory.getLogger(AuthorServiceImpl.class);
    private final AuthorRepository authorRepository;

    @Autowired
    public AuthorServiceImpl(AuthorRepository authorRepository) {
        this.authorRepository = authorRepository;
    }

    @Override
    public List<Author> getAllAuthors() {
        return authorRepository.findAll();
    }

    @Override
    public Optional<Author> getAuthorById(Long id) {
        return authorRepository.findById(id);
    }

    @Override
    public Optional<Author> getAuthorByEmail(String email) {
        return authorRepository.findByEmail(email);
    }

    @Override
    public Optional<Author> getAuthorByName(String name) {
        return authorRepository.findByName(name);
    }

    @Override
    @Transactional(rollbackFor = DuplicateAuthorException.class)
    public Author createAuthor(Author author) throws DuplicateAuthorException {
        log.info("Attempting to create author: {}", author);

        validateRequiredFields(author);

        if (authorRepository.existsByEmail(author.getEmail())) {
            log.error("Duplicate email on create: {}", author.getEmail());
            throw new DuplicateAuthorException(
                "An author with the email '" + author.getEmail() + "' already exists."
            );
        }

        try {
            Author savedAuthor = authorRepository.save(author);
            log.info("Successfully created author with id: {}", savedAuthor.getId());
            return savedAuthor;
        } catch (DataIntegrityViolationException e) {
            log.error("Integrity violation on create: {}", e.getMessage());
            throw new DuplicateAuthorException(
                "An author with the same email already exists."
            );
        } catch (Exception e) {
            log.error("Unexpected error creating author: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create author: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public Author updateAuthor(Long id, Author author) throws DuplicateAuthorException {
        log.info("Attempting to update author with id: {}", id);

        validateRequiredFields(author);

        Author existing = authorRepository.findById(id)
            .orElseThrow(() -> {
                log.error("Author not found with id: {}", id);
                return new EntityNotFoundException("Author not found with id: " + id);
            });

        if (!existing.getEmail().equals(author.getEmail()) && 
            authorRepository.existsByEmail(author.getEmail())) {
            log.error("Duplicate email on update: {}", author.getEmail());
            throw new DuplicateAuthorException(
                "An author with the email '" + author.getEmail() + "' already exists."
            );
        }

        existing.setName(author.getName());
        existing.setEmail(author.getEmail());
        existing.setBio(author.getBio());
        existing.setSpecialization(author.getSpecialization());

        try {
            Author updated = authorRepository.save(existing);
            log.info("Successfully updated author with id: {}", id);
            return updated;
        } catch (DataIntegrityViolationException e) {
            log.error("Integrity violation on update: {}", e.getMessage());
            throw new DuplicateAuthorException(
                "An author with the same email already exists."
            );
        } catch (Exception e) {
            log.error("Unexpected error updating author: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update author: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteAuthor(Long id) {
        log.info("Attempting to delete author with id: {}", id);

        if (!authorRepository.existsById(id)) {
            log.error("Author not found with id: {}", id);
            throw new EntityNotFoundException("Author not found with id: " + id);
        }

        authorRepository.deleteById(id);
        log.info("Successfully deleted author with id: {}", id);
    }

    private void validateRequiredFields(Author author) {
        StringBuilder missingFields = new StringBuilder();

        if (author.getName() == null || author.getName().trim().isEmpty()) {
            missingFields.append("name, ");
        }
        if (author.getEmail() == null || author.getEmail().trim().isEmpty()) {
            missingFields.append("email, ");
        }
        if (author.getBio() == null || author.getBio().trim().isEmpty()) {
            missingFields.append("bio, ");
        }
        if (author.getSpecialization() == null || author.getSpecialization().trim().isEmpty()) {
            missingFields.append("specialization, ");
        }

        if (missingFields.length() > 0) {
            String errorMessage = "Missing required fields: "
                + missingFields.substring(0, missingFields.length() - 2);
            log.error(errorMessage);
            throw new IllegalArgumentException(errorMessage);
        }
    }

    @Override
    public List<Author> searchAuthors(String query) {
        return authorRepository.searchByTerm(query);
    }
} 
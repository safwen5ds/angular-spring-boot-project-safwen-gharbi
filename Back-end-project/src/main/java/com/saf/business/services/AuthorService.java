package com.saf.business.services;

import com.saf.dao.entities.Author;
import com.saf.exceptions.DuplicateAuthorException;
import java.util.List;
import java.util.Optional;

public interface AuthorService {
    List<Author> getAllAuthors();
    Optional<Author> getAuthorById(Long id);
    Optional<Author> getAuthorByEmail(String email);
    Optional<Author> getAuthorByName(String name);
    Author createAuthor(Author author) throws DuplicateAuthorException;
    Author updateAuthor(Long id, Author author) throws DuplicateAuthorException;
    void deleteAuthor(Long id);
    List<Author> searchAuthors(String query);
} 
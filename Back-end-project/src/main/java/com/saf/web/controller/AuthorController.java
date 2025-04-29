package com.saf.web.controller;

import com.saf.business.services.AuthorService;
import com.saf.dao.entities.Author;
import com.saf.exceptions.DuplicateAuthorException;
import com.saf.web.dto.AuthorDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/authors")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class AuthorController {

    private final AuthorService authorService;

    @Autowired
    public AuthorController(AuthorService authorService) {
        this.authorService = authorService;
    }

    @GetMapping
    public ResponseEntity<List<AuthorDTO>> getAllAuthors() {
        List<Author> authors = authorService.getAllAuthors();
        List<AuthorDTO> authorDTOs = authors.stream()
                .map(AuthorDTO::fromAuthor)
                .collect(Collectors.toList());
        return ResponseEntity.ok(authorDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthorDTO> getAuthorById(@PathVariable Long id) {
        Optional<Author> author = authorService.getAuthorById(id);
        return author.map(a -> ResponseEntity.ok(AuthorDTO.fromAuthor(a)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<AuthorDTO> getAuthorByEmail(@PathVariable String email) {
        Optional<Author> author = authorService.getAuthorByEmail(email);
        return author.map(a -> ResponseEntity.ok(AuthorDTO.fromAuthor(a)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<AuthorDTO> getAuthorByName(@PathVariable String name) {
        Optional<Author> author = authorService.getAuthorByName(name);
        return author.map(a -> ResponseEntity.ok(AuthorDTO.fromAuthor(a)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AuthorDTO> createAuthor(@RequestBody AuthorDTO authorDTO) throws DuplicateAuthorException {
        try {
            Author author = AuthorDTO.toAuthor(authorDTO);
            Author createdAuthor = authorService.createAuthor(author);
            return new ResponseEntity<>(AuthorDTO.fromAuthor(createdAuthor), HttpStatus.CREATED);
        } catch (DuplicateAuthorException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new AuthorDTO()); 
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuthorDTO> updateAuthor(@PathVariable Long id, @RequestBody AuthorDTO authorDTO) throws DuplicateAuthorException {
        Author author = AuthorDTO.toAuthor(authorDTO);
        Author updatedAuthor = authorService.updateAuthor(id, author);
        return ResponseEntity.ok(AuthorDTO.fromAuthor(updatedAuthor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuthor(@PathVariable Long id) {
        authorService.deleteAuthor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<AuthorDTO>> searchAuthors(@RequestParam String query) {
        List<Author> authors = authorService.searchAuthors(query);
        List<AuthorDTO> authorDTOs = authors.stream()
                .map(AuthorDTO::fromAuthor)
                .collect(Collectors.toList());
        return ResponseEntity.ok(authorDTOs);
    }
} 
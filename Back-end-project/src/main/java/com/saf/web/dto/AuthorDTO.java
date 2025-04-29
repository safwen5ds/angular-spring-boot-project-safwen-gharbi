package com.saf.web.dto;

import com.saf.dao.entities.Author;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Data
public class AuthorDTO {
    private Long id;
    private String name;
    private String email;
    private String bio;
    private String specialization;
    private Set<DocumentDTO> documents;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AuthorDTO fromAuthor(Author author) {
        AuthorDTO dto = new AuthorDTO();
        dto.setId(author.getId());
        dto.setName(author.getName());
        dto.setEmail(author.getEmail());
        dto.setBio(author.getBio());
        dto.setSpecialization(author.getSpecialization());
        if (author.getDocuments() != null) {
            dto.setDocuments(author.getDocuments().stream()
                    .map(DocumentDTO::fromDocument)
                    .collect(Collectors.toSet()));
        }
        dto.setCreatedAt(author.getCreatedAt());
        dto.setUpdatedAt(author.getUpdatedAt());
        return dto;
    }

    public static Author toAuthor(AuthorDTO dto) {
        Author author = new Author();
        author.setId(dto.getId());
        author.setName(dto.getName());
        author.setEmail(dto.getEmail());
        author.setBio(dto.getBio());
        author.setSpecialization(dto.getSpecialization());
        if (dto.getDocuments() != null) {
            author.setDocuments(dto.getDocuments().stream()
                    .map(DocumentDTO::toDocument)
                    .collect(Collectors.toSet()));
        }
        author.setCreatedAt(dto.getCreatedAt());
        author.setUpdatedAt(dto.getUpdatedAt());
        return author;
    }
} 
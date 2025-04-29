package com.saf.web.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.saf.dao.entities.Document;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class DocumentDTO {
    private Long id;
    private String title;
    private String summary;
    private List<String> keywords;
    private String fileUrl;
    private String fileType;
    private AuthorDTO author;
    private String theme;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate publicationDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private LocalDateTime updatedAt;

    public static DocumentDTO fromDocument(Document document) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(document.getId());
        dto.setTitle(document.getTitle());
        dto.setSummary(document.getSummary());
        dto.setKeywords(document.getKeywords());
        dto.setFileUrl(document.getFileUrl());
        dto.setFileType(document.getFileType());
        if (document.getAuthor() != null) {
            dto.setAuthor(AuthorDTO.fromAuthor(document.getAuthor()));
        }
        dto.setTheme(document.getTheme());
        dto.setPublicationDate(document.getPublicationDate() != null
            ? document.getPublicationDate().toLocalDate()
            : null);
        dto.setCreatedAt(document.getCreatedAt());
        dto.setUpdatedAt(document.getUpdatedAt());
        return dto;
    }

    public static Document toDocument(DocumentDTO dto) {
        Document document = new Document();
        document.setId(dto.getId());
        document.setTitle(dto.getTitle());
        document.setSummary(dto.getSummary());
        document.setKeywords(dto.getKeywords());
        document.setFileUrl(dto.getFileUrl());
        document.setFileType(dto.getFileType());
        if (dto.getAuthor() != null) {
            document.setAuthor(AuthorDTO.toAuthor(dto.getAuthor()));
        }
        document.setTheme(dto.getTheme());
        document.setPublicationDate(dto.getPublicationDate() != null
            ? dto.getPublicationDate().atStartOfDay()
            : null);
        document.setCreatedAt(dto.getCreatedAt());
        document.setUpdatedAt(dto.getUpdatedAt());
        return document;
    }
}

package com.saf.web.controller;

import com.saf.dao.entities.Document;
import com.saf.dao.entities.Author;
import com.saf.business.services.DocumentService;
import com.saf.business.services.AuthorService;
import com.saf.exceptions.DuplicateAuthorException;
import com.saf.exceptions.DuplicateDocumentException;
import com.saf.web.dto.DocumentDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class DocumentController {
    private final DocumentService documentService;
    private final AuthorService authorService;

    @Autowired
    public DocumentController(DocumentService documentService, AuthorService authorService) {
        this.documentService = documentService;
        this.authorService = authorService;
    }

    @GetMapping
    public ResponseEntity<List<DocumentDTO>> getAllDocuments() {
        List<Document> documents = documentService.getAllDocuments();
        List<DocumentDTO> documentDTOs = documents.stream()
                .map(DocumentDTO::fromDocument)
                .collect(Collectors.toList());
        return ResponseEntity.ok(documentDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDTO> getDocumentById(@PathVariable Long id) {
        Optional<Document> document = documentService.getDocumentById(id);
        return document.map(d -> ResponseEntity.ok(DocumentDTO.fromDocument(d)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DocumentDTO> createDocument(@RequestBody DocumentDTO documentDTO) throws DuplicateDocumentException {
        try {
            Document document = DocumentDTO.toDocument(documentDTO);
            Document createdDocument = documentService.createDocument(document);
            return new ResponseEntity<>(DocumentDTO.fromDocument(createdDocument), HttpStatus.CREATED);
        } catch (DuplicateDocumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new DocumentDTO()); 
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentDTO> updateDocument(@PathVariable Long id, @RequestBody DocumentDTO documentDTO) throws DuplicateDocumentException {
        try {
            Document document = DocumentDTO.toDocument(documentDTO);
            Document updatedDocument = documentService.updateDocument(id, document);
            return ResponseEntity.ok(DocumentDTO.fromDocument(updatedDocument));
        } catch (DuplicateDocumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new DocumentDTO());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<DocumentDTO>> searchDocuments(@RequestParam String query) {
        List<Document> documents = documentService.searchDocuments(query);
        List<DocumentDTO> documentDTOs = documents.stream()
                .map(DocumentDTO::fromDocument)
                .collect(Collectors.toList());
        return ResponseEntity.ok(documentDTOs);
    }

    /**
     * Maps JSON payload into the Document entity.
     *
     * @param doc       the target document (new or existing)
     * @param payload   the request body
     * @param isUpdate  if true, leave unspecified fields intact
     */
    private Document mapToDocument(Document doc,
                                  Map<String, Object> payload,
                                  boolean isUpdate) {

        // 1) Basic fields (always overwrite)
        doc.setTitle((String) payload.get("title"));
        doc.setSummary((String) payload.get("summary"));
        doc.setTheme((String) payload.get("theme"));
        doc.setFileUrl((String) payload.get("fileUrl"));
        doc.setFileType((String) payload.get("fileType"));

        // 2) Author: only if the client sent an "author" key
        if (payload.containsKey("author")) {
            Object authorObj = payload.get("author");
            if (authorObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String,Object> authorMap = (Map<String,Object>) authorObj;
                // a) If they gave us an 'id', load that existing Author
                if (authorMap.containsKey("id")) {
                    Object raw = authorMap.get("id");
                    Long authorId = null;
                    if (raw instanceof Number) {
                        authorId = ((Number) raw).longValue();
                    } else {
                        try {
                            authorId = Long.parseLong(raw.toString());
                        } catch (NumberFormatException ignored) {}
                    }
                    if (authorId != null) {
                        authorService.getAuthorById(authorId)
                                     .ifPresent(doc::setAuthor);
                    }
                }
                // b) Else if they gave us a 'name', find-or-create
                else if (authorMap.containsKey("name")) {
                    String name = (String) authorMap.get("name");
                    authorService.getAuthorByName(name)
                        .ifPresentOrElse(
                            doc::setAuthor,
                            () -> {
                                Author a = new Author();
                                a.setName(name);
                                if (authorMap.containsKey("email"))
                                    a.setEmail((String) authorMap.get("email"));
                                if (authorMap.containsKey("bio"))
                                    a.setBio((String) authorMap.get("bio"));
                                try {
                                    doc.setAuthor(authorService.createAuthor(a));
                                } catch (DuplicateAuthorException e) {
                                    // TODO Auto-generated catch block
                                    e.printStackTrace();
                                }
                            }
                        );
                }
            }
            else if (authorObj instanceof String) {
                String name = (String) authorObj;
                authorService.getAuthorByName(name)
                    .ifPresentOrElse(
                        doc::setAuthor,
                        () -> {
                            Author a = new Author();
                            a.setName(name);
                            try {
                                doc.setAuthor(authorService.createAuthor(a));
                            } catch (DuplicateAuthorException e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                            }
                        }
                    );
            }
            // if authorObj == null and you truly want to clear it, uncomment:
            // else if (authorObj == null) {
            //     doc.setAuthor(null);
            // }
        }
        // else: payload omitted "author" → leave doc.getAuthor() as-is

        // 3) Keywords
        if (payload.containsKey("keywords")) {
            @SuppressWarnings("unchecked")
            List<String> kws = (List<String>) payload.get("keywords");
            doc.setKeywords(kws);
        }

        // 4) Publication date
        if (payload.containsKey("publicationDate")) {
            String dateStr = (String) payload.get("publicationDate");
            try {
                LocalDateTime dt = LocalDateTime.parse(
                    dateStr + "T00:00:00",
                    DateTimeFormatter.ISO_DATE_TIME
                );
                doc.setPublicationDate(dt);
            } catch (Exception e) {
                doc.setPublicationDate(LocalDateTime.now());
            }
        } else if (!isUpdate) {
            // ensure non-null on create
            doc.setPublicationDate(LocalDateTime.now());
        }

        return doc;
    }
}

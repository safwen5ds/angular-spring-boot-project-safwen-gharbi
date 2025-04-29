package com.saf.dao.repository;

import com.saf.dao.entities.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    @Query("SELECT d FROM Document d WHERE " +
           "LOWER(d.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.summary) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.author.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.theme) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "EXISTS (SELECT k FROM d.keywords k WHERE LOWER(k) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Document> searchDocuments(@Param("query") String query);
} 
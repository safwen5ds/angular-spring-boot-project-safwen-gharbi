package com.saf.dao.repository;

import com.saf.dao.entities.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {
    Optional<Author> findByEmail(String email);
    Optional<Author> findByName(String name);
    boolean existsByEmail(String email);
    @Query("SELECT a FROM Author a " +
           "WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :term, '%')) " +
           "   OR LOWER(a.email) LIKE LOWER(CONCAT('%', :term, '%')) " +
           "   OR LOWER(a.specialization) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Author> searchByTerm(@Param("term") String term);
} 
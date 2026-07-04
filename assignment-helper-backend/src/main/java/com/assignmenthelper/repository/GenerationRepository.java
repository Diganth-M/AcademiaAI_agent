package com.assignmenthelper.repository;

import com.assignmenthelper.model.Generation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GenerationRepository extends JpaRepository<Generation, Long> {
    List<Generation> findByDocumentIdOrderByCreatedAtDesc(Long documentId);
}

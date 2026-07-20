package com.assignmenthelper.repository;

import com.assignmenthelper.model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    Optional<ChatSession> findByDocumentIdAndUserId(Long documentId, Long userId);
    List<ChatSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ChatSession> findByDocumentId(Long documentId);
    void deleteByDocumentId(Long documentId);
    Optional<ChatSession> findByConversationIdAndUserId(String conversationId, Long userId);
    Optional<ChatSession> findByConversationId(String conversationId);
    void deleteByConversationIdAndUserId(String conversationId, Long userId);
}

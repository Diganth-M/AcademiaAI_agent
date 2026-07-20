package com.assignmenthelper.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;
    
    @Column(nullable = false)
    private String title;
    
    @Column(name = "file_path")
    private String filePath;
    
    @Column(name = "extracted_text", columnDefinition = "LONGTEXT")
    private String extractedText;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "source_type")
    @Enumerated(EnumType.STRING)
    private DocumentSourceType sourceType = DocumentSourceType.USER_UPLOAD;
    
    @Column(name = "default_document_id")
    private String defaultDocumentId;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public DocumentSourceType getSourceType() { return sourceType; }
    public void setSourceType(DocumentSourceType sourceType) { this.sourceType = sourceType; }
    public String getDefaultDocumentId() { return defaultDocumentId; }
    public void setDefaultDocumentId(String defaultDocumentId) { this.defaultDocumentId = defaultDocumentId; }
}

package com.assignmenthelper.dto;

public class AIRequest {
    private Long documentId;
    private String type; // EXPLANATION, ASSIGNMENT, MCQ, VIVA
    private String additionalPrompt; // e.g. "Questions: Q1, Q2"
    private String language;

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getAdditionalPrompt() { return additionalPrompt; }
    public void setAdditionalPrompt(String additionalPrompt) { this.additionalPrompt = additionalPrompt; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}

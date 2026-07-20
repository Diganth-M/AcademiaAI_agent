package com.assignmenthelper.dto;

public class ChatRequest {
    private Long documentId;
    private String message;
    private String generatedContext;
    private String language;
    private String base64Image;

    private String conversationId;
    private String pageContext;
    private String generationType;

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public String getPageContext() { return pageContext; }
    public void setPageContext(String pageContext) { this.pageContext = pageContext; }

    public String getGenerationType() { return generationType; }
    public void setGenerationType(String generationType) { this.generationType = generationType; }

    public String getBase64Image() {
        return base64Image;
    }
    public void setBase64Image(String base64Image) {
        this.base64Image = base64Image;
    }

    public Long getDocumentId() {
        return documentId;
    }
    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public String getGeneratedContext() {
        return generatedContext;
    }
    public void setGeneratedContext(String generatedContext) {
        this.generatedContext = generatedContext;
    }
    public String getLanguage() {
        return language;
    }
    public void setLanguage(String language) {
        this.language = language;
    }
}

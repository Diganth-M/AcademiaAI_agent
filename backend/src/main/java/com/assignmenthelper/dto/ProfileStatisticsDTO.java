package com.assignmenthelper.dto;

import java.time.LocalDateTime;

public class ProfileStatisticsDTO {
    private LocalDateTime accountCreatedDate;
    private LocalDateTime lastLoginDate;
    private Boolean emailVerified;
    private Long uploadedDocumentsCount;
    private Long generatedAssignmentsCount;
    private Long generatedMcqsCount;
    private Long generatedVivaQuestionsCount;

    // Getters and setters
    public LocalDateTime getAccountCreatedDate() { return accountCreatedDate; }
    public void setAccountCreatedDate(LocalDateTime accountCreatedDate) { this.accountCreatedDate = accountCreatedDate; }

    public LocalDateTime getLastLoginDate() { return lastLoginDate; }
    public void setLastLoginDate(LocalDateTime lastLoginDate) { this.lastLoginDate = lastLoginDate; }

    public Boolean getEmailVerified() { return emailVerified; }
    public void setEmailVerified(Boolean emailVerified) { this.emailVerified = emailVerified; }

    public Long getUploadedDocumentsCount() { return uploadedDocumentsCount; }
    public void setUploadedDocumentsCount(Long uploadedDocumentsCount) { this.uploadedDocumentsCount = uploadedDocumentsCount; }

    public Long getGeneratedAssignmentsCount() { return generatedAssignmentsCount; }
    public void setGeneratedAssignmentsCount(Long generatedAssignmentsCount) { this.generatedAssignmentsCount = generatedAssignmentsCount; }

    public Long getGeneratedMcqsCount() { return generatedMcqsCount; }
    public void setGeneratedMcqsCount(Long generatedMcqsCount) { this.generatedMcqsCount = generatedMcqsCount; }

    public Long getGeneratedVivaQuestionsCount() { return generatedVivaQuestionsCount; }
    public void setGeneratedVivaQuestionsCount(Long generatedVivaQuestionsCount) { this.generatedVivaQuestionsCount = generatedVivaQuestionsCount; }
}

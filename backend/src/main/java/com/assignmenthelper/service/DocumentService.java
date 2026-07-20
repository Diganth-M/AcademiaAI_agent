package com.assignmenthelper.service;

import com.assignmenthelper.model.Document;
import com.assignmenthelper.model.User;
import com.assignmenthelper.repository.DocumentRepository;
import com.assignmenthelper.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.List;

@Service
public class DocumentService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PdfService pdfService;

    @Autowired
    private AiService aiService;

    @Autowired
    private com.assignmenthelper.repository.GenerationRepository generationRepository;

    @Autowired
    private com.assignmenthelper.repository.ChatSessionRepository chatSessionRepository;

    @Autowired
    private com.assignmenthelper.repository.ChatMessageRepository chatMessageRepository;

    public Document saveDocument(MultipartFile file, String username) throws IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create directory if not exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save file locally
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath.toAbsolutePath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);

        // Extract text if PDF, or just read if txt
        String extractedText = "";
        if (file.getOriginalFilename().toLowerCase().endsWith(".pdf")) {
            extractedText = pdfService.extractTextFromPdf(file);
        } else {
            extractedText = new String(file.getBytes());
        }

        // Save to DB
        Document document = new Document();
        document.setUser(user);
        document.setTitle(file.getOriginalFilename());
        document.setFilePath(filePath.toString());
        document.setExtractedText(extractedText);
        document.setSourceType(com.assignmenthelper.model.DocumentSourceType.USER_UPLOAD);
        
        return documentRepository.save(document);
    }
    
    public Document saveDefaultDocument(String defaultDocumentId, String username) throws IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user already has this default document
        java.util.Optional<Document> existingDoc = documentRepository.findByUserIdAndDefaultDocumentId(user.getId(), defaultDocumentId);
        if (existingDoc.isPresent()) {
            return existingDoc.get();
        }

        // Read from resources
        String filename = defaultDocumentId + ".txt";
        org.springframework.core.io.Resource resource = new org.springframework.core.io.ClassPathResource("default-documents/" + filename);
        
        if (!resource.exists()) {
            throw new RuntimeException("Default document not found: " + filename);
        }

        // Extract text
        String extractedText = new String(resource.getInputStream().readAllBytes());

        // Validate text length
        if (extractedText == null || extractedText.trim().length() < 100) {
             throw new RuntimeException("Default document is currently unavailable. Not enough content extracted.");
        }

        // Save to DB
        Document document = new Document();
        document.setUser(user);
        
        // Map ID to Title
        String title = defaultDocumentId;
        if (defaultDocumentId.equals("java-basics")) title = "Java Basics";
        if (defaultDocumentId.equals("python-basics")) title = "Python Basics";
        if (defaultDocumentId.equals("oops-concepts")) title = "OOP Concepts";
        if (defaultDocumentId.equals("sql-basics")) title = "SQL Basics";
        
        document.setTitle(title);
        document.setFilePath("classpath:default-documents/" + filename);
        document.setExtractedText(extractedText);
        document.setSourceType(com.assignmenthelper.model.DocumentSourceType.DEFAULT_DOCUMENT);
        document.setDefaultDocumentId(defaultDocumentId);
        
        return documentRepository.save(document);
    }
    
    public List<Document> getUserDocuments(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return documentRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }
    
    public Document getDocumentByIdAndUser(Long documentId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
                
        if (!doc.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to access this document");
        }
        return doc;
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteDocument(Long documentId, String username) {
        Document doc = getDocumentByIdAndUser(documentId, username);
        
        // Delete associated generations
        generationRepository.deleteByDocumentId(documentId);

        // Delete associated chat sessions and messages
        List<com.assignmenthelper.model.ChatSession> sessions = chatSessionRepository.findByDocumentId(documentId);
        for (com.assignmenthelper.model.ChatSession s : sessions) {
            chatMessageRepository.deleteBySessionId(s.getId());
        }
        chatSessionRepository.deleteByDocumentId(documentId);
        
        // Delete file from disk if it was uploaded by the user
        try {
            if (doc.getFilePath() != null && !doc.getFilePath().startsWith("classpath:")) {
                Files.deleteIfExists(Paths.get(doc.getFilePath()));
            }
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + doc.getFilePath());
        } catch (Exception e) {
            System.err.println("Error deleting file path " + doc.getFilePath() + ": " + e.getMessage());
        }
        
        // Delete document from DB
        documentRepository.delete(doc);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteAllDocumentsByUser(String username) {
        List<Document> docs = getUserDocuments(username);
        for (Document doc : docs) {
            deleteDocument(doc.getId(), username);
        }
    }
}

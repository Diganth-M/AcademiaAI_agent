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
        file.transferTo(filePath.toFile());

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
}

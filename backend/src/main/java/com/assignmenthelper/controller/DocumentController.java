package com.assignmenthelper.controller;

import com.assignmenthelper.model.Document;
import com.assignmenthelper.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import java.util.List;
import java.util.Map;
import java.util.Arrays;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Document document = documentService.saveDocument(file, userDetails.getUsername());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "documentId", document.getId(),
                "status", "READY",
                "message", "Document uploaded and analyzed successfully."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Could not upload file: " + e.getMessage());
        }
    }

    @GetMapping("/default-documents")
    public ResponseEntity<?> getDefaultDocuments() {
        List<Map<String, String>> docs = Arrays.asList(
            Map.of("id", "java-basics", "title", "Java Basics", "description", "Learn Java syntax, variables, data types, operators, loops, arrays, methods, classes, and exception handling.", "topic", "JAVA", "estimatedReadingTime", "25 minutes"),
            Map.of("id", "python-basics", "title", "Python Basics", "description", "Learn Python syntax, variables, collections, conditions, loops, functions, modules, and exception handling.", "topic", "PYTHON", "estimatedReadingTime", "20 minutes"),
            Map.of("id", "oops-concepts", "title", "OOP Concepts", "description", "Learn classes, objects, inheritance, polymorphism, abstraction, encapsulation, interfaces, and real-world examples.", "topic", "OOP", "estimatedReadingTime", "30 minutes"),
            Map.of("id", "sql-basics", "title", "SQL Basics", "description", "Learn databases, tables, SQL queries, CRUD operations, joins, constraints, aggregate functions, subqueries, and normalization.", "topic", "SQL", "estimatedReadingTime", "25 minutes")
        );
        return ResponseEntity.ok(docs);
    }

    @PostMapping("/default-documents/{id}/analyze")
    public ResponseEntity<?> analyzeDefaultDocument(@PathVariable String id) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Document document = documentService.saveDefaultDocument(id, userDetails.getUsername());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "documentId", document.getId(),
                "status", "READY",
                "message", "Default document analyzed successfully."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Could not analyze default document: " + e.getMessage());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getDocumentsHistory() {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            List<Document> documents = documentService.getUserDocuments(userDetails.getUsername());
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching history: " + e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getDocument(@PathVariable Long id) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Document document = documentService.getDocumentByIdAndUser(id, userDetails.getUsername());
            return ResponseEntity.ok(document);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(404).body("Document not found");
            } else if (e.getMessage().contains("Unauthorized")) {
                return ResponseEntity.status(403).body("Unauthorized to access this document");
            }
            return ResponseEntity.badRequest().body("Error fetching document: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching document: " + e.getMessage());
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            documentService.deleteDocument(id, userDetails.getUsername());
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Document deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting document: " + e.getMessage());
        }
    }

    @DeleteMapping("/history/clear")
    public ResponseEntity<?> clearAllHistory() {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            documentService.deleteAllDocumentsByUser(userDetails.getUsername());
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "All history cleared successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error clearing history: " + e.getMessage());
        }
    }
}

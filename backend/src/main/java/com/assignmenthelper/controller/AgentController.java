package com.assignmenthelper.controller;

import com.assignmenthelper.dto.AIRequest;
import com.assignmenthelper.model.Document;
import com.assignmenthelper.model.Generation;
import com.assignmenthelper.repository.GenerationRepository;
import com.assignmenthelper.service.AiService;
import com.assignmenthelper.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    @Autowired
    private AiService aiService;

    @Autowired
    private DocumentService documentService;
    
    @Autowired
    private GenerationRepository generationRepository;

    @PostMapping("/generate")
    public ResponseEntity<?> generateContent(@RequestBody AIRequest request) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            Document doc = documentService.getDocumentByIdAndUser(request.getDocumentId(), userDetails.getUsername());
            
            String extractedText = doc.getExtractedText();
            String output = "";
            
            switch (request.getType().toUpperCase()) {
                case "EXPLANATION":
                    output = aiService.explainChapter(extractedText);
                    break;
                case "ASSIGNMENT":
                    output = aiService.generateAssignmentAnswers(extractedText, request.getAdditionalPrompt());
                    break;
                case "MCQ":
                    output = aiService.generateMCQs(extractedText);
                    break;
                case "VIVA":
                    output = aiService.generateVivaQuestions(extractedText);
                    break;
                default:
                    return ResponseEntity.badRequest().body("Invalid generation type");
            }
            
            // Save generation history
            Generation gen = new Generation();
            gen.setDocument(doc);
            gen.setType(request.getType().toUpperCase());
            gen.setPrompt(request.getAdditionalPrompt());
            gen.setOutput(output);
            
            Generation savedGen = generationRepository.save(gen);
            return ResponseEntity.ok(savedGen);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Generation failed: " + e.getMessage());
        }
    }
    
    @GetMapping("/history/{documentId}")
    public ResponseEntity<?> getGenerationHistory(@PathVariable Long documentId) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            // Verify document belongs to user
            documentService.getDocumentByIdAndUser(documentId, userDetails.getUsername());
            
            List<Generation> history = generationRepository.findByDocumentIdOrderByCreatedAtDesc(documentId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to fetch history: " + e.getMessage());
        }
    }
}

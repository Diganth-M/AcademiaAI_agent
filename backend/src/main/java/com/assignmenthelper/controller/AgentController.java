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
            if (extractedText == null || extractedText.trim().length() < 10) {
                return ResponseEntity.status(422).body("This document appears to be empty or its text could not be extracted.");
            }
            String output = "";
            
            switch (request.getType().toUpperCase()) {
                case "EXPLANATION":
                    output = aiService.explainChapter(extractedText, request.getLanguage());
                    break;
                case "ASSIGNMENT":
                    output = aiService.generateAssignmentAnswers(extractedText, request.getAdditionalPrompt(), request.getLanguage());
                    break;
                case "MCQ":
                    output = aiService.generateMCQs(extractedText, request.getLanguage());
                    break;
                case "VIVA":
                    output = aiService.generateVivaQuestions(extractedText, request.getLanguage());
                    break;
                default:
                    return ResponseEntity.badRequest().body("Invalid generation type");
            }
            
            if (output != null && (output.startsWith("Error communicating with AI") || output.startsWith("AI Model Error") || output.startsWith("Failed to generate response"))) {
                // Graceful fallback to mock data if the API fails (e.g. 503 high demand)
                if (request.getType().equalsIgnoreCase("MCQ")) {
                    long randomId = System.currentTimeMillis() % 1000;
                    output = "[\n" +
                             "  {\n" +
                             "    \"question\": \"What is the primary purpose of this topic? (Mock Quiz #" + randomId + ")\",\n" +
                             "    \"options\": [\"To simplify development\", \"To increase complexity\", \"To reduce performance\", \"None of the above\"],\n" +
                             "    \"correctAnswer\": \"To simplify development\",\n" +
                             "    \"explanation\": \"This is a mock fallback question because the AI API is currently rate limited.\"\n" +
                             "  },\n" +
                             "  {\n" +
                             "    \"question\": \"Which of the following is true? (Mock Quiz #" + randomId + ")\",\n" +
                             "    \"options\": [\"It is helpful\", \"It is harmful\", \"It has no effect\", \"It is unknown\"],\n" +
                             "    \"correctAnswer\": \"It is helpful\",\n" +
                             "    \"explanation\": \"Fallback generic question.\"\n" +
                             "  }\n" +
                             "]";
                } else if (request.getType().equalsIgnoreCase("VIVA")) {
                    long randomId = System.currentTimeMillis() % 1000;
                    output = "1. **What are the key concepts of this document? (Mock #" + randomId + ")**\n" +
                             "   - Mock fallback answer due to high API demand.\n" +
                             "   - Ensure you understand the fundamentals.\n\n" +
                             "2. **Can you explain the main mechanism?**\n" +
                             "   - This is a mock response.\n" +
                             "   - Refer to the document for details.\n";
                } else {
                    output = "### 🎓 Mock AI Response (Fallback due to High API Demand)\n\n" +
                             "- **Note**: The AI provider (Google Gemini) is currently experiencing high demand and returned a 503/429 error.\n" +
                             "- This mock response was generated to prevent the process from failing.\n" +
                             "- **Abstraction** is a key OOP concept that hides complex implementation details.\n" +
                             "- It helps in reducing programming complexity and effort.\n" +
                             "- **Example**: When you drive a car, you don't need to know how the internal engine mechanics work, you only interact with the steering wheel and pedals.";
                }
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
    
    @PostMapping("/translate")
    public ResponseEntity<?> translateContent(@RequestBody com.assignmenthelper.dto.TranslateRequest request) {
        try {
            if (request.getText() == null || request.getText().isEmpty()) {
                return ResponseEntity.badRequest().body("No text provided for translation");
            }
            String translated = aiService.translateText(request.getText(), request.getTargetLanguage());
            return ResponseEntity.ok(java.util.Collections.singletonMap("translatedText", translated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Translation failed: " + e.getMessage());
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

    @Autowired
    private com.assignmenthelper.service.EmailService emailService;

    @Autowired
    private com.assignmenthelper.repository.UserRepository userRepository;

    @PostMapping("/email-content")
    public ResponseEntity<?> emailContent(@RequestBody com.assignmenthelper.dto.EmailContentRequest request) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            com.assignmenthelper.model.User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
            
            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }
            
            if (user.getEmail() == null || user.getEmail().isEmpty()) {
                return ResponseEntity.badRequest().body("User does not have a registered email address.");
            }

            emailService.sendStudyMaterialEmail(
                user.getEmail(), 
                user.getUsername(), 
                request.getContentType(), 
                request.getTopic(), 
                request.getContent()
            );

            return ResponseEntity.ok("Email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send email: " + e.getMessage());
        }
    }
}

package com.assignmenthelper.controller;

import com.assignmenthelper.dto.ChatRequest;
import com.assignmenthelper.model.ChatMessage;
import com.assignmenthelper.model.ChatSession;
import com.assignmenthelper.model.Document;
import com.assignmenthelper.model.User;
import com.assignmenthelper.repository.ChatMessageRepository;
import com.assignmenthelper.repository.ChatSessionRepository;
import com.assignmenthelper.repository.DocumentRepository;
import com.assignmenthelper.repository.UserRepository;
import com.assignmenthelper.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private AiService aiService;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    private User getAuthenticatedUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByUsername(userDetails.getUsername()).orElse(null);
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations() {
        User user = getAuthenticatedUser();
        if (user == null) return ResponseEntity.badRequest().body("User not found");
        
        List<ChatSession> sessions = chatSessionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<Map<String, Object>> response = new ArrayList<>();
        for (ChatSession s : sessions) {
            Map<String, Object> map = new HashMap<>();
            map.put("conversationId", s.getConversationId());
            map.put("title", s.getTitle());
            map.put("createdAt", s.getCreatedAt());
            map.put("documentId", s.getDocument() != null ? s.getDocument().getId() : null);
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/conversations")
    public ResponseEntity<?> createConversation(@RequestBody Map<String, String> body) {
        User user = getAuthenticatedUser();
        if (user == null) return ResponseEntity.badRequest().body("User not found");

        ChatSession session = new ChatSession();
        session.setUser(user);
        
        if (body.containsKey("documentId") && body.get("documentId") != null) {
            Document doc = documentRepository.findById(Long.parseLong(body.get("documentId"))).orElse(null);
            if (doc != null && doc.getUser().getId().equals(user.getId())) {
                session.setDocument(doc);
            }
        }
        
        if (body.containsKey("title")) {
            session.setTitle(body.get("title"));
        }
        
        chatSessionRepository.save(session);
        
        Map<String, Object> response = new HashMap<>();
        response.put("conversationId", session.getConversationId());
        response.put("title", session.getTitle());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversations/{conversationId}")
    public ResponseEntity<?> getConversationHistory(@PathVariable String conversationId) {
        User user = getAuthenticatedUser();
        if (user == null) return ResponseEntity.badRequest().body("User not found");

        Optional<ChatSession> sessionOpt = chatSessionRepository.findByConversationIdAndUserId(conversationId, user.getId());
        if (sessionOpt.isPresent()) {
            List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionOpt.get().getId());
            return ResponseEntity.ok(messages);
        }
        return ResponseEntity.ok(new ArrayList<>());
    }

    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<?> deleteConversation(@PathVariable String conversationId) {
        User user = getAuthenticatedUser();
        if (user == null) return ResponseEntity.badRequest().body("User not found");

        chatSessionRepository.deleteByConversationIdAndUserId(conversationId, user.getId());
        return ResponseEntity.ok(Map.of("message", "Conversation deleted"));
    }

    @GetMapping("/history/{documentId}")
    public ResponseEntity<?> getHistory(@PathVariable Long documentId) {
        User user = getAuthenticatedUser();
        if (user == null) return ResponseEntity.badRequest().body("User not found");

        Optional<ChatSession> sessionOpt = chatSessionRepository.findByDocumentIdAndUserId(documentId, user.getId());
        if (sessionOpt.isPresent()) {
            List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionOpt.get().getId());
            return ResponseEntity.ok(messages);
        }
        return ResponseEntity.ok(new ArrayList<>());
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamChat(@RequestBody ChatRequest request) {
        User user = getAuthenticatedUser();
        if (user == null) return Flux.just("Error: User not found");

        ChatSession session;
        if (request.getConversationId() != null) {
            session = chatSessionRepository.findByConversationIdAndUserId(request.getConversationId(), user.getId())
                    .orElseGet(() -> {
                        ChatSession newSession = new ChatSession();
                        newSession.setUser(user);
                        newSession.setConversationId(request.getConversationId());
                        if (request.getDocumentId() != null) {
                            Document doc = documentRepository.findById(request.getDocumentId()).orElse(null);
                            if (doc != null && doc.getUser().getId().equals(user.getId())) newSession.setDocument(doc);
                        }
                        return chatSessionRepository.save(newSession);
                    });
        } else if (request.getDocumentId() != null) {
            Document document = documentRepository.findById(request.getDocumentId()).orElse(null);
            if (document == null || !document.getUser().getId().equals(user.getId())) {
                return Flux.just("Error: Document not found or access denied");
            }
            session = chatSessionRepository.findByDocumentIdAndUserId(document.getId(), user.getId())
                    .orElseGet(() -> {
                        ChatSession newSession = new ChatSession();
                        newSession.setDocument(document);
                        newSession.setUser(user);
                        return chatSessionRepository.save(newSession);
                    });
        } else {
            return Flux.just("Error: No conversationId or documentId provided");
        }

        // Save User Message
        ChatMessage userMsg = new ChatMessage();
        userMsg.setSession(session);
        userMsg.setRole("USER");
        userMsg.setContent(request.getMessage());
        chatMessageRepository.save(userMsg);

        // Fetch History
        List<ChatMessage> historyMessages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
        List<Map<String, String>> history = new ArrayList<>();
        for (ChatMessage m : historyMessages) {
            if (m.getId().equals(userMsg.getId())) continue;
            Map<String, String> map = new HashMap<>();
            map.put("role", m.getRole());
            map.put("content", m.getContent());
            history.add(map);
        }

        // Generate context
        StringBuilder contextBuilder = new StringBuilder();
        if (session.getDocument() != null) {
            contextBuilder.append("Extracted Text: ").append(session.getDocument().getExtractedText()).append("\n\n");
        }
        if (request.getGeneratedContext() != null) {
            contextBuilder.append("Generated Content: ").append(request.getGeneratedContext()).append("\n\n");
        }
        if (request.getPageContext() != null) {
            contextBuilder.append("Page Context: ").append(request.getPageContext()).append("\n\n");
        }
        if (request.getGenerationType() != null) {
            contextBuilder.append("Generation Type: ").append(request.getGenerationType()).append("\n\n");
        }

        StringBuilder aiResponseBuilder = new StringBuilder();

        return aiService.generateChatStream(history, contextBuilder.toString(), request.getMessage(), request.getLanguage(), request.getBase64Image())
                .doOnNext(aiResponseBuilder::append)
                .doOnComplete(() -> {
                    // Update Title if it's "New Conversation" and this is the first message pair
                    if ("New Conversation".equals(session.getTitle()) && history.isEmpty()) {
                        String title = request.getMessage().length() > 30 ? request.getMessage().substring(0, 30) + "..." : request.getMessage();
                        session.setTitle(title);
                        chatSessionRepository.save(session);
                    }
                    ChatMessage aiMsg = new ChatMessage();
                    aiMsg.setSession(session);
                    aiMsg.setRole("AI");
                    aiMsg.setContent(aiResponseBuilder.toString());
                    chatMessageRepository.save(aiMsg);
                })
                .map(chunk -> chunk.replace("\n", "\\n"));
    }
}

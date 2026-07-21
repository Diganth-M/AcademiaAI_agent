package com.assignmenthelper.controller;

import com.assignmenthelper.dto.ChatRequest;
import com.assignmenthelper.dto.ChatResponse;
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

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        ChatResponse response = new ChatResponse();
        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                response.setSuccess(false);
                response.setCode("UNAUTHORIZED");
                response.setMessage("Your session has expired. Please log in again.");
                return ResponseEntity.status(401).body(response);
            }

            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                response.setSuccess(false);
                response.setCode("INVALID_REQUEST");
                response.setMessage("Please enter a valid question.");
                return ResponseEntity.status(422).body(response);
            }

            ChatSession session;
            if (request.getConversationId() != null && !request.getConversationId().trim().isEmpty()) {
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
                    response.setSuccess(false);
                    response.setCode("FORBIDDEN");
                    response.setMessage("You do not have permission to use this assistant.");
                    return ResponseEntity.status(403).body(response);
                }
                session = chatSessionRepository.findByDocumentIdAndUserId(document.getId(), user.getId())
                        .orElseGet(() -> {
                            ChatSession newSession = new ChatSession();
                            newSession.setDocument(document);
                            newSession.setUser(user);
                            newSession.setConversationId(UUID.randomUUID().toString());
                            return chatSessionRepository.save(newSession);
                        });
            } else {
                ChatSession newSession = new ChatSession();
                newSession.setUser(user);
                newSession.setConversationId(UUID.randomUUID().toString());
                session = chatSessionRepository.save(newSession);
            }

            ChatMessage userMsg = new ChatMessage();
            userMsg.setSession(session);
            userMsg.setRole("USER");
            userMsg.setContent(request.getMessage());
            chatMessageRepository.save(userMsg);

            List<ChatMessage> historyMessages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
            List<Map<String, String>> history = new ArrayList<>();
            for (ChatMessage m : historyMessages) {
                if (m.getId().equals(userMsg.getId())) continue;
                Map<String, String> map = new HashMap<>();
                map.put("role", m.getRole());
                map.put("content", m.getContent());
                history.add(map);
            }

            String documentText = session.getDocument() != null ? session.getDocument().getExtractedText() : null;

            String pageContext = request.getPageContext();
    

            String answer = aiService.generateStructuredChatResponse(
                history,
                documentText,
                request.getMessage(),
                request.getLanguage(),
                pageContext,
                request.getResponseStyle()
            );

            if (("New Conversation".equals(session.getTitle()) || session.getTitle() == null) && history.isEmpty()) {
                String title = request.getMessage().length() > 30 ? request.getMessage().substring(0, 30) + "..." : request.getMessage();
                session.setTitle(title);
                chatSessionRepository.save(session);
            }

            ChatMessage aiMsg = new ChatMessage();
            aiMsg.setSession(session);
            aiMsg.setRole("AI");
            aiMsg.setContent(answer);
            chatMessageRepository.save(aiMsg);

            response.setSuccess(true);
            response.setConversationId(session.getConversationId());
            response.setAnswer(answer);
            response.setLanguage(request.getLanguage());
            response.setSourceType(session.getDocument() != null ? "DOCUMENT" : "GENERAL");
            response.setDocumentId(session.getDocument() != null ? session.getDocument().getId() : null);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            response.setSuccess(false);
            response.setTimestamp(java.time.LocalDateTime.now().toString());
            if (e.getMessage() != null && e.getMessage().contains("AI_PROVIDER_UNAVAILABLE")) {
                response.setCode("AI_PROVIDER_UNAVAILABLE");
                response.setMessage("The AI service is temporarily unavailable.");
                return ResponseEntity.status(500).body(response);
            }
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            response.setCode("INTERNAL_SERVER_ERROR");
            response.setMessage("The assistant service encountered an error. Details: " + sw.toString());
            return ResponseEntity.status(500).body(response);
        }
    }
}

package com.assignmenthelper.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import com.assignmenthelper.model.ChatMessage;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final WebClient webClient = WebClient.builder().build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateResponse(String systemPrompt, String userMessage, String language) {
        if ("your_api_key_here".equals(geminiApiKey) || geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            return "### 🎓 Mock AI Response\n\n" +
                   "Please configure your **GEMINI_API_KEY** in `application.properties` to get real AI-generated content.\n\n" +
                   "**Example of a generated response:**\n" +
                   "- **Abstraction** is a key OOP concept that hides complex implementation details and only shows the essential features of the object.\n" +
                   "- It helps in reducing programming complexity and effort.\n" +
                   "- **Example**: When you drive a car, you don't need to know how the internal engine mechanics work, you only interact with the steering wheel and pedals.";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String targetLanguage = (language != null && !language.trim().isEmpty()) ? language : "English";
        String finalSystemPrompt = systemPrompt + "\n\nCRITICAL: You MUST respond entirely in " + targetLanguage + ".";
        
        String combinedText = finalSystemPrompt + "\n\n" + (userMessage != null ? userMessage : "");

        Map<String, Object> part = new HashMap<>();
        part.put("text", combinedText);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        requestBody.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        String url = geminiApiUrl + "?key=" + geminiApiKey;

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> contentObj = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentObj.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            e.printStackTrace();
            try {
                JsonNode errorNode = objectMapper.readTree(e.getResponseBodyAsString());
                if (errorNode.has("error") && errorNode.get("error").has("message")) {
                    return "AI Model Error: " + errorNode.get("error").get("message").asText();
                }
            } catch (Exception parseException) {
                // Ignore parsing errors
            }
            return "Error communicating with AI: " + e.getStatusCode() + " " + e.getStatusText();
        } catch (Exception e) {
            e.printStackTrace();
            return "Error communicating with AI: " + e.getMessage();
        }
        return "Failed to generate response.";
    }

    public String explainChapter(String text, String language) {
        String systemPrompt = "You are an educational assistant. Use only the supplied document content as the primary source. Do not introduce unrelated topics. If the document does not contain enough information, clearly state that the requested topic is not sufficiently covered. Format your explanation entirely as a list of bullet points. Do not write long paragraphs.";
        return generateResponse(systemPrompt, text, language);
    }

    public String generateAssignmentAnswers(String text, String questions, String language) {
        String systemPrompt = "You are an educational assistant. Use only the supplied document content as the primary source. Do not introduce unrelated topics. If the document does not contain enough information, clearly state that the requested topic is not sufficiently covered. Your answer must be extremely detailed, comprehensive, and roughly 4 pages in length. You MUST structure your response using a combination of well-structured paragraphs for detailed explanations, and clear bullet points or numbered lists for key concepts.";
        String userMessage = "Document content:\n" + text + "\n\nUser request:\n" + questions;
        return generateResponse(systemPrompt, userMessage, language);
    }

    public String generateMCQs(String text, String language) {
        String systemPrompt = "You are an educational assistant. Use only the supplied document content as the primary source to create up to 10 multiple choice questions (or as many as possible). Do not introduce unrelated topics. You MUST respond ONLY with a valid JSON array where each object has: 'question' (string), 'options' (array of exactly 4 strings), 'correctAnswer' (string, exactly matching one option), and 'explanation' (string). Never return plain text. If you cannot generate questions, return a single generic question in the exact JSON array format. Do not wrap in markdown blocks, just return the raw JSON array.";
        return generateResponse(systemPrompt, text, language);
    }

    public String generateVivaQuestions(String text, String language) {
        String systemPrompt = "You are an educational assistant. Use only the supplied document content as the primary source to generate up to 10 challenging viva questions and sample answers. Do not introduce unrelated topics. If the document does not contain much information, generate as many as you can. Format your output as a numbered list of questions, where each question is followed by its sample answer formatted as bullet points.";
        return generateResponse(systemPrompt, text, language);
    }

    public String translateText(String text, String targetLanguage) {
        String systemPrompt = "You are a professional translator. Strictly translate the following text into " + targetLanguage + ". Do not add any extra commentary or alter the original meaning. Maintain the exact same formatting, paragraphs, and markdown structures.";
        return generateResponse(systemPrompt, text, targetLanguage);
    }



    
    public Flux<String> generateChatStream(List<Map<String, String>> history, String context, String userPrompt, String language, String base64Image) {
        if ("your_api_key_here".equals(geminiApiKey) || geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            return Flux.just("This is a mock AI response for chat. Configure GEMINI_API_KEY.");
        }

        String url = geminiApiUrl.replace("generateContent", "streamGenerateContent") + "?alt=sse&key=" + geminiApiKey;
        
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new java.util.ArrayList<>();
        
        // System Prompt / Context Injection
        Map<String, Object> systemPart = new HashMap<>();
        String targetLanguage = (language != null && !language.trim().isEmpty()) ? language : "English";
        String promptInstructions = "You are a Personal AI Professor. Your role is to act as an expert tutor, deeply understanding the provided context to help the user learn. Context: " + context + "\n\n" +
            "CAPABILITIES & INSTRUCTIONS:\n" +
            "- You can explain any topic, provide beginner or advanced explanations, give real-life examples, generate interview/exam/viva questions, create text-based diagrams, explain line-by-line, generate mnemonics, ask follow-up questions to test understanding, suggest related topics, detect weak concepts, and recommend revision orders.\n" +
            "- CRITICAL RULE: You MUST answer ONLY from the uploaded content (Context) whenever possible. If you must use outside general knowledge to answer, you MUST explicitly mention: 'Note: I am using general knowledge outside of the provided document to answer this.'\n" +
            "CRITICAL FORMATTING INSTRUCTIONS:\n" +
            "DO NOT write long dense paragraphs. You MUST format your answer using bullet points, clear concise lists, and Markdown headers.\n" +
            "Adapt your format to the user's request (e.g., if they ask for a mnemonic, provide it clearly; if they ask for an advanced explanation, structure it logically).\n" +
            "CRITICAL: You MUST respond entirely in " + targetLanguage + ".";
        
        systemPart.put("text", promptInstructions);
        Map<String, Object> systemContent = new HashMap<>();
        systemContent.put("role", "user");
        systemContent.put("parts", List.of(systemPart));
        contents.add(systemContent);
        
        // Add fake 'model' acknowledgement of context
        Map<String, Object> ackPart = new HashMap<>();
        ackPart.put("text", "Understood. I will act as a personal AI professor and answer based strictly on this context, clearly stating if I need to use outside knowledge.");
        Map<String, Object> ackContent = new HashMap<>();
        ackContent.put("role", "model");
        ackContent.put("parts", List.of(ackPart));
        contents.add(ackContent);

        // Add history ensuring strict alternating roles (user -> model -> user -> model)
        String expectedRole = "user";
        List<Map<String, Object>> validHistory = new java.util.ArrayList<>();
        
        for (Map<String, String> msg : history) {
            String msgRole = msg.get("role").equalsIgnoreCase("USER") ? "user" : "model";
            if (msgRole.equals(expectedRole)) {
                Map<String, Object> part = new HashMap<>();
                part.put("text", msg.get("content"));
                Map<String, Object> content = new HashMap<>();
                content.put("role", msgRole);
                content.put("parts", List.of(part));
                validHistory.add(content);
                expectedRole = expectedRole.equals("user") ? "model" : "user";
            }
        }
        
        // If history ends with 'user', it means the last AI response failed.
        // We must remove the last 'user' message so the sequence ends with 'model' before our current 'user' prompt.
        if (expectedRole.equals("model") && !validHistory.isEmpty()) {
            validHistory.remove(validHistory.size() - 1);
        }
        
        contents.addAll(validHistory);

        // Add current user prompt
        Map<String, Object> currentPart = new HashMap<>();
        currentPart.put("text", userPrompt);
        List<Map<String, Object>> currentPartsList = new java.util.ArrayList<>();
        currentPartsList.add(currentPart);

        if (base64Image != null && !base64Image.trim().isEmpty()) {
            try {
                String mimeType = "image/jpeg";
                String base64Data = base64Image;
                if (base64Image.contains(",")) {
                    String[] parts = base64Image.split(",");
                    mimeType = parts[0].substring(parts[0].indexOf(":") + 1, parts[0].indexOf(";"));
                    base64Data = parts[1];
                }
                Map<String, Object> inlineData = new HashMap<>();
                inlineData.put("mimeType", mimeType);
                inlineData.put("data", base64Data);
                
                Map<String, Object> imagePart = new HashMap<>();
                imagePart.put("inlineData", inlineData);
                currentPartsList.add(imagePart);
            } catch (Exception e) {
                System.out.println("Error parsing image base64: " + e.getMessage());
            }
        }

        Map<String, Object> currentContent = new HashMap<>();
        currentContent.put("role", "user");
        currentContent.put("parts", currentPartsList);
        contents.add(currentContent);

        requestBody.put("contents", contents);

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        requestBody.put("generationConfig", generationConfig);

        return webClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToFlux(String.class)
                .map(chunk -> {
                    try {
                        String cleanChunk = chunk.trim();
                        if (cleanChunk.startsWith("data: ")) {
                            cleanChunk = cleanChunk.substring(6).trim();
                        }
                        if (cleanChunk.isEmpty() || cleanChunk.equals("[DONE]")) {
                            return "";
                        }
                        JsonNode root = objectMapper.readTree(cleanChunk);
                        if (root.isArray() && root.size() > 0) {
                            root = root.get(0);
                        }
                        if (root.has("candidates") && root.get("candidates").isArray() && root.get("candidates").size() > 0) {
                            JsonNode contentNode = root.get("candidates").get(0).get("content");
                            if (contentNode != null && contentNode.has("parts") && contentNode.get("parts").isArray() && contentNode.get("parts").size() > 0) {
                                return contentNode.get("parts").get(0).get("text").asText();
                            }
                        }
                        return "";
                    } catch (Exception e) {
                        return "";
                    }
                })
                .filter(text -> !text.isEmpty())
                .onErrorResume(e -> {
                    if (e instanceof org.springframework.web.reactive.function.client.WebClientResponseException) {
                        org.springframework.web.reactive.function.client.WebClientResponseException ex = (org.springframework.web.reactive.function.client.WebClientResponseException) e;
                        try {
                            JsonNode errorNode = objectMapper.readTree(ex.getResponseBodyAsString());
                            if (errorNode.has("error") && errorNode.get("error").has("message")) {
                                return Flux.just("AI Model Error: " + errorNode.get("error").get("message").asText());
                            }
                        } catch (Exception parseException) {
                            // Ignore parsing errors
                        }
                        return Flux.just("Error from AI: " + ex.getStatusCode() + " " + ex.getStatusText());
                    }
                    return Flux.just("Error from AI: " + e.getMessage());
                });
    }

    public String generateStructuredChatResponse(List<Map<String, String>> history, String context, String userPrompt, String language, String pageContext, String responseStyle) {
        if ("your_api_key_here".equals(geminiApiKey) || geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            return "This is a mock AI response for chat. Please configure your GEMINI_API_KEY.";
        }

        String targetLanguage = (language != null && !language.trim().isEmpty()) ? language : "English";
        
        StringBuilder promptInstructions = new StringBuilder();
        promptInstructions.append("You are AcademiaAI agent, a professional educational assistant.\n\n");
        promptInstructions.append("Your responsibilities:\n");
        promptInstructions.append("- Explain academic concepts clearly.\n");
        promptInstructions.append("- Answer questions based on the active document when one is available.\n");
        promptInstructions.append("- Generate structured and student-friendly answers.\n");
        promptInstructions.append("- Use the language selected by the user.\n");
        promptInstructions.append("- Give step-by-step explanations when needed.\n");
        promptInstructions.append("- Include code examples when relevant.\n");
        promptInstructions.append("- Avoid unrelated information.\n");
        promptInstructions.append("- Never return an empty answer.\n");
        promptInstructions.append("- If a document does not contain enough information, say so clearly and then provide a general explanation when allowed.\n\n");
        
        promptInstructions.append("CRITICAL: You MUST answer entirely in ").append(targetLanguage).append(".\n\n");
        
        if (pageContext != null && !pageContext.isEmpty()) {
            promptInstructions.append("Current page: ").append(pageContext).append("\n\n");
        }
        
        if (responseStyle != null && !responseStyle.isEmpty()) {
            promptInstructions.append("Response style requested: ").append(responseStyle).append("\n\n");
        }
        
        if (context != null && !context.trim().isEmpty()) {
            promptInstructions.append("Active document content:\n").append(context).append("\n\n");
        } else {
            promptInstructions.append("No active document provided. Use general educational knowledge.\n\n");
        }
        
        String url = geminiApiUrl + "?key=" + geminiApiKey;
        
        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();
        
        // Add System Prompt as User Role and then a fake Model acknowledgement
        Map<String, Object> systemPart = new HashMap<>();
        systemPart.put("text", promptInstructions.toString());
        Map<String, Object> systemContent = new HashMap<>();
        systemContent.put("role", "user");
        systemContent.put("parts", List.of(systemPart));
        contents.add(systemContent);
        
        Map<String, Object> ackPart = new HashMap<>();
        ackPart.put("text", "Understood. I will act as AcademiaAI agent and follow all instructions strictly.");
        Map<String, Object> ackContent = new HashMap<>();
        ackContent.put("role", "model");
        ackContent.put("parts", List.of(ackPart));
        contents.add(ackContent);
        
        // Process History
        String expectedRole = "user";
        List<Map<String, Object>> validHistory = new ArrayList<>();
        for (Map<String, String> msg : history) {
            String msgRole = msg.get("role").equalsIgnoreCase("USER") ? "user" : "model";
            if (msgRole.equals(expectedRole)) {
                Map<String, Object> part = new HashMap<>();
                part.put("text", msg.get("content"));
                Map<String, Object> content = new HashMap<>();
                content.put("role", msgRole);
                content.put("parts", List.of(part));
                validHistory.add(content);
                expectedRole = expectedRole.equals("user") ? "model" : "user";
            }
        }
        if (expectedRole.equals("model") && !validHistory.isEmpty()) {
            validHistory.remove(validHistory.size() - 1);
        }
        contents.addAll(validHistory);
        
        // Add current user prompt
        Map<String, Object> currentPart = new HashMap<>();
        currentPart.put("text", userPrompt);
        Map<String, Object> currentContent = new HashMap<>();
        currentContent.put("role", "user");
        currentContent.put("parts", List.of(currentPart));
        contents.add(currentContent);
        
        requestBody.put("contents", contents);
        
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        requestBody.put("generationConfig", generationConfig);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> contentObj = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentObj.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            throw new RuntimeException("AI Model returned empty response");
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            e.printStackTrace();
            try {
                JsonNode errorNode = objectMapper.readTree(e.getResponseBodyAsString());
                if (errorNode.has("error") && errorNode.get("error").has("message")) {
                    throw new RuntimeException("AI_PROVIDER_UNAVAILABLE: " + errorNode.get("error").get("message").asText());
                }
            } catch (Exception parseException) {
                // Ignore parsing errors
            }
            throw new RuntimeException("AI_PROVIDER_UNAVAILABLE: " + e.getStatusCode() + " " + e.getStatusText());
        } catch (Exception e) {
            e.printStackTrace();
            if (e.getMessage() != null && e.getMessage().contains("AI_PROVIDER_UNAVAILABLE")) {
                throw e; // rethrow formatted
            }
            throw new RuntimeException("AI_PROVIDER_UNAVAILABLE: Unable to get response from AI service.");
        }
    }
}

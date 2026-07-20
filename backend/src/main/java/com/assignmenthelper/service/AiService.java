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
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
            return "This is a mock AI response. Please configure your GEMINI_API_KEY in application.properties or environment variables to get real AI-generated content.";
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
        String systemPrompt = "You are an educational assistant. Use only the supplied document content as the primary source. Do not introduce unrelated topics. If the document does not contain enough information, clearly state that the requested topic is not sufficiently covered. Format your answers using clear bullet points or numbered lists. Do not use dense paragraphs.";
        String userMessage = "Document content:\n" + text + "\n\nUser request:\n" + questions;
        return generateResponse(systemPrompt, userMessage, language);
    }

    public String generateMCQs(String text, String language) {
        String systemPrompt = "You are an educational assistant. Use only the supplied document content as the primary source to create 10 multiple choice questions. Do not introduce unrelated topics. If the document does not contain enough information, clearly state that. You MUST respond ONLY with a valid JSON array where each object has: 'question' (string), 'options' (array of exactly 4 strings), 'correctAnswer' (string, exactly matching one option), and 'explanation' (string). Do not wrap in markdown blocks, just return the raw JSON.";
        return generateResponse(systemPrompt, text, language);
    }

    public String generateVivaQuestions(String text, String language) {
        String systemPrompt = "You are an educational assistant. Use only the supplied document content as the primary source to generate 10 challenging viva questions and sample answers. Do not introduce unrelated topics. Format your output as a numbered list of questions, where each question is followed by its sample answer formatted as bullet points.";
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
}

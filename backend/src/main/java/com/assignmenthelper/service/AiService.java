package com.assignmenthelper.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @Value("${openai.api.url}")
    private String openaiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateResponse(String systemPrompt, String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openaiApiKey);

        Map<String, Object> message1 = new HashMap<>();
        message1.put("role", "system");
        message1.put("content", systemPrompt);
        
        Map<String, Object> message2 = new HashMap<>();
        message2.put("role", "user");
        message2.put("content", userMessage);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo"); // or gpt-4
        requestBody.put("messages", List.of(message1, message2));
        requestBody.put("temperature", 0.7);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(openaiApiUrl, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error communicating with AI: " + e.getMessage();
        }
        return "Failed to generate response.";
    }

    public String explainChapter(String text) {
        String systemPrompt = "You are an expert tutor. Summarize and explain the following chapter notes clearly and concisely.";
        return generateResponse(systemPrompt, text);
    }

    public String generateAssignmentAnswers(String text, String questions) {
        String systemPrompt = "You are a helpful assistant. Use the provided notes to answer the assignment questions thoroughly.";
        String userMessage = "Notes: " + text + "\n\nQuestions: " + questions;
        return generateResponse(systemPrompt, userMessage);
    }

    public String generateMCQs(String text) {
        String systemPrompt = "You are a quiz master. Create 10 multiple choice questions based on the provided text. Include the correct answer for each.";
        return generateResponse(systemPrompt, text);
    }

    public String generateVivaQuestions(String text) {
        String systemPrompt = "You are a university professor preparing a student for a viva. Generate 10 challenging viva questions based on the provided notes and provide sample answers.";
        return generateResponse(systemPrompt, text);
    }
}

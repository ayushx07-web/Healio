package com.ambula.ai;

import com.ambula.ai.dto.FormattedPrescription;
import com.ambula.ai.dto.SpecialistSuggestion;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.model}")
    private String groqModel;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GroqService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public SpecialistSuggestion suggestSpecialist(String symptoms) {
        String systemPrompt = "You are a medical triage assistant for an Indian healthcare platform. " +
                "The user will describe their symptoms. " +
                "Reply ONLY in this exact JSON format with no extra text:\n" +
                "{\n" +
                "  \"specialization\": \"one of: Cardiologist, Dermatologist, General Physician, Orthopedist, Neurologist, Pediatrician, Gynecologist, ENT Specialist, Ophthalmologist, Psychiatrist\",\n" +
                "  \"reason\": \"one sentence explaining why in simple language\"\n" +
                "}\n" +
                "Base your answer only on the symptoms described.";

        String responseContent = callGroq(systemPrompt, symptoms);
        try {
            return objectMapper.readValue(responseContent, SpecialistSuggestion.class);
        } catch (Exception e) {
            throw new GroqApiException("Failed to parse Groq response for specialist suggestion: " + responseContent, e);
        }
    }

    public FormattedPrescription formatPrescription(String rawNotes) {
        String systemPrompt = "You are a medical assistant helping Indian doctors format consultation notes " +
                "into structured prescriptions. " +
                "The doctor will give you raw notes. " +
                "Reply ONLY in this exact JSON format with no extra text:\n" +
                "{\n" +
                "  \"diagnosis\": \"primary diagnosis in medical terms\",\n" +
                "  \"medications\": [\n" +
                "    {\n" +
                "      \"name\": \"medication name\",\n" +
                "      \"dosage\": \"dosage amount\",\n" +
                "      \"frequency\": \"how many times per day\",\n" +
                "      \"duration\": \"for how many days\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"advice\": \"lifestyle or general advice\",\n" +
                "  \"followUp\": \"when to follow up\",\n" +
                "  \"patientFriendlySummary\": \"explain the diagnosis and treatment in simple English that a non-medical person can understand\"\n" +
                "}";

        String responseContent = callGroq(systemPrompt, rawNotes);
        try {
            // Replace any single quotes in the output with double quotes in case Llama outputs non-standard JSON
            String sanitizedContent = responseContent.trim();
            if (sanitizedContent.startsWith("{")) {
                sanitizedContent = sanitizedContent.replace("'", "\"");
            }
            return objectMapper.readValue(sanitizedContent, FormattedPrescription.class);
        } catch (Exception e) {
            throw new GroqApiException("Failed to parse Groq response for prescription formatting: " + responseContent, e);
        }
    }

    private String callGroq(String systemPrompt, String userPrompt) {
        try {
            Map<String, Object> messageSystem = Map.of("role", "system", "content", systemPrompt);
            Map<String, Object> messageUser = Map.of("role", "user", "content", userPrompt);
            Map<String, Object> responseFormat = Map.of("type", "json_object");

            Map<String, Object> payload = Map.of(
                    "model", groqModel,
                    "messages", List.of(messageSystem, messageUser),
                    "response_format", responseFormat
            );

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(groqApiUrl))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + groqApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new GroqApiException("Groq API returned error status: " + response.statusCode() + " - " + response.body());
            }

            JsonNode responseJson = objectMapper.readTree(response.body());
            JsonNode choices = responseJson.get("choices");
            if (choices == null || !choices.isArray() || choices.isEmpty()) {
                throw new GroqApiException("Invalid Groq API response schema: no choices field");
            }

            JsonNode contentNode = choices.get(0).get("message").get("content");
            if (contentNode == null) {
                throw new GroqApiException("Invalid Groq API response schema: no content field");
            }

            return contentNode.asText();
        } catch (Exception e) {
            throw new GroqApiException("Error communicating with Groq API", e);
        }
    }
}

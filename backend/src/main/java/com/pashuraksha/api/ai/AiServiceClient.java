package com.pashuraksha.api.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class AiServiceClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;

    public Map<String, Object> chatAdvisory(Map<String, String> request) {
        String url = aiServiceUrl + "/api/v1/chat/advisory";
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);
            return response;
        } catch (Exception e) {
            return Map.of(
                "error", "AI service unavailable",
                "response", "AI advisory service is temporarily unavailable. Please contact your local veterinarian directly.",
                "probable_disease", "",
                "confidence", 0.0,
                "risk_level", "UNKNOWN",
                "should_report", true
            );
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> fusionDiagnosis(Map<String, Object> request) {
        String url = aiServiceUrl + "/api/v1/diagnose/fusion";
        try {
            return restTemplate.postForObject(url, request, Map.class);
        } catch (Exception e) {
            return Map.of("error", "AI fusion service unavailable");
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> completeDiagnosis(Map<String, Object> request) {
        String url = aiServiceUrl + "/api/v1/diagnose/complete";
        try {
            return restTemplate.postForObject(url, request, Map.class);
        } catch (Exception e) {
            return Map.of("error", "AI diagnosis service unavailable", "message", e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> detectImage(MultipartFile file, String language) {
        String url = aiServiceUrl + "/api/v1/detect/image?language="
                + java.net.URLEncoder.encode(language == null ? "en-IN" : language,
                        java.nio.charset.StandardCharsets.UTF_8);
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", resource);

            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            return Map.of(
                "error", "AI image detection unavailable",
                "prediction", "Unable to analyze",
                "confidence", 0.0,
                "recommendations", java.util.List.of("Please consult a veterinarian for visual diagnosis")
            );
        }
    }
}

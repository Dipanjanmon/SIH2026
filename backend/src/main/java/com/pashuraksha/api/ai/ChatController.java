package com.pashuraksha.api.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ChatController {

    private final AiServiceClient aiServiceClient;

    @PostMapping("/chat/advisory")
    public ResponseEntity<Map<String, Object>> chatAdvisory(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(aiServiceClient.chatAdvisory(request));
    }

    @PostMapping("/chat/fusion")
    public ResponseEntity<Map<String, Object>> fusionDiagnosis(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(aiServiceClient.fusionDiagnosis(request));
    }

    @PostMapping("/diagnose/complete")
    public ResponseEntity<Map<String, Object>> completeDiagnosis(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(aiServiceClient.completeDiagnosis(request));
    }
}

package com.pashuraksha.api.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/detect")
@RequiredArgsConstructor
public class DetectionController {

    private final AiServiceClient aiServiceClient;

    @PostMapping("/image")
    public ResponseEntity<Map<String, Object>> detectImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "language", required = false, defaultValue = "en-IN") String language) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }
        return ResponseEntity.ok(aiServiceClient.detectImage(file, language));
    }
}

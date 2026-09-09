package com.pashuraksha.api.drive;

import com.pashuraksha.api.service.GoogleDriveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/drive")
@RequiredArgsConstructor
public class GoogleDriveController {

    private final GoogleDriveService googleDriveService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String url = googleDriveService.uploadFile(file);
            return ResponseEntity.ok(Map.of("success", "true", "url", url));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("success", "false", "error", e.getMessage()));
        }
    }
}

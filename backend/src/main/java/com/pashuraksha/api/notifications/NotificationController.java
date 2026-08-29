package com.pashuraksha.api.notifications;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getRecentNotifications() {
        return ResponseEntity.ok(notificationService.getRecentNotifications());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(notificationService.getNotificationStats());
    }

    @GetMapping("/district/{district}")
    public ResponseEntity<List<Notification>> getByDistrict(@PathVariable String district) {
        return ResponseEntity.ok(notificationService.getByDistrict(district));
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<Notification>> getByRole(@PathVariable String role) {
        return ResponseEntity.ok(notificationService.getByRole(role));
    }

    @PostMapping("/send")
    public ResponseEntity<Notification> sendManualNotification(@RequestBody Map<String, String> request) {
        Notification notification = notificationService.sendSmsNotification(
                request.getOrDefault("phone", "+91-0000000000"),
                request.getOrDefault("name", "Unknown"),
                request.getOrDefault("role", "FARMER"),
                request.get("message"),
                request.getOrDefault("subject", "PashuRaksha Notification"),
                request.getOrDefault("district", ""),
                Notification.NotificationType.GENERAL,
                null, null
        );
        return ResponseEntity.ok(notification);
    }
}

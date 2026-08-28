package com.pashuraksha.api.notifications;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Simulate sending an SMS notification.
     * In production, this would integrate with MSG91/Twilio/CDAC SMS gateway.
     */
    public Notification sendSmsNotification(String phone, String name, String role,
                                            String message, String subject, String district,
                                            Notification.NotificationType type,
                                            Long relatedCaseId, Long relatedAlertId) {
        Notification notification = Notification.builder()
                .type(type)
                .recipientPhone(phone)
                .recipientName(name)
                .recipientRole(role)
                .message(message)
                .subject(subject)
                .district(district)
                .relatedCaseId(relatedCaseId)
                .relatedAlertId(relatedAlertId)
                .channel("SMS")
                .status(Notification.NotificationStatus.SENT)
                .deliveredAt(LocalDateTime.now().plusSeconds(2)) // Simulate delivery
                .build();

        notification = notificationRepository.save(notification);

        // ponytail: In production, call SMS API here (MSG91/Twilio)
        // For demo, we log it and mark as delivered
        System.out.println("[SMS SIM] To: " + phone + " | " + subject + " | " + message.substring(0, Math.min(80, message.length())));

        return notification;
    }

    /**
     * Send disease alert notification to relevant personnel.
     */
    public void notifyDiseaseAlert(String district, String diseaseName, String riskLevel,
                                   String caseNumber, Long caseId) {
        String message = String.format(
                "PASHURAKSHA ALERT: %s case (%s risk) reported in %s district. Case: %s. Take immediate action.",
                diseaseName, riskLevel, district, caseNumber
        );

        // Notify vets in the district
        sendSmsNotification(
                "+91-VET-DISTRICT", "District Veterinary Officer", "VETERINARIAN",
                message, "Disease Alert: " + diseaseName, district,
                Notification.NotificationType.DISEASE_ALERT, caseId, null
        );

        // If critical, also notify block officer
        if ("CRITICAL".equals(riskLevel) || "HIGH".equals(riskLevel)) {
            sendSmsNotification(
                    "+91-BLOCK-OFFICER", "Block Animal Husbandry Officer", "GOVT_OFFICIAL",
                    message, "URGENT: " + diseaseName + " Outbreak Risk", district,
                    Notification.NotificationType.OUTBREAK_WARNING, caseId, null
            );
        }
    }

    /**
     * Send vaccination reminder.
     */
    public void notifyVaccinationDue(String farmerPhone, String farmerName,
                                     String animalTag, String vaccineName, String district) {
        String message = String.format(
                "PASHURAKSHA: Vaccination reminder for animal %s. %s vaccine is due. Contact your nearest veterinary center.",
                animalTag, vaccineName
        );
        sendSmsNotification(
                farmerPhone, farmerName, "FARMER",
                message, "Vaccination Reminder", district,
                Notification.NotificationType.VACCINATION_REMINDER, null, null
        );
    }

    public List<Notification> getRecentNotifications() {
        return notificationRepository.findTop50ByOrderBySentAtDesc();
    }

    public List<Notification> getByDistrict(String district) {
        return notificationRepository.findByDistrictOrderBySentAtDesc(district);
    }

    public List<Notification> getByRole(String role) {
        return notificationRepository.findByRecipientRoleOrderBySentAtDesc(role);
    }

    public Map<String, Object> getNotificationStats() {
        List<Notification> all = notificationRepository.findAll();
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", all.size());
        stats.put("sent", all.stream().filter(n -> n.getStatus() == Notification.NotificationStatus.SENT).count());
        stats.put("delivered", all.stream().filter(n -> n.getStatus() == Notification.NotificationStatus.DELIVERED).count());
        stats.put("failed", all.stream().filter(n -> n.getStatus() == Notification.NotificationStatus.FAILED).count());
        stats.put("byType", all.stream().collect(
                java.util.stream.Collectors.groupingBy(n -> n.getType().name(), java.util.stream.Collectors.counting())
        ));
        return stats;
    }
}

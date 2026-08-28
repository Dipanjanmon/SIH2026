package com.pashuraksha.api.alerts;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;

    public Alert createAlert(Alert alert) {
        return alertRepository.save(alert);
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public Alert getAlertById(Long id) {
        return alertRepository.findById(id).orElseThrow(() -> new RuntimeException("Alert not found"));
    }

    public Alert markRead(Long id) {
        Alert alert = getAlertById(id);
        alert.setIsRead(true);
        return alertRepository.save(alert);
    }

    public List<Alert> findUnread() {
        return alertRepository.findByIsReadFalse();
    }

    public List<Alert> findByTargetRole(String role) {
        return alertRepository.findByTargetRole(role);
    }

    public List<Alert> findByDistrict(String district) {
        return alertRepository.findByDistrict(district);
    }

    public void deleteAlert(Long id) {
        alertRepository.deleteById(id);
    }
}

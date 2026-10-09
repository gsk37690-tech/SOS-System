package com.smartcampusguardian.service;

import com.smartcampusguardian.entity.IncidentSeverity;
import com.smartcampusguardian.entity.IncidentType;
import org.springframework.stereotype.Service;

@Service
public class TriageService {
    public IncidentSeverity calculateSeverity(IncidentType type) {
        return switch (type) {
            case PERSONAL_DANGER, FIRE -> IncidentSeverity.CRITICAL;
            case MEDICAL_EMERGENCY, ACCIDENT, SECURITY_ISSUE -> IncidentSeverity.HIGH;
            case SUSPICIOUS_ACTIVITY, THEFT, OTHER -> IncidentSeverity.MEDIUM;
            case INFRASTRUCTURE_HAZARD -> IncidentSeverity.LOW;
        };
    }
}

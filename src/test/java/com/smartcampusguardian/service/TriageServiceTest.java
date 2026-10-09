package com.smartcampusguardian.service;

import static org.assertj.core.api.Assertions.assertThat;
import com.smartcampusguardian.entity.IncidentSeverity;
import com.smartcampusguardian.entity.IncidentType;
import org.junit.jupiter.api.Test;

class TriageServiceTest {
    private final TriageService triage = new TriageService();
    @Test void appliesSpecifiedEmergencyRules() {
        assertThat(triage.calculateSeverity(IncidentType.PERSONAL_DANGER)).isEqualTo(IncidentSeverity.CRITICAL);
        assertThat(triage.calculateSeverity(IncidentType.MEDICAL_EMERGENCY)).isEqualTo(IncidentSeverity.HIGH);
        assertThat(triage.calculateSeverity(IncidentType.SUSPICIOUS_ACTIVITY)).isEqualTo(IncidentSeverity.MEDIUM);
        assertThat(triage.calculateSeverity(IncidentType.INFRASTRUCTURE_HAZARD)).isEqualTo(IncidentSeverity.LOW);
    }
}

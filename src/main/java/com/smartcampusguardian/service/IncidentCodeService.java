package com.smartcampusguardian.service;

import com.smartcampusguardian.repository.IncidentRepository;
import java.time.Year;
import org.springframework.stereotype.Service;

@Service
public class IncidentCodeService {
    private final IncidentRepository incidentRepository;
    public IncidentCodeService(IncidentRepository incidentRepository) { this.incidentRepository = incidentRepository; }
    public String nextCode() {
        int sequence = Math.toIntExact(incidentRepository.count() + 1);
        String candidate;
        do { candidate = "SCG-%d-%06d".formatted(Year.now().getValue(), sequence++); }
        while (incidentRepository.existsByIncidentCode(candidate));
        return candidate;
    }
}

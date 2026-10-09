package com.smartcampusguardian.dto;
import com.smartcampusguardian.entity.IncidentType; import jakarta.validation.constraints.*;
public record IncidentRequest(@NotNull IncidentType incidentType, @NotNull Long zoneId, @NotBlank @Size(max=5000) String description, boolean silent, boolean anonymousReport) { }

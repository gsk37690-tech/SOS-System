package com.smartcampusguardian.entity;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name = "incidents") public class Incident {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; @Column(name = "incident_code", nullable = false, unique = true) private String incidentCode;
 @ManyToOne(optional = false) @JoinColumn(name = "reported_by", nullable = false) private User reportedBy; @Enumerated(EnumType.STRING) @Column(name = "incident_type", nullable = false) private IncidentType incidentType;
 @Column(nullable = false, columnDefinition = "TEXT") private String description; @ManyToOne @JoinColumn(name = "zone_id") private CampusZone zone;
 @Enumerated(EnumType.STRING) @Column(nullable = false) private IncidentSeverity severity; @Enumerated(EnumType.STRING) @Column(nullable = false) private IncidentStatus status = IncidentStatus.REPORTED;
 @Column(name = "is_silent", nullable = false) private boolean silent; @Column(name = "anonymous_report", nullable = false) private boolean anonymousReport;
 @Column(name = "created_at", nullable = false) private Instant createdAt; @Column(name = "acknowledged_at") private Instant acknowledgedAt; @Column(name = "assigned_at") private Instant assignedAt; @Column(name = "responding_at") private Instant respondingAt; @Column(name = "arrived_at") private Instant arrivedAt; @Column(name = "resolved_at") private Instant resolvedAt; @Column(name = "resolution_notes", columnDefinition = "TEXT") private String resolutionNotes;
 @PrePersist void created() { createdAt = Instant.now(); } public Long getId() { return id; } public String getIncidentCode() { return incidentCode; } public IncidentType getIncidentType() { return incidentType; }
}

package com.smartcampusguardian.entity;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name = "incident_updates") public class IncidentUpdate {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; @ManyToOne(optional = false) @JoinColumn(name = "incident_id") private Incident incident; @ManyToOne @JoinColumn(name = "updated_by") private User updatedBy;
 @Enumerated(EnumType.STRING) @Column(name = "old_status") private IncidentStatus oldStatus; @Enumerated(EnumType.STRING) @Column(name = "new_status") private IncidentStatus newStatus; @Column(nullable = false, length = 1000) private String message; @Column(name = "created_at", nullable = false) private Instant createdAt; @PrePersist void created() { createdAt = Instant.now(); }
}

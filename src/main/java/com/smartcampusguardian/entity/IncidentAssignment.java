package com.smartcampusguardian.entity;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name = "incident_assignments") public class IncidentAssignment {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; @ManyToOne(optional = false) @JoinColumn(name = "incident_id") private Incident incident; @ManyToOne(optional = false) @JoinColumn(name = "officer_id") private SecurityOfficer officer;
 @Column(name = "assigned_at", nullable = false) private Instant assignedAt; @Column(name = "accepted_at") private Instant acceptedAt; @Column(name = "completed_at") private Instant completedAt; @PrePersist void created() { assignedAt = Instant.now(); }
}

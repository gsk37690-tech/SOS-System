package com.smartcampusguardian.entity;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name = "campus_alerts") public class CampusAlert {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; @Column(nullable = false) private String title; @Column(nullable = false, length = 1500) private String message; @Enumerated(EnumType.STRING) @Column(nullable = false) private IncidentSeverity severity; @Column(nullable = false) private boolean active = true; @ManyToOne(optional = false) @JoinColumn(name = "created_by") private User createdBy; @Column(name = "expires_at") private Instant expiresAt; @Column(name = "created_at", nullable = false) private Instant createdAt; @PrePersist void created() { createdAt = Instant.now(); }
}

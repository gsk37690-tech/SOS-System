package com.smartcampusguardian.entity;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name = "safety_checkins") public class SafetyCheckIn {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; @Column(nullable = false) private String title; private String message; @ManyToOne(optional = false) @JoinColumn(name = "created_by") private User createdBy; @Enumerated(EnumType.STRING) @Column(nullable = false) private CheckInStatus status = CheckInStatus.OPEN; @Column(name = "expires_at") private Instant expiresAt; @Column(name = "created_at", nullable = false) private Instant createdAt; @PrePersist void created() { createdAt = Instant.now(); }
}

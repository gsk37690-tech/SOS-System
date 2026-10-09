package com.smartcampusguardian.entity;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name = "drills") public class Drill {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; @Column(nullable = false) private String title; private String description; @Enumerated(EnumType.STRING) @Column(nullable = false) private DrillStatus status = DrillStatus.PLANNED; @Column(name = "scheduled_at") private Instant scheduledAt; @ManyToOne(optional = false) @JoinColumn(name = "created_by") private User createdBy; @Column(name = "created_at", nullable = false) private Instant createdAt; @PrePersist void created() { createdAt = Instant.now(); }
}

package com.smartcampusguardian.entity;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name = "audit_logs") public class AuditLog {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; @ManyToOne @JoinColumn(name = "actor_id") private User actor; @Column(nullable = false) private String action; @Column(name = "entity_type", nullable = false) private String entityType; @Column(name = "entity_id") private Long entityId; @Column(length = 1500) private String detail; @Column(name = "created_at", nullable = false) private Instant createdAt; @PrePersist void created() { createdAt = Instant.now(); }
}

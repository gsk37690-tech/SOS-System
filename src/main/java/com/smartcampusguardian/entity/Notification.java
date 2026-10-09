package com.smartcampusguardian.entity;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name = "notifications") public class Notification {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; @ManyToOne(optional = false) @JoinColumn(name = "user_id") private User user; @Column(nullable = false) private String title; @Column(nullable = false, length = 1000) private String message; @Column(name = "notification_type", nullable = false) private String notificationType; @Column(name = "read_at") private Instant readAt; @Column(name = "created_at", nullable = false) private Instant createdAt; @PrePersist void created() { createdAt = Instant.now(); }
}

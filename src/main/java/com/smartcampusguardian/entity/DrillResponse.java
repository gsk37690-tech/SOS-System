package com.smartcampusguardian.entity;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name = "drill_responses", uniqueConstraints = @UniqueConstraint(name = "uk_drill_user", columnNames = {"drill_id", "user_id"})) public class DrillResponse {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; @ManyToOne(optional = false) @JoinColumn(name = "drill_id") private Drill drill; @ManyToOne(optional = false) @JoinColumn(name = "user_id") private User user; @Column(name = "response_status", nullable = false) private String responseStatus; @Column(name = "responded_at", nullable = false) private Instant respondedAt; @PrePersist void created() { respondedAt = Instant.now(); }
}

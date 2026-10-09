package com.smartcampusguardian.entity;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name = "emergency_contacts") public class EmergencyContact {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; @ManyToOne(optional = false) @JoinColumn(name = "user_id") private User user; @Column(nullable = false) private String name;
 @Column(name = "relationship_name") private String relationshipName; @Column(nullable = false) private String phone; @Column(name = "is_primary", nullable = false) private boolean primaryContact; @Column(name = "created_at", nullable = false) private Instant createdAt; @PrePersist void created() { createdAt = Instant.now(); }
}

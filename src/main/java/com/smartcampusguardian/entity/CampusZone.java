package com.smartcampusguardian.entity;
import jakarta.persistence.*;
@Entity @Table(name = "campus_zones") public class CampusZone {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; @Column(nullable = false, unique = true) private String name; private String description;
 @Enumerated(EnumType.STRING) @Column(name = "risk_level", nullable = false) private RiskLevel riskLevel = RiskLevel.LOW; private Double latitude; private Double longitude; private boolean active = true;
 @Column(name = "created_at", nullable = false) private java.time.Instant createdAt; @PrePersist void created() { createdAt = java.time.Instant.now(); } public Long getId() { return id; }
}

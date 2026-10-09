package com.smartcampusguardian.entity;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name = "safe_walks") public class SafeWalk {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; @ManyToOne(optional = false) @JoinColumn(name = "student_id") private User student; @ManyToOne @JoinColumn(name = "start_zone_id") private CampusZone startZone; @ManyToOne @JoinColumn(name = "destination_zone_id") private CampusZone destinationZone; @Enumerated(EnumType.STRING) @Column(nullable = false) private SafeWalkStatus status = SafeWalkStatus.REQUESTED; @Column(name = "requested_at", nullable = false) private Instant requestedAt; @Column(name = "completed_at") private Instant completedAt; @PrePersist void created() { requestedAt = Instant.now(); }
}

package com.smartcampusguardian.entity;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name = "evidence") public class Evidence {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; @ManyToOne(optional = false) @JoinColumn(name = "incident_id") private Incident incident; @ManyToOne(optional = false) @JoinColumn(name = "uploaded_by") private User uploadedBy; @Column(name = "original_filename", nullable = false) private String originalFilename; @Column(name = "stored_filename", nullable = false, unique = true) private String storedFilename; @Column(name = "content_type", nullable = false) private String contentType; @Column(name = "file_size", nullable = false) private long fileSize; @Column(name = "created_at", nullable = false) private Instant createdAt; @PrePersist void created() { createdAt = Instant.now(); }
}

package com.smartcampusguardian.entity;
import jakarta.persistence.*;
@Entity @Table(name = "security_officers") public class SecurityOfficer extends BaseEntity {
 @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id; @OneToOne(optional = false) @JoinColumn(name = "user_id", nullable = false, unique = true) private User user;
 @Column(name = "employee_id", nullable = false, unique = true) private String employeeId; @ManyToOne @JoinColumn(name = "assigned_zone_id") private CampusZone assignedZone;
 @Enumerated(EnumType.STRING) @Column(name = "availability_status", nullable = false) private OfficerAvailability availabilityStatus = OfficerAvailability.AVAILABLE; @Column(name = "shift_name") private String shiftName; public Long getId() { return id; }
}

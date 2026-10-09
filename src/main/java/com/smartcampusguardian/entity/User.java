package com.smartcampusguardian.entity;

import jakarta.persistence.*;

@Entity @Table(name = "users")
public class User extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "full_name", nullable = false, length = 120) private String fullName;
    @Column(name = "register_number", unique = true, length = 50) private String registerNumber;
    @Column(nullable = false, unique = true, length = 160) private String email;
    @Column(length = 30) private String phone;
    @Column(nullable = false, length = 100) private String password;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private Role role;
    private String department;
    @Column(name = "year_level") private String yearLevel;
    private String section;
    @Column(name = "hostel_status") private String hostelStatus;
    @Enumerated(EnumType.STRING) @Column(name = "account_status", nullable = false, length = 20) private AccountStatus accountStatus = AccountStatus.ACTIVE;
    public Long getId() { return id; } public String getEmail() { return email; } public String getPassword() { return password; }
    public Role getRole() { return role; } public AccountStatus getAccountStatus() { return accountStatus; }
    public String getFullName() { return fullName; } public String getRegisterNumber() { return registerNumber; }
    public void setFullName(String value) { fullName = value; } public void setRegisterNumber(String value) { registerNumber = value; }
    public void setEmail(String value) { email = value; } public void setPhone(String value) { phone = value; }
    public void setPassword(String value) { password = value; } public void setRole(Role value) { role = value; }
    public void setDepartment(String value) { department = value; } public void setYearLevel(String value) { yearLevel = value; }
    public void setSection(String value) { section = value; } public void setHostelStatus(String value) { hostelStatus = value; }
    public void setAccountStatus(AccountStatus value) { accountStatus = value; }
}

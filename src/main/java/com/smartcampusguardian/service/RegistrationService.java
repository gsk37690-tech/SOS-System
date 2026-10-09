package com.smartcampusguardian.service;
import com.smartcampusguardian.dto.RegistrationRequest; import com.smartcampusguardian.entity.*; import com.smartcampusguardian.exception.BusinessRuleException; import com.smartcampusguardian.repository.UserRepository; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
@Service public class RegistrationService {
 private final UserRepository users; private final PasswordEncoder encoder;
 public RegistrationService(UserRepository users, PasswordEncoder encoder) { this.users=users; this.encoder=encoder; }
 @Transactional public User registerStudent(RegistrationRequest request) {
  if (!request.password().equals(request.confirmPassword())) throw new BusinessRuleException("Passwords do not match");
  if (users.existsByEmailIgnoreCase(request.email())) throw new BusinessRuleException("Email is already registered");
  if (users.existsByRegisterNumber(request.registerNumber())) throw new BusinessRuleException("Register number is already registered");
  User user=new User(); user.setFullName(request.fullName()); user.setRegisterNumber(request.registerNumber()); user.setEmail(request.email().trim().toLowerCase()); user.setPhone(request.phone()); user.setDepartment(request.department()); user.setYearLevel(request.yearLevel()); user.setSection(request.section()); user.setHostelStatus(request.hostelStatus()); user.setRole(Role.ROLE_STUDENT); user.setAccountStatus(AccountStatus.ACTIVE); user.setPassword(encoder.encode(request.password())); return users.save(user);
 }
}

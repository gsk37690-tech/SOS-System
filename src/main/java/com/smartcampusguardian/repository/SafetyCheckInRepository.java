package com.smartcampusguardian.repository;
import com.smartcampusguardian.entity.SafetyCheckIn; import org.springframework.data.jpa.repository.JpaRepository;
public interface SafetyCheckInRepository extends JpaRepository<SafetyCheckIn, Long> { }

package com.smartcampusguardian.repository;
import com.smartcampusguardian.entity.EmergencyContact; import org.springframework.data.jpa.repository.JpaRepository;
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> { }

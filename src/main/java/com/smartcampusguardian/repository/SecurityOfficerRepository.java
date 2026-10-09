package com.smartcampusguardian.repository;
import com.smartcampusguardian.entity.SecurityOfficer; import java.util.Optional; import org.springframework.data.jpa.repository.JpaRepository;
public interface SecurityOfficerRepository extends JpaRepository<SecurityOfficer, Long> { Optional<SecurityOfficer> findByUserId(Long userId); }

package com.smartcampusguardian.repository;
import com.smartcampusguardian.entity.CampusAlert; import org.springframework.data.jpa.repository.JpaRepository;
public interface CampusAlertRepository extends JpaRepository<CampusAlert, Long> { }

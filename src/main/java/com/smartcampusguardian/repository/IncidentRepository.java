package com.smartcampusguardian.repository;
import com.smartcampusguardian.entity.Incident; import java.util.Optional; import org.springframework.data.jpa.repository.JpaRepository;
public interface IncidentRepository extends JpaRepository<Incident, Long> { Optional<Incident> findByIncidentCode(String incidentCode); boolean existsByIncidentCode(String incidentCode); }

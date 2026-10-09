package com.smartcampusguardian.repository;
import com.smartcampusguardian.entity.Notification; import org.springframework.data.jpa.repository.JpaRepository;
public interface NotificationRepository extends JpaRepository<Notification, Long> { }

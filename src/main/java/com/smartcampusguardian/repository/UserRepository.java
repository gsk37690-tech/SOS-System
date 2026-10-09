package com.smartcampusguardian.repository;
import com.smartcampusguardian.entity.User; import java.util.Optional; import org.springframework.data.jpa.repository.JpaRepository;
public interface UserRepository extends JpaRepository<User, Long> { Optional<User> findByEmailIgnoreCase(String email); Optional<User> findByRegisterNumber(String registerNumber); boolean existsByEmailIgnoreCase(String email); boolean existsByRegisterNumber(String registerNumber); }

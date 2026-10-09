package com.smartcampusguardian.controller;
import com.smartcampusguardian.dto.RegistrationRequest; import com.smartcampusguardian.entity.User; import com.smartcampusguardian.service.RegistrationService; import jakarta.validation.Valid; import java.util.Map; import org.springframework.http.*; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") public class AuthController {
 private final RegistrationService registration; public AuthController(RegistrationService registration) { this.registration=registration; }
 @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED) public Map<String,Object> register(@Valid @RequestBody RegistrationRequest request) { User user=registration.registerStudent(request); return Map.of("id",user.getId(),"email",user.getEmail(),"role",user.getRole().name()); }
}

package com.smartcampusguardian.dto;
import jakarta.validation.constraints.*;
public record RegistrationRequest(@NotBlank @Size(max=120) String fullName, @NotBlank @Size(max=50) String registerNumber, @Email @NotBlank String email, @NotBlank @Size(max=30) String phone, @NotBlank String department, @NotBlank String yearLevel, @NotBlank String section, @NotBlank String hostelStatus, @NotBlank @Size(min=8,max=72) String password, @NotBlank String confirmPassword) { }

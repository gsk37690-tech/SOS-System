package com.smartcampusguardian.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.Customizer;
import com.smartcampusguardian.security.RoleLoginSuccessHandler;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
    @Bean SecurityFilterChain securityFilterChain(HttpSecurity http, RoleLoginSuccessHandler successHandler) throws Exception {
        return http.csrf(csrf -> csrf.ignoringRequestMatchers("/api/**")).authorizeHttpRequests(auth -> auth.requestMatchers("/", "/login", "/register", "/error", "/css/**", "/js/**", "/images/**", "/api/auth/register").permitAll()
                .requestMatchers("/admin/**", "/api/admin/**").hasRole("ADMIN").requestMatchers("/security/**", "/api/security/**").hasRole("SECURITY").requestMatchers("/student/**", "/api/student/**").hasRole("STUDENT").anyRequest().authenticated())
            .formLogin(form -> form.loginPage("/login").successHandler(successHandler).permitAll()).logout(logout -> logout.logoutSuccessUrl("/")).build();
    }
}

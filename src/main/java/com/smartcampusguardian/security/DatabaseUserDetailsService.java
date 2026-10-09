package com.smartcampusguardian.security;

import com.smartcampusguardian.entity.AccountStatus;
import com.smartcampusguardian.entity.User;
import com.smartcampusguardian.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class DatabaseUserDetailsService implements UserDetailsService {
    private final UserRepository users;
    public DatabaseUserDetailsService(UserRepository users) { this.users = users; }
    @Override public UserDetails loadUserByUsername(String username) {
        User user = users.findByEmailIgnoreCase(username)
            .or(() -> users.findByRegisterNumber(username))
            .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
        return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
            .password(user.getPassword()).authorities(new SimpleGrantedAuthority(user.getRole().name()))
            .disabled(user.getAccountStatus() == AccountStatus.DISABLED).build();
    }
}


package com.trustvault.user.service;

import com.trustvault.user.entity.AccountStatus;
import com.trustvault.user.entity.User;
import com.trustvault.user.repository.UserRepository;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier)
            throws UsernameNotFoundException {

        String value = identifier.trim();

        User user = userRepository.findByUsernameIgnoreCase(value)
                .or(() -> userRepository.findByEmailIgnoreCase(value))
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Invalid username/email or password"));

        boolean active =
                user.getAccountStatus() == AccountStatus.ACTIVE
                && user.isEmailVerified();

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .disabled(!active)
                .build();
    }
}

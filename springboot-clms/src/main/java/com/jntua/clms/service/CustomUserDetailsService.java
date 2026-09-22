package com.jntua.clms.service;

import com.jntua.clms.entity.User;
import com.jntua.clms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
            .orElseGet(() -> userRepository.findByMemberId(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username)));

        if (!"active".equals(user.getStatus())) {
            throw new UsernameNotFoundException("Account is inactive: " + username);
        }

        GrantedAuthority authority = new SimpleGrantedAuthority(user.getRole().name());
        return new org.springframework.security.core.userdetails.User(
            user.getEmail(),
            user.getPasswordHash(),
            List.of(authority)
        );
    }
}

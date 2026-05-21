package com.university.forum_app.service;

import com.university.forum_app.entity.Role;
import com.university.forum_app.entity.User;
import com.university.forum_app.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public CustomUserDetailsService(UserRepository userRepository, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        if (user.isAccessRestricted()) {
            notificationService.sendAccountBlockedNotifications(user.getUsername());
        }

        Role role = user.getRole() != null ? user.getRole() : Role.USER;

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                !user.isAccessRestricted(),
                true,
                true,
                true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()))
        );
    }
}
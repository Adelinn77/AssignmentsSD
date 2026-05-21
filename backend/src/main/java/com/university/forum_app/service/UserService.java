package com.university.forum_app.service;

import com.university.forum_app.dto.UserDTO;
import com.university.forum_app.entity.Role;
import com.university.forum_app.entity.User;
import com.university.forum_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private UserDTO mapEntityToDTO(User user) {
        return UserDTO.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .accessRestricted(user.isAccessRestricted())
                .build();
    }

    private User mapDTOToEntity(UserDTO userDTO) {
        return User.builder()
                .username(userDTO.getUsername())
                .email(userDTO.getEmail())
                .phone(userDTO.getPhone())
                .firstName(userDTO.getFirstName())
                .lastName(userDTO.getLastName())
                .build();
    }

    @Transactional
    public UserDTO saveUser(UserDTO userDTO) {
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new IllegalArgumentException("This username is already taken!");
        }
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("This email is already registered!");
        }
        if (userDTO.getPhone() != null && !userDTO.getPhone().trim().isEmpty()) {
            if (userRepository.existsByPhone(userDTO.getPhone())) {
                throw new IllegalArgumentException("This phone number is already associated with an account!");
            }
        }

        User user = mapDTOToEntity(userDTO);

        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));

        user.setRole(Role.USER);
        user.setAccessRestricted(false);
        userRepository.save(user);

        return mapEntityToDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO findUserByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User with username '" + username + "' does not exist");
        }
        return mapEntityToDTO(user);
    }

    @Transactional
    public UserDTO updateUser(UserDTO updatedUser) {
       User user = userRepository.findByUsername(updatedUser.getUsername());
        if (user == null) {
            throw new IllegalArgumentException("User with username '" + updatedUser.getUsername() + "' does not exist.");
        }

        user.setEmail(updatedUser.getEmail());
        user.setPhone(updatedUser.getPhone());
        user.setFirstName(updatedUser.getFirstName());
        user.setLastName(updatedUser.getLastName());

        userRepository.save(user);
        return mapEntityToDTO(user);
    }

    @Transactional
    public void deleteUserByUsername(String username) {
        if(userRepository.existsByUsername(username)) {
            userRepository.deleteByUsername(username);
        } else {
            throw new IllegalArgumentException("User with username '" + username + "' does not exist.");
        }
    }

    @Transactional(readOnly = true)
    public List<UserDTO> findAllUsers() {
        List<User> users = new ArrayList<>();
        userRepository.findAll().forEach(users::add);
        return users.stream().map(this::mapEntityToDTO).toList();
    }

    @Transactional(readOnly = true)
    public UserDTO findUserByEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new IllegalArgumentException("User not found with email: '" + email + "'.");
        }
        return mapEntityToDTO(user);
    }

    @Transactional(readOnly = true)
    public UserDTO findUserById(Long id) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            return mapEntityToDTO(optionalUser.get());
        } else {
            throw new IllegalArgumentException("User with id " + id + " does not exist.");
        }
    }
    @Transactional
    public UserDTO blockUser(String username, String adminUsername) {
        User admin = requireAdmin(adminUsername);
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User with username '" + username + "' does not exist.");
        }
        if (user.getUsername().equals(admin.getUsername())) {
            throw new IllegalArgumentException("An admin cannot block their own account.");
        }

        user.setAccessRestricted(true);
        userRepository.save(user);

        return mapEntityToDTO(user);
    }

    @Transactional
    public UserDTO unblockUser(String username, String adminUsername) {
        requireAdmin(adminUsername);

        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User with username '" + username + "' does not exist.");
        }

        user.setAccessRestricted(false);
        userRepository.save(user);

        return mapEntityToDTO(user);
    }

    @Transactional(readOnly = true)
    public boolean isAdmin(String username) {
        User user = userRepository.findByUsername(username);
        return user != null && user.getRole() == Role.ADMIN;
    }

    private User requireAdmin(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null || user.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Admin privileges are required.");
        }
        return user;
    }
}
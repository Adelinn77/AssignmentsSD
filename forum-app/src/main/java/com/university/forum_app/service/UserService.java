package com.university.forum_app.service;

import com.university.forum_app.dto.UserDTO;
import com.university.forum_app.entity.User;
import com.university.forum_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private UserDTO mapEntityToDTO(User user) {
        return UserDTO.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
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
        if(userRepository.existsByUsername(userDTO.getUsername())) {
            throw new IllegalArgumentException("User with username " + userDTO.getUsername() + " already exists");
        }
        if(userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("User with email " + userDTO.getEmail() + " already exists");
        }
        User newUser = mapDTOToEntity(userDTO);
        userRepository.save(newUser);
        return mapEntityToDTO(newUser);
    }

    public UserDTO findUserByUsername(String username) {
        User user;
        try {
            user = userRepository.findByUsername(username);
        }
        catch (Exception e) {
            throw new IllegalArgumentException("User with username " + username + " does not exist");
        }
        UserDTO userDTO =  mapEntityToDTO(user);
        return userDTO;
    }

    @Transactional
    public UserDTO updateUser(UserDTO updatedUser) {
        User user;
        try {
            user = userRepository.findByUsername(updatedUser.getUsername());
        }
        catch (Exception e) {
            throw new IllegalArgumentException("User with username " + updatedUser.getUsername() + " does not exist");
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
        }
        else  {
            throw new IllegalArgumentException("User with username:" + username + " does not exist.");
        }
    }

    public List<UserDTO> findAllUsers() {
        List<User> users = new ArrayList<>();
        userRepository.findAll().forEach(users::add);
        List<UserDTO> userDTOs = new ArrayList<>();
        userDTOs = users.stream().map(this::mapEntityToDTO).toList();
        return userDTOs;
    }

}

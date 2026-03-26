package com.university.forum_app.service;

import com.university.forum_app.dto.UserDTO;
import com.university.forum_app.entity.User;
import com.university.forum_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private UserDTO mapEntityToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .phone(user.getPhone())
                .build();
    }

    private User mapDTOToEntity(UserDTO userDTO) {
        return User.builder()
                .id(userDTO.getId())
                .username(userDTO.getUsername())
                .email(userDTO.getEmail())
                .phone(userDTO.getPhone())
                .build();
    }

    public UserDTO saveUser(UserDTO userDTO) {
        User newUser = mapDTOToEntity(userDTO);
        userRepository.save(newUser);
        return mapEntityToDTO(newUser);
    }

    public UserDTO findUserById(Long id) {
        if(userRepository.existsById(id)) {
            User user = userRepository.findById(id).get();
            UserDTO userDTO =  mapEntityToDTO(user);
            return userDTO;
        }
        else {
            throw new IllegalArgumentException("User with id " + id + " does not exist");
        }
    }

    public UserDTO findUserByUsername(String username) {
        User user = userRepository.findByUsernameIs(username);
        UserDTO userDTO =  mapEntityToDTO(user);
        return userDTO;
    }

    public UserDTO updateUser(UserDTO updatedUser) {
        User user =  mapDTOToEntity(updatedUser);
        if(userRepository.existsById(user.getId())) {
            User savedUser = userRepository.save(user);
            UserDTO userDTO =  mapEntityToDTO(savedUser);
            return userDTO;
        }
        else {
            throw new IllegalArgumentException("User with id:" + updatedUser.getId() + "not found.");
        }
    }

    public void deleteUserById(Long id) {
        if(userRepository.existsById(id)){
            userRepository.deleteById(id);
        }
        else  {
            throw new IllegalArgumentException("User with id:" + id + " does not exist.");
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

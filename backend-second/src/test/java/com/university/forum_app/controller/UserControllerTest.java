package com.university.forum_app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.university.forum_app.dto.UserDTO;
import com.university.forum_app.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private UserDTO mockUserDTO;

    @BeforeEach
    void setUp() {
        mockUserDTO = UserDTO.builder()
                .username("johndoe")
                .email("john@example.com")
                .firstName("John")
                .lastName("Doe")
                .phone("0712345678")
                .build();
    }

    @Test
    void testCreateUserSuccess() throws Exception {
        when(userService.saveUser(any(UserDTO.class))).thenReturn(mockUserDTO);

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockUserDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value("johndoe"))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    void testCreateUserConflict() throws Exception {
        when(userService.saveUser(any(UserDTO.class)))
                .thenThrow(new IllegalArgumentException("User with username johndoe already exists"));

        mockMvc.perform(post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockUserDTO)))
                .andExpect(status().isConflict())
                .andExpect(content().string("User with username johndoe already exists"));
    }

    @Test
    void testGetAllUsers() throws Exception {
        when(userService.findAllUsers()).thenReturn(Collections.singletonList(mockUserDTO));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].username").value("johndoe"));
    }

    @Test
    void testGetUserByUsername_Success() throws Exception {
        when(userService.findUserByUsername("johndoe")).thenReturn(mockUserDTO);

        mockMvc.perform(get("/api/users/johndoe"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("johndoe"));
    }
}

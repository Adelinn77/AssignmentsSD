package com.university.forum_app.service;

import com.university.forum_app.dto.UserDTO;
import com.university.forum_app.entity.User;
import com.university.forum_app.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User mockUserEntity;
    private UserDTO mockUserDTO;

    @BeforeEach
    void setUp() {
        mockUserEntity = User.builder()
                .id(1L)
                .username("test_user")
                .email("test@email.com")
                .firstName("Test")
                .lastName("Mockito")
                .build();

        mockUserDTO = UserDTO.builder()
                .username("test_user")
                .email("test@email.com")
                .firstName("Test")
                .lastName("Mockito")
                .build();
    }

    @Test
    void testSaveUser_Success() {
        when(userRepository.existsByUsername(mockUserDTO.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(mockUserDTO.getEmail())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(mockUserEntity);

        UserDTO result = userService.saveUser(mockUserDTO);

        assertNotNull(result);
        assertEquals("test_user", result.getUsername());
        
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testSaveUser_ThrowsException_WhenUsernameAlreadyExists() {
        when(userRepository.existsByUsername(mockUserDTO.getUsername())).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.saveUser(mockUserDTO);
        });

        assertEquals("User with username test_user already exists", exception.getMessage());
        
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testFindUserByUsername_Success() {
        when(userRepository.findByUsername("test_user")).thenReturn(mockUserEntity);

        UserDTO result = userService.findUserByUsername("test_user");

        assertNotNull(result);
        assertEquals("test@email.com", result.getEmail());
    }

    @Test
    void testFindUserByUsername_NotFound_ThrowsException() {
        when(userRepository.findByUsername("ghost_user")).thenReturn(null);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.findUserByUsername("ghost_user");
        });

        assertEquals("User with username 'ghost_user' does not exist", exception.getMessage());
    }
}

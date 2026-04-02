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

    // @Mock creează un obiect "fals" al repository-ului
    // Astfel, NU ne conectăm la baza de date reală MySQL
    @Mock
    private UserRepository userRepository;

    // @InjectMocks injectează mock-ul de mai sus direct în UserService
    @InjectMocks
    private UserService userService;

    private User mockUserEntity;
    private UserDTO mockUserDTO;

    // Această metodă se rulează automat ÎNAINTE de fiecare Test, pentru a pregăti datele
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
        // 1. Arrange (Pregătirea) - Îi spunem Mockito ce "minciuni" să întoarcă
        when(userRepository.existsByUsername(mockUserDTO.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(mockUserDTO.getEmail())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(mockUserEntity);

        // 2. Act (Acțiunea) - Rulăm metoda reală din Service-ul nostru
        UserDTO result = userService.saveUser(mockUserDTO);

        // 3. Assert (Verificarea) - Controlăm dacă funcționează conform așteptărilor
        assertNotNull(result);
        assertEquals("test_user", result.getUsername());
        
        // Verificăm că metoda 'save' din repository a fost apelată exact o dată!
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testSaveUser_ThrowsException_WhenUsernameAlreadyExists() {
        // 1. Arrange: Simulăm că MySql deja conține acest Username
        when(userRepository.existsByUsername(mockUserDTO.getUsername())).thenReturn(true);

        // 2 & 3. Act & Assert: Verificăm că aruncă excepția corectă
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            userService.saveUser(mockUserDTO);
        });

        assertEquals("User with username test_user already exists", exception.getMessage());
        
        // Verificăm că NU S-A APELAT deloc funcția de save în baza de date!
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testFindUserByUsername_Success() {
        // Arrange
        when(userRepository.findByUsername("test_user")).thenReturn(mockUserEntity);

        // Act
        UserDTO result = userService.findUserByUsername("test_user");

        // Assert
        assertNotNull(result);
        assertEquals("test@email.com", result.getEmail());
    }
}

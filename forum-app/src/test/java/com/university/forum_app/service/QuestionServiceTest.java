package com.university.forum_app.service;

import com.university.forum_app.dto.QuestionDTO;
import com.university.forum_app.entity.Question;
import com.university.forum_app.entity.Status;
import com.university.forum_app.entity.Tag;
import com.university.forum_app.entity.User;
import com.university.forum_app.repository.QuestionRepository;
import com.university.forum_app.repository.TagRepository;
import com.university.forum_app.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class QuestionServiceTest {

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TagRepository tagRepository;

    @InjectMocks
    private QuestionService questionService;

    private Question mockQuestion;
    private QuestionDTO mockQuestionDTO;
    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(1L).username("testuser").build();

        mockQuestion = Question.builder()
                .id(1L)
                .title("Spring Boot Test")
                .text("How does Mockito work?")
                .status(Status.RECEIVED)
                .author(mockUser)
                .date(LocalDateTime.now())
                .tags(List.of(Tag.builder().label("java").build()))
                .build();

        mockQuestionDTO = QuestionDTO.builder()
                .title("Spring Boot Test")
                .text("How does Mockito work?")
                .status(Status.RECEIVED)
                .authorName("testuser")
                .tags(List.of("java"))
                .build();
    }

    @Test
    void testSaveQuestion_Success() {
        when(questionRepository.existsByTitle(mockQuestionDTO.getTitle())).thenReturn(false);
        when(userRepository.findByUsername(mockQuestionDTO.getAuthorName())).thenReturn(mockUser);
        when(tagRepository.findTagByLabel("java")).thenReturn(null); // Tag doesn't exist, will create
        when(questionRepository.save(any(Question.class))).thenReturn(mockQuestion);

        QuestionDTO result = questionService.saveQuestion(mockQuestionDTO);

        assertNotNull(result);
        assertEquals("Spring Boot Test", result.getTitle());
        verify(questionRepository, times(1)).save(any(Question.class));
    }

    @Test
    void testSaveQuestion_ThrowsException_WhenTitleExists() {
        when(questionRepository.existsByTitle(mockQuestionDTO.getTitle())).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            questionService.saveQuestion(mockQuestionDTO);
        });

        assertTrue(exception.getMessage().contains("is already used"));
        verify(questionRepository, never()).save(any(Question.class));
    }

    @Test
    void testFindQuestionByTitle_Success() {
        when(questionRepository.findByTitle("Spring Boot Test")).thenReturn(mockQuestion);

        QuestionDTO result = questionService.findQuestionByTitle("Spring Boot Test");

        assertNotNull(result);
        assertEquals("testuser", result.getAuthorName());
    }

    @Test
    void testDeleteQuestion_Success() {
        when(questionRepository.existsByTitle("Spring Boot Test")).thenReturn(true);

        assertDoesNotThrow(() -> questionService.deleteQuestionByTitle("Spring Boot Test"));
        verify(questionRepository, times(1)).deleteByTitle("Spring Boot Test");
    }

    @Test
    void testFindAllQuestions() {
        when(questionRepository.findAll()).thenReturn(Collections.singletonList(mockQuestion));

        List<QuestionDTO> result = questionService.findAllQuestions();

        assertEquals(1, result.size());
        assertEquals("Spring Boot Test", result.get(0).getTitle());
    }
}

package com.university.forum_app.service;

import com.university.forum_app.dto.AnswerDTO;
import com.university.forum_app.entity.Answer;
import com.university.forum_app.entity.Question;
import com.university.forum_app.entity.User;
import com.university.forum_app.repository.AnswerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AnswerServiceTest {

    @Mock
    private AnswerRepository answerRepository;

    @InjectMocks
    private AnswerService answerService;

    private Answer mockAnswer;
    private AnswerDTO mockAnswerDTO;

    @BeforeEach
    void setUp() {
        User testUser = User.builder().id(2L).build();
        Question testQuestion = Question.builder().id(1L).build();

        mockAnswer = Answer.builder()
                .id(100L)
                .author(testUser)
                .question(testQuestion)
                .date(LocalDateTime.now())
                .text("Acesta este un mock answer")
                .build();

        mockAnswerDTO = AnswerDTO.builder()
                .answerId(100L)
                .userId(2L)
                .questionId(1L)
                .dateTime(LocalDateTime.now())
                .build();
    }

    @Test
    void testSaveAnswer_Success() {
        when(answerRepository.save(any(Answer.class))).thenReturn(mockAnswer);

        AnswerDTO result = answerService.saveAnswer(mockAnswerDTO);

        assertNotNull(result);
        assertEquals(1L, result.getQuestionId());
        assertEquals(2L, result.getUserId());
        verify(answerRepository, times(1)).save(any(Answer.class));
    }

    @Test
    void testFindAnswerById_Success() {
        when(answerRepository.findById(100L)).thenReturn(Optional.of(mockAnswer));

        AnswerDTO result = answerService.findAnswerById(100L);

        assertNotNull(result);
        assertEquals(100L, result.getAnswerId());
    }

    @Test
    void testFindAnswerById_ThrowsException() {
        when(answerRepository.findById(999L)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            answerService.findAnswerById(999L);
        });

        assertTrue(exception.getMessage().contains("No answer exists with id: '999'"));
    }

    @Test
    void testFindAnswersByQuestionId() {
        when(answerRepository.findByQuestionId(1L)).thenReturn(Collections.singletonList(mockAnswer));

        List<AnswerDTO> result = answerService.findAnswersByQuestionId(1L);

        assertEquals(1, result.size());
        assertEquals(100L, result.get(0).getAnswerId());
    }

    @Test
    void testDeleteAnswerById_Success() {
        when(answerRepository.existsById(100L)).thenReturn(true);

        assertDoesNotThrow(() -> answerService.deleteAnswerById(100L));
        verify(answerRepository, times(1)).deleteById(100L);
    }
}

package com.university.forum_app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.university.forum_app.dto.QuestionDTO;
import com.university.forum_app.entity.Status;
import com.university.forum_app.service.QuestionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(QuestionController.class)
public class QuestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private QuestionService questionService;

    private ObjectMapper objectMapper;

    private QuestionDTO mockQuestionDTO;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule()); // Fix for LocalDateTime serialization

        mockQuestionDTO = QuestionDTO.builder()
                .title("Spring Test")
                .text("WebMvcTest example")
                .status(Status.RECEIVED)
                .authorName("testuser")
                .date(LocalDateTime.now())
                .tags(List.of("testing"))
                .build();
    }

    @Test
    void testCreateQuestion_Success() throws Exception {
        when(questionService.saveQuestion(any(QuestionDTO.class))).thenReturn(mockQuestionDTO);

        mockMvc.perform(post("/api/questions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockQuestionDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Spring Test"))
                .andExpect(jsonPath("$.authorName").value("testuser"));
    }

    @Test
    void testGetAllQuestions() throws Exception {
        when(questionService.findAllQuestions()).thenReturn(Collections.singletonList(mockQuestionDTO));

        mockMvc.perform(get("/api/questions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].title").value("Spring Test"));
    }

    @Test
    void testGetQuestionByTitle_Success() throws Exception {
        when(questionService.findQuestionByTitle("Spring Test")).thenReturn(mockQuestionDTO);

        mockMvc.perform(get("/api/questions/title/Spring Test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Spring Test"));
    }

    @Test
    void testGetQuestionByTitle_NotFound() throws Exception {
        when(questionService.findQuestionByTitle("Unknown"))
                .thenThrow(new IllegalArgumentException("No question exists with this title: 'Unknown'."));

        mockMvc.perform(get("/api/questions/title/Unknown"))
                .andExpect(status().isNotFound()); // As per your Controller mapping
    }

    @Test
    void testUpdateQuestion_Success() throws Exception {
        when(questionService.updateQuestion(eq("Spring Test"), any(QuestionDTO.class))).thenReturn(mockQuestionDTO);

        mockMvc.perform(put("/api/questions/title/Spring Test")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockQuestionDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Spring Test"));
    }
}

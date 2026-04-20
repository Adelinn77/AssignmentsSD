package com.university.forum_app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.university.forum_app.dto.AnswerDTO;
import com.university.forum_app.service.AnswerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnswerController.class)
public class AnswerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnswerService answerService;

    @Autowired
    private ObjectMapper objectMapper;

    private AnswerDTO mockAnswerDTO;

    @BeforeEach
    void setUp() {
        objectMapper.registerModule(new JavaTimeModule());

        mockAnswerDTO = AnswerDTO.builder()
                .answerId(10L)
                .questionId(1L)
                .userId(1L)
                .dateTime(LocalDateTime.now())
                .build();
    }

    @Test
    void testCreateAnswer_Success() throws Exception {
        when(answerService.saveAnswer(any(AnswerDTO.class))).thenReturn(mockAnswerDTO);

        mockMvc.perform(post("/api/answers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mockAnswerDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.answerId").value(10L));
    }

    @Test
    void testGetAllAnswers() throws Exception {
        when(answerService.findAllAnswers()).thenReturn(Collections.singletonList(mockAnswerDTO));

        mockMvc.perform(get("/api/answers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].answerId").value(10L));
    }

    @Test
    void testGetAnswersByQuestionId() throws Exception {
        when(answerService.findAnswersByQuestionId(1L)).thenReturn(Collections.singletonList(mockAnswerDTO));

        mockMvc.perform(get("/api/answers/question/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].questionId").value(1L));
    }

    @Test
    void testGetAnswersByUserId() throws Exception {
        when(answerService.findAnswersByAuthorId(1L)).thenReturn(Collections.singletonList(mockAnswerDTO));

        mockMvc.perform(get("/api/answers/user/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(1L));
    }
}

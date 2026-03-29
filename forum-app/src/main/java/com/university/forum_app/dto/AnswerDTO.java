package com.university.forum_app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnswerDTO {
    private Long answerId;
    private Long questionId;
    private Long userId;
    private LocalDateTime dateTime;
    private List<String> imageUrls;
}
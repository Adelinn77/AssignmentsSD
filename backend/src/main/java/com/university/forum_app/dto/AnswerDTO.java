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
    private String authorName;
    private String text;
    private int likes;
    private int dislikes;
    private LocalDateTime dateTime;
    private List<String> imageUrls;
}
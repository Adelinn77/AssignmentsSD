package com.university.forum_app.dto;

import com.university.forum_app.entity.Status;
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
public class QuestionDTO {

    private Long questionId;
    private String title;
    private String text;
    private int likes;
    private int dislikes;
    private LocalDateTime date;
    private Status status;

    private String authorName;

    private List<String> tags;

    private List<String> imageUrls;

}
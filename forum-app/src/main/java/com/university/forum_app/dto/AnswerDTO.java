package com.university.forum_app.dto;

import com.university.forum_app.entity.Question;
import com.university.forum_app.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AnswerDTO {
    private Long answerId;
    private Long questionId;
    private Long userId;
    private LocalDateTime dateTime;

}

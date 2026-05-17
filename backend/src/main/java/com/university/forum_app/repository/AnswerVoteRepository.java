package com.university.forum_app.repository;

import com.university.forum_app.entity.Answer;
import com.university.forum_app.entity.AnswerVote;
import com.university.forum_app.entity.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.jpa.repository.Query;

public interface AnswerVoteRepository extends CrudRepository<AnswerVote, Long> {
    AnswerVote findByAnswerAndUser(Answer answer, User user);
    
    @Query("SELECT COUNT(v) FROM AnswerVote v WHERE v.answer = :answer AND v.isLike = :isLike")
    long countByAnswerAndIsLike(Answer answer, boolean isLike);

    void deleteByAnswer(Answer answer);
}

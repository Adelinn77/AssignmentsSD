package com.university.forum_app.repository;

import com.university.forum_app.entity.Question;
import com.university.forum_app.entity.QuestionVote;
import com.university.forum_app.entity.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.jpa.repository.Query;

public interface QuestionVoteRepository extends CrudRepository<QuestionVote, Long> {
    QuestionVote findByQuestionAndUser(Question question, User user);
    
    @Query("SELECT COUNT(v) FROM QuestionVote v WHERE v.question = :question AND v.isLike = :isLike")
    long countByQuestionAndIsLike(Question question, boolean isLike);
}

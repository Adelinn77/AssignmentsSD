package com.university.forum_app.repository;

import com.university.forum_app.entity.Answer;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends CrudRepository<Answer, Long> {
    List<Answer> findByQuestionId(Long questionId);

    long countByQuestionId(Long questionId);

    List<Answer> findByAuthorId(Long userId);

    Answer findAnswerById(Long answerId);
}

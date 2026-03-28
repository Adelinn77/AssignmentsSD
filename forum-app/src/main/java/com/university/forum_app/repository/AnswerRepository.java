package com.university.forum_app.repository;

import com.university.forum_app.entity.Answer;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends CrudRepository<Answer, Long> {
    List<Answer> findByAuthorId(Long userId);
    List<Answer> findByQuestionId(Long questionId);
}

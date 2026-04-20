package com.university.forum_app.repository;

import com.university.forum_app.entity.Question;
import com.university.forum_app.entity.Tag;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends CrudRepository<Question, Long> {
    Question findByTitle(String title);
    List<Question> findByAuthorUsername(String username);
    boolean existsByTitle(String title);
    void deleteByTitle(String title);
    boolean existsByText(String text);
    boolean existsByTags(List<Tag> tags);


}

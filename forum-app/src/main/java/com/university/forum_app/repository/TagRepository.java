package com.university.forum_app.repository;

import com.university.forum_app.entity.Tag;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends CrudRepository<Tag, Long> {

    Optional<Tag> findByLabel(String label);
    List<Tag> findByQuestionsId(Long questionId);
}
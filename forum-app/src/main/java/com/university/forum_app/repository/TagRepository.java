package com.university.forum_app.repository;

import com.university.forum_app.entity.Tag;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TagRepository extends CrudRepository<Tag, Long> {

    Tag findTagByLabel(String tagLabel);
}

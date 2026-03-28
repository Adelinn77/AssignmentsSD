package com.university.forum_app.repository;


import com.university.forum_app.entity.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface UserRepository extends CrudRepository<User, Long> {

    User findByUsername(String username);
    boolean existsByUsername(String username);
    void deleteByUsername(String username);
    boolean existsByEmail(String email);

}

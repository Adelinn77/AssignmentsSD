package com.university.forum_app.repository;

import com.university.forum_app.entity.Answer;
import com.university.forum_app.entity.AnswerVote;
import com.university.forum_app.entity.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface AnswerVoteRepository extends CrudRepository<AnswerVote, Long> {
    AnswerVote findByAnswerAndUser(Answer answer, User user);

    @Query("SELECT COUNT(v) FROM AnswerVote v WHERE v.answer = :answer AND v.isLike = :isLike")
    long countByAnswerAndIsLike(Answer answer, boolean isLike);

    void deleteByAnswer(Answer answer);

    void deleteByAnswerIn(List<Answer> answers);
  
    // Count upvotes on answers authored by a specific user
    @Query("SELECT COUNT(v) FROM AnswerVote v WHERE v.answer.author.id = :authorId AND v.isLike = true")
    long countUpvotesOnAnswersByAuthor(Long authorId);

    // Count downvotes on answers authored by a specific user
    @Query("SELECT COUNT(v) FROM AnswerVote v WHERE v.answer.author.id = :authorId AND v.isLike = false")
    long countDownvotesOnAnswersByAuthor(Long authorId);

    // Count downvotes cast by a user on OTHER users' answers (voter penalty)
    @Query("SELECT COUNT(v) FROM AnswerVote v WHERE v.user.id = :voterId AND v.isLike = false AND v.answer.author.id <> :voterId")
    long countDownvotesCastByUserOnOthers(Long voterId);
}

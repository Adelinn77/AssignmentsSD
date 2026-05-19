package com.university.forum_app.service;

import com.university.forum_app.entity.User;
import com.university.forum_app.repository.AnswerVoteRepository;
import com.university.forum_app.repository.QuestionVoteRepository;
import com.university.forum_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserScoreService {

    @Autowired
    private QuestionVoteRepository questionVoteRepository;

    @Autowired
    private AnswerVoteRepository answerVoteRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Calculate the reputation score for a user based on votes.
     *
     * Rules:
     *   - Question upvote:   +2.5 per vote
     *   - Answer upvote:     +5.0 per vote
     *   - Question downvote: -1.5 per vote
     *   - Answer downvote:   -2.5 per vote
     *   - Casting a downvote on another user's answer: -1.5 per vote
     */
    @Transactional(readOnly = true)
    public double calculateScore(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User with username '" + username + "' does not exist.");
        }
        return calculateScore(user.getId());
    }

    @Transactional(readOnly = true)
    public double calculateScore(Long userId) {
        // Upvotes received on user's questions
        long questionUpvotes = questionVoteRepository.countUpvotesOnQuestionsByAuthor(userId);
        // Downvotes received on user's questions
        long questionDownvotes = questionVoteRepository.countDownvotesOnQuestionsByAuthor(userId);
        // Upvotes received on user's answers
        long answerUpvotes = answerVoteRepository.countUpvotesOnAnswersByAuthor(userId);
        // Downvotes received on user's answers
        long answerDownvotes = answerVoteRepository.countDownvotesOnAnswersByAuthor(userId);
        // Downvotes cast by this user on other users' answers (voter penalty)
        long downvotesCast = answerVoteRepository.countDownvotesCastByUserOnOthers(userId);

        double score = 0.0;
        score += questionUpvotes * 2.5;    // question upvote: +2.5
        score -= questionDownvotes * 1.5;   // question downvote: -1.5
        score += answerUpvotes * 5.0;       // answer upvote: +5.0
        score -= answerDownvotes * 2.5;     // answer downvote: -2.5
        score -= downvotesCast * 1.5;       // casting a downvote on another user's answer: -1.5

        return score;
    }
}

package com.university.forum_app.controller;

import com.university.forum_app.repository.AnswerRepository;
import com.university.forum_app.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/testing")
public class TestingController {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @DeleteMapping("/cleanup")
    public void cleanup() {
        answerRepository.deleteAll();
        questionRepository.deleteAll();
    }
}
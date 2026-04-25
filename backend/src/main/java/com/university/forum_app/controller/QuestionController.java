package com.university.forum_app.controller;

import com.university.forum_app.dto.QuestionDTO;
import com.university.forum_app.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:4200")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @PostMapping
    public ResponseEntity<Object> createQuestion(@RequestBody QuestionDTO questionDTO) {
        try {
            QuestionDTO savedQuestion = questionService.saveQuestion(questionDTO);
            return new ResponseEntity<>(savedQuestion, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @PostMapping("/with-images")
    public ResponseEntity<Object> createQuestionWithImages(
            @RequestPart("question") QuestionDTO questionDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> imageFiles) {
        try {
            QuestionDTO savedQuestion = questionService.saveQuestionWithImages(questionDTO, imageFiles);
            return new ResponseEntity<>(savedQuestion, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @GetMapping
    public ResponseEntity<List<QuestionDTO>> getAllQuestions() {
        List<QuestionDTO> questions = questionService.findAllQuestions();
        return new ResponseEntity<>(questions, HttpStatus.OK);
    }

    @GetMapping("/author/{username}")
    public ResponseEntity<Object> getQuestionsByAuthor(@PathVariable String username) {
        try {
            List<QuestionDTO> questions = questionService.findQuestionsByAuthor(username);
            return new ResponseEntity<>(questions, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/title/{title}")
    public ResponseEntity<Object> getQuestionByTitle(@PathVariable String title) {
        try {
            QuestionDTO question = questionService.findQuestionByTitle(title);
            return new ResponseEntity<>(question, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/title/{currentTitle}")
    public ResponseEntity<Object> updateQuestion(
            @PathVariable String currentTitle,
            @RequestBody QuestionDTO questionDTO) {
        try {
            QuestionDTO updatedQuestion = questionService.updateQuestion(currentTitle, questionDTO);
            return new ResponseEntity<>(updatedQuestion, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/title/{title}")
    public ResponseEntity<String> deleteQuestionByTitle(@PathVariable String title) {
        try {
            questionService.deleteQuestionByTitle(title);
            return new ResponseEntity<>("Question with title '" + title + "' was deleted successfully.", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}
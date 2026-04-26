package com.university.forum_app.controller;

import com.university.forum_app.dto.AnswerDTO;
import com.university.forum_app.service.AnswerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/answers")
@CrossOrigin(origins = "http://localhost:4200")
public class AnswerController {

    @Autowired
    private AnswerService answerService;

    @PostMapping
    public ResponseEntity<Object> createAnswer(@RequestBody AnswerDTO answerDTO) {
        try {
            AnswerDTO savedAnswer = answerService.saveAnswer(answerDTO);
            return new ResponseEntity<>(savedAnswer, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/with-images")
    public ResponseEntity<Object> createAnswerWithImages(
            @RequestPart("answer") AnswerDTO answerDTO,
            @RequestPart(value = "images", required = false) List<MultipartFile> imageFiles) {
        try {
            AnswerDTO savedAnswer = answerService.saveAnswerWithImages(answerDTO, imageFiles);
            return new ResponseEntity<>(savedAnswer, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<AnswerDTO>> getAllAnswers() {
        List<AnswerDTO> answers = answerService.findAllAnswers();
        return new ResponseEntity<>(answers, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getAnswerById(@PathVariable Long id) {
        try {
            AnswerDTO answer = answerService.findAnswerById(id);
            return new ResponseEntity<>(answer, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND); // 404 e mai potrivit aici
        }
    }

    @GetMapping("/question/{questionId}")
    public ResponseEntity<List<AnswerDTO>> getAnswersByQuestionId(@PathVariable Long questionId) {
        List<AnswerDTO> answers = answerService.findAnswersByQuestionId(questionId);
        return new ResponseEntity<>(answers, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AnswerDTO>> getAnswersByUserId(@PathVariable Long userId) {
        List<AnswerDTO> answers = answerService.findAnswersByAuthorId(userId);
        return new ResponseEntity<>(answers, HttpStatus.OK);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Object> updateAnswer(@PathVariable Long id, @RequestBody AnswerDTO answerDTO) {
        try {
            answerDTO.setAnswerId(id);
            AnswerDTO updatedAnswer = answerService.updateAnswer(answerDTO);
            return new ResponseEntity<>(updatedAnswer, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAnswer(@PathVariable Long id) {
        try {
            answerService.deleteAnswerById(id);
            return new ResponseEntity<>("Answer with id " + id + " was deleted successfully.", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<Object> likeAnswer(@PathVariable Long id) {
        try {
            AnswerDTO answer = answerService.likeAnswer(id);
            return new ResponseEntity<>(answer, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/dislike")
    public ResponseEntity<Object> dislikeAnswer(@PathVariable Long id) {
        try {
            AnswerDTO answer = answerService.dislikeAnswer(id);
            return new ResponseEntity<>(answer, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}
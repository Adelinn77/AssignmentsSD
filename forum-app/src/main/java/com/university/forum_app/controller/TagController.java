package com.university.forum_app.controller;

import com.university.forum_app.dto.TagDTO;
import com.university.forum_app.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    @Autowired
    private TagService tagService;

    // Crearea unui tag nou
    @PostMapping
    public ResponseEntity<?> createTag(@RequestBody TagDTO tagDTO) {
        try {
            TagDTO savedTag = tagService.saveTag(tagDTO);
            return new ResponseEntity<>(savedTag, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT); // 409 Conflict
        }
    }

    // Obținerea tuturor tag-urilor
    @GetMapping
    public ResponseEntity<List<TagDTO>> getAllTags() {
        List<TagDTO> tags = tagService.findAllTags();
        return new ResponseEntity<>(tags, HttpStatus.OK);
    }

    // Obținerea unui tag după ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getTagById(@PathVariable Long id) {
        try {
            TagDTO tag = tagService.findTagById(id);
            return new ResponseEntity<>(tag, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // Obținerea unui tag după etichetă (label)
    @GetMapping("/label/{label}")
    public ResponseEntity<?> getTagByLabel(@PathVariable String label) {
        try {
            TagDTO tag = tagService.findTagByLabel(label);
            return new ResponseEntity<>(tag, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // Obținerea tag-urilor după ID-ul întrebării
    @GetMapping("/question/{questionId}")
    public ResponseEntity<List<TagDTO>> getTagsByQuestionId(@PathVariable Long questionId) {
        List<TagDTO> tags = tagService.getTagsByQuestionId(questionId);
        return new ResponseEntity<>(tags, HttpStatus.OK);
    }

    // Actualizarea unui tag
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTag(@PathVariable Long id, @RequestBody TagDTO tagDTO) {
        try {

            tagDTO.setId(id);
            TagDTO updatedTag = tagService.updateTag(tagDTO);
            return new ResponseEntity<>(updatedTag, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Ștergerea unui tag
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTag(@PathVariable Long id) {
        try {
            tagService.deleteTagById(id);
            return new ResponseEntity<>("Tag with id " + id + " was deleted successfully.", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
}

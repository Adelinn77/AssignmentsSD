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

    // Create a new tag
    @PostMapping
    public ResponseEntity<Object> addTag(@RequestBody TagDTO tagDTO) {
        try {
            TagDTO savedTag = tagService.saveTag(tagDTO);
            return new ResponseEntity<>(savedTag, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT); // 409 Conflict if it already exists
        }
    }

    // Get all tags
    @GetMapping
    public ResponseEntity<List<TagDTO>> getAllTags() {
        return ResponseEntity.ok(tagService.findAllTags());
    }

    // Get tag by label
    @GetMapping("/label/{label}")
    public ResponseEntity<Object> getTagByLabel(@PathVariable String label) {
        try {
            TagDTO tag = tagService.findTagByLabel(label);
            return new ResponseEntity<>(tag, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND); // 404 Not Found
        }
    }

    // Update a tag
    @PutMapping("/{id}")
    public ResponseEntity<Object> updateTag(@PathVariable Long id, @RequestBody TagDTO tagDTO) {
        try {
            // Synchronize the ID from the URL with the one in the request body
            tagDTO.setId(id);
            TagDTO updatedTag = tagService.updateTag(tagDTO);
            return new ResponseEntity<>(updatedTag, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST); // 400 Bad Request
        }
    }

    // Delete a tag by label
    @DeleteMapping("/label/{label}")
    public ResponseEntity<String> deleteTag(@PathVariable String label) {
        try {
            tagService.deleteTagByLabel(label);
            return new ResponseEntity<>("Tag '" + label + "' was deleted successfully.", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND); // 404 Not Found
        }
    }
}
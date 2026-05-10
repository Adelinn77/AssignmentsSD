package com.university.forum_app.service;

import com.university.forum_app.dto.TagDTO;
import com.university.forum_app.entity.Tag;
import com.university.forum_app.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;

    private TagDTO mapEntityToDTO(Tag tag) {
        return TagDTO.builder()
                .id(tag.getId())
                .label(tag.getLabel())
                .build();
    }

    private Tag mapDTOToEntity(TagDTO tagDTO) {
        return Tag.builder()
                .id(tagDTO.getId())
                .label(tagDTO.getLabel())
                .build();
    }

    @Transactional
    public TagDTO saveTag(TagDTO tagDTO) {
        Tag existingTag = tagRepository.findTagByLabel(tagDTO.getLabel());
        if (existingTag != null) {
            throw new IllegalArgumentException("Tag with label '" + tagDTO.getLabel() + "' already exists.");
        }

        Tag newTag = mapDTOToEntity(tagDTO);
        tagRepository.save(newTag);
        return mapEntityToDTO(newTag);
    }

    @Transactional(readOnly = true)
    public TagDTO findTagById(Long id) {
        Tag tag = tagRepository.findById(id).orElse(null);
        if (tag != null) {
            return mapEntityToDTO(tag);
        } else {
            throw new IllegalArgumentException("Tag with id " + id + " does not exist.");
        }
    }

    @Transactional(readOnly = true)
    public List<TagDTO> findAllTags() {
        List<Tag> tags = new ArrayList<>();
        tagRepository.findAll().forEach(tags::add);
        return tags.stream().map(this::mapEntityToDTO).toList();
    }

    @Transactional
    public TagDTO updateTag(TagDTO updatedTag) {
        if (tagRepository.existsById(updatedTag.getId())) {
            Tag existingTag = tagRepository.findTagByLabel(updatedTag.getLabel());

            // Checking if the new label is already used by ANOTHER tag (different ID)
            if (existingTag != null && !existingTag.getId().equals(updatedTag.getId())) {
                throw new IllegalArgumentException("Tag with label '" + updatedTag.getLabel() + "' already exists.");
            }

            Tag tag = mapDTOToEntity(updatedTag);
            Tag savedTag = tagRepository.save(tag);
            return mapEntityToDTO(savedTag);
        } else {
            throw new IllegalArgumentException("Tag with id " + updatedTag.getId() + " not found.");
        }
    }

    @Transactional
    public void deleteTagById(Long id) {
        if (tagRepository.existsById(id)) {
            tagRepository.deleteById(id);
        } else {
            throw new IllegalArgumentException("Tag with id " + id + " does not exist.");
        }
    }

    @Transactional(readOnly = true)
    public List<TagDTO> getTagsByQuestionId(Long questionId) {
        List<Tag> tags = tagRepository.findTagByQuestionsId(questionId);
        return tags.stream().map(this::mapEntityToDTO).toList();
    }

    @Transactional(readOnly = true)
    public TagDTO findTagByLabel(String label) {
        Tag tag = tagRepository.findTagByLabel(label);
        if (tag == null) {
            throw new IllegalArgumentException("No tag exists with label: '" + label + "'.");
        }
        return mapEntityToDTO(tag);
    }

    @Transactional
    public void deleteTagByLabel(String label) {
        Tag tag = tagRepository.findTagByLabel(label);
        if (tag != null) {
            tagRepository.delete(tag);
        } else {
            throw new IllegalArgumentException("Cannot delete. Tag with label '" + label + "' does not exist.");
        }
    }
}
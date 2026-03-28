package com.university.forum_app.service;

import com.university.forum_app.dto.TagDTO;
import com.university.forum_app.entity.Tag;
import com.university.forum_app.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class TagService {

    @Autowired
    private TagRepository tagRepository;

    private TagDTO mapEntityToDTO(Tag tag) {
        TagDTO tagDTO = new TagDTO();
        tagDTO.setId(tag.getId());
        tagDTO.setLabel(tag.getLabel());
        return tagDTO;
    }

    private Tag mapDTOToEntity(TagDTO tagDTO) {
        Tag tag = new Tag();
        tag.setId(tagDTO.getId());
        tag.setLabel(tagDTO.getLabel());
        return tag;
    }

    public TagDTO saveTag(TagDTO tagDTO) {
        Optional<Tag> existingTag = tagRepository.findByLabel(tagDTO.getLabel());
        if (existingTag.isPresent()) {
            throw new IllegalArgumentException("Tag with label '" + tagDTO.getLabel() + "' already exists.");
        }

        Tag newTag = mapDTOToEntity(tagDTO);
        tagRepository.save(newTag);
        return mapEntityToDTO(newTag);
    }

    public TagDTO findTagById(Long id) {
        if(tagRepository.existsById(id)) {
            Tag tag = tagRepository.findById(id).get();
            return mapEntityToDTO(tag);
        }
        else {
            throw new IllegalArgumentException("Tag with id " + id + " does not exist.");
        }
    }

    public List<TagDTO> findAllTags() {
        List<Tag> tags = new ArrayList<>();
        tagRepository.findAll().forEach(tags::add);
        return tags.stream().map(this::mapEntityToDTO).toList();
    }

    public TagDTO updateTag(TagDTO updatedTag) {
        if(tagRepository.existsById(updatedTag.getId())) {
            Optional<Tag> existingTag = tagRepository.findByLabel(updatedTag.getLabel());
            if (existingTag.isPresent() && !existingTag.get().getId().equals(updatedTag.getId())) {
                throw new IllegalArgumentException("Tag with label '" + updatedTag.getLabel() + "' already exists.");
            }

            Tag tag = mapDTOToEntity(updatedTag);
            Tag savedTag = tagRepository.save(tag);
            return mapEntityToDTO(savedTag);
        }
        else {
            throw new IllegalArgumentException("Tag with id: " + updatedTag.getId() + " not found.");
        }
    }

    public void deleteTagById(Long id) {
        if(tagRepository.existsById(id)){
            tagRepository.deleteById(id);
        }
        else  {
            throw new IllegalArgumentException("Tag with id: " + id + " does not exist.");
        }
    }

    public List<TagDTO> getTagsByQuestionId(Long questionId) {
        List<Tag> tags = tagRepository.findByQuestionsId(questionId);
        return tags.stream().map(this::mapEntityToDTO).toList();
    }

    public TagDTO findTagByLabel(String label) {
        Optional<Tag> tagOptional = tagRepository.findByLabel(label);
        if(tagOptional.isPresent()) {
            return mapEntityToDTO(tagOptional.get());
        }
        return null;
    }
}
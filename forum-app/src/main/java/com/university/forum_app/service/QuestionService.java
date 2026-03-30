package com.university.forum_app.service;

import com.university.forum_app.dto.QuestionDTO;
import com.university.forum_app.entity.Question;
import com.university.forum_app.entity.QuestionImage;
import com.university.forum_app.entity.Tag;
import com.university.forum_app.entity.User;
import com.university.forum_app.repository.QuestionRepository;
import com.university.forum_app.repository.TagRepository;
import com.university.forum_app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TagRepository tagRepository;

    @Value("${app.upload.dir.questions:uploads/questions}")
    private String uploadDir;

    private QuestionDTO mapEntityToDTO(Question question) {
        return QuestionDTO.builder()
                .title(question.getTitle())
                .text(question.getText())
                .date(question.getDate())
                .status(question.getStatus())
                .authorName(question.getAuthor() != null ? question.getAuthor().getUsername() : null)
                .tags(question.getTags() != null ? question.getTags().stream().map(Tag::getLabel).toList() : new ArrayList<>())
                .imageUrls(question.getImages() != null ? question.getImages().stream().map(QuestionImage::getImageUrl).toList() : new ArrayList<>())
                .answerCount(question.getAnswer() != null ? question.getAnswer().size() : 0)
                .build();
    }

    @Transactional
    public QuestionDTO saveQuestionWithImages(QuestionDTO questionDTO, List<MultipartFile> imageFiles) {
        if(questionRepository.existsByTitle(questionDTO.getTitle())) {
            throw new IllegalArgumentException("This title '" + questionDTO.getTitle() + "' is already used by another question.");
        }

        Question newQuestion = mapDTOToEntity(questionDTO);

        if (imageFiles != null && !imageFiles.isEmpty()) {
            List<QuestionImage> questionImages = new ArrayList<>();

            for (MultipartFile file : imageFiles) {
                if (!file.isEmpty()) {
                    String imageUrl = saveImageToDisk(file);

                    QuestionImage questionImage = new QuestionImage();
                    questionImage.setImageUrl(imageUrl);
                    questionImage.setQuestion(newQuestion);

                    questionImages.add(questionImage);
                }
            }
            newQuestion.setImages(questionImages);
        }

        questionRepository.save(newQuestion);
        return mapEntityToDTO(newQuestion);
    }


    private String saveImageToDisk(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String uniqueFilename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(uniqueFilename);

            Files.copy(file.getInputStream(), filePath);

            return uniqueFilename;

        } catch (IOException e) {
            throw new RuntimeException("Couldn't save image: " + e.getMessage());
        }
    }

    private Question mapDTOToEntity(QuestionDTO questionDTO) {
        User author = userRepository.findByUsername(questionDTO.getAuthorName());

        List<Tag> questionTags = new ArrayList<>();
        if (questionDTO.getTags() != null) {
            for (String tagLabel : questionDTO.getTags()) {
                Tag existingTag = tagRepository.findTagByLabel(tagLabel);
                if (existingTag != null) {
                    questionTags.add(existingTag);
                } else {
                    questionTags.add(Tag.builder().label(tagLabel).build());
                }
            }
        }

        return Question.builder()
                .title(questionDTO.getTitle())
                .text(questionDTO.getText())
                .date(questionDTO.getDate())
                .status(questionDTO.getStatus())
                .author(author)
                .tags(questionTags)
                .build();
    }

    @Transactional
    public QuestionDTO saveQuestion(QuestionDTO questionDTO) {
        if(questionRepository.existsByTitle(questionDTO.getTitle())) {
            throw new IllegalArgumentException("This title '" + questionDTO.getTitle() + "'is already used by another question.");
        }

        Question newQuestion = mapDTOToEntity(questionDTO);
        questionRepository.save(newQuestion);
        return mapEntityToDTO(newQuestion);
    }

    @Transactional(readOnly = true)
    public QuestionDTO findQuestionByTitle(String title) {
        Question question;
        try {
            question = questionRepository.findByTitle(title);
        }
        catch (Exception e) {
            throw new IllegalArgumentException("No question exists with this title: '" + title + "'.");
        }
        return mapEntityToDTO(question);
    }

    @Transactional
    public QuestionDTO updateQuestion(String currentTitle, QuestionDTO updatedQuestion) {
        Question question;
        try {
            question = questionRepository.findByTitle(currentTitle);
        }
        catch (Exception e) {
            throw new IllegalArgumentException("No question exists with this title: '" + currentTitle + "'.");
        }

        if(!currentTitle.equals(updatedQuestion.getTitle()) && questionRepository.existsByTitle(updatedQuestion.getTitle())) {
            throw new IllegalArgumentException("The new title '" + updatedQuestion.getTitle() + "' is already used by another question.");
        }

        Question mappedData = mapDTOToEntity(updatedQuestion);

        question.setTitle(mappedData.getTitle());
        question.setText(mappedData.getText());
        question.setStatus(mappedData.getStatus());
        question.setTags(mappedData.getTags());

        questionRepository.save(question);
        return mapEntityToDTO(question);
    }

    @Transactional
    public void deleteQuestionByTitle(String title) {
        if(questionRepository.existsByTitle(title)){
            questionRepository.deleteByTitle(title);
        }
        else {
            throw new IllegalArgumentException("No question exists with this title: '" + title + "'.");
        }
    }

    @Transactional(readOnly = true)
    public List<QuestionDTO> findAllQuestions() {
        List<Question> questions = new ArrayList<>();
        questionRepository.findAll().forEach(questions::add);
        return questions.stream().map(this::mapEntityToDTO).toList();
    }


}
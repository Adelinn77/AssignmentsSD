package com.university.forum_app.service;

import com.university.forum_app.dto.AnswerDTO;
import com.university.forum_app.entity.Answer;
import com.university.forum_app.entity.Question;
import com.university.forum_app.entity.User;
import com.university.forum_app.repository.AnswerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnswerService {
    @Autowired

    private AnswerRepository answerRepo;

    private AnswerDTO mapEntityToDTO(Answer answer){
        return AnswerDTO.builder()
                        .answerId((answer.getId()))
                        .questionId(answer.getQuestion().getId())
                        .userId(answer.getAuthor().getId())
                        .dateTime(answer.getDate()).build();
    }
    private Answer mapDTOToEntity(AnswerDTO answerDTO){
        return Answer.builder()
                .id(answerDTO.getAnswerId())
                .author(User.builder().id(answerDTO.getUserId()).build())
                .question(Question.builder().id(answerDTO.getQuestionId()).build())
                .date(answerDTO.getDateTime()).build();

    }

   public AnswerDTO saveAnswer(AnswerDTO answerDTO){
        Answer answer=mapDTOToEntity(answerDTO);
        Answer saved=answerRepo.save(answer);
        return mapEntityToDTO(saved);
   }
   public AnswerDTO updateAnswer(AnswerDTO updateAnswer){
        if(answerRepo.existsById(updateAnswer.getAnswerId())){
            Answer answer=mapDTOToEntity(updateAnswer);
            Answer saved=answerRepo.save(answer);
            return mapEntityToDTO(saved);

        }
        else{
            throw new IllegalArgumentException("Answer with if"+updateAnswer.getAnswerId()+"not found");
        }
   }

   public void deleteAnswerById(Long id){
        if(answerRepo.existsById(id)){
            answerRepo.deleteById(id);
        }else{
            throw new IllegalArgumentException("Answer with id"+id+"does not exists");
        }
   }

   public AnswerDTO fndAnswerByAnswerId(Long id){
        if(answerRepo.existsById(id)){
            Answer answer=answerRepo.findById(id).get();
            return mapEntityToDTO(answer);
        }
        else{
            throw new IllegalArgumentException("Answer with id"+id+"does not exists");
        }
   }
    public List<AnswerDTO> findAnswerByAuthorId(Long userId){
        List<Answer> answers = answerRepo.findByAuthorId(userId);
        return answers.stream().map(this::mapEntityToDTO).toList();
    }

    public List<AnswerDTO> findAnswerByQuestionId(Long questionId){
        List<Answer> answers = answerRepo.findByQuestionId(questionId);
        return answers.stream().map(this::mapEntityToDTO).toList();
    }
    public List<AnswerDTO> findAllAnswersforAUser(Long userId){
        List<Answer> answers = answerRepo.findByAuthorId(userId);
        return answers.stream().map(this::mapEntityToDTO).toList();
    }
    public List<AnswerDTO> findAllAnswersForAQuestion(Long questionId){
        List<Answer> answers = answerRepo.findByQuestionId(questionId);
        return answers.stream().map(this::mapEntityToDTO).toList();
    }
}

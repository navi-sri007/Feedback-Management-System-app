package com.examly.springapp.service;

import com.examly.springapp.model.Feedback;
import com.examly.springapp.model.FeedbackStatus;
import com.examly.springapp.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    @Autowired
    private FeedbackRepository repository;

    @Override
    public Feedback saveFeedback(Feedback feedback) {
        feedback.setStatus(FeedbackStatus.PENDING);
        feedback.setCreatedAt(LocalDateTime.now());
        return repository.save(feedback);
    }

    @Override
    public List<Feedback> getUserFeedback(String userId) {
        return repository.findByUserId(userId);
    }

    @Override
    public List<Feedback> getAllFeedback() {
        return repository.findAll();
    }
}
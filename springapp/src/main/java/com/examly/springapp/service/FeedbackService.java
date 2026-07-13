package com.examly.springapp.service;

import com.examly.springapp.model.Feedback;

import java.util.List;

public interface FeedbackService {

    Feedback saveFeedback(Feedback feedback);

    List<Feedback> getUserFeedback(String userId);

    List<Feedback> getAllFeedback();
}
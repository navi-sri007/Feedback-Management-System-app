package com.examly.springapp.service.interfaces;  // ← Notice the package

import com.examly.springapp.model.Feedback;
import com.examly.springapp.model.FeedbackStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FeedbackService {
    Feedback submitFeedback(Feedback feedback);
    Page<Feedback> getAllFeedback(Pageable pageable);
    Feedback getFeedbackById(Long id);
    Feedback updateFeedbackStatus(Long id, FeedbackStatus status, Long adminId);
    Feedback updateFeedback(Long id, Feedback feedback, Long adminId);
    void deleteFeedback(Long id, Long adminId);
    Page<Feedback> getFeedbackByStatus(FeedbackStatus status, Pageable pageable);
    Page<Feedback> searchFeedback(String search, Pageable pageable);
    Page<Feedback> getFeedbackByCategory(Long categoryId, Pageable pageable);
    List<Feedback> getRecentFeedback(int limit);
}
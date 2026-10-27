package com.examly.springapp.service.interfaces;

import com.examly.springapp.model.Feedback;

public interface NotificationService {
    void sendNewFeedbackNotification(Feedback feedback);
}
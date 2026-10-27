package com.examly.springapp.service.impl;

import com.examly.springapp.model.Feedback;
import com.examly.springapp.service.interfaces.AdminService;
import com.examly.springapp.service.interfaces.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private AdminService adminService;

    @Override
    public void sendNewFeedbackNotification(Feedback feedback) {
        try {
            if (mailSender == null) {
                System.out.println("Mail sender not configured. Skipping email notification.");
                return;
            }

            String adminEmail = adminService.getAdminEmail();
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(adminEmail);
            message.setSubject("New Feedback Received");
            message.setText(String.format(
                    "A new feedback has been submitted:\n\n" +
                    "Name: %s\n" +
                    "Email: %s\n" +
                    "Rating: %d\n" +
                    "Feedback: %s\n\n" +
                    "Please log in to the admin panel to review and manage this feedback.",
                    feedback.getSubmitterName() != null ? feedback.getSubmitterName() : "Anonymous",
                    feedback.getSubmitterEmail(),
                    feedback.getRating() != null ? feedback.getRating() : 0,
                    feedback.getFeedbackContent()
            ));
            
            mailSender.send(message);
            System.out.println("Email notification sent to: " + adminEmail);
            
        } catch (Exception e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
        }
    }
}
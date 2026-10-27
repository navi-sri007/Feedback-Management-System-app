package com.examly.springapp.service.impl;

import com.examly.springapp.dto.DashboardSummary;
import com.examly.springapp.model.FeedbackStatus;
import com.examly.springapp.repository.FeedbackRepository;
import com.examly.springapp.service.interfaces.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Override
    public DashboardSummary getDashboardSummary() {
        DashboardSummary summary = new DashboardSummary();
        
        // 1. Total feedback
        summary.setTotalFeedback(feedbackRepository.count());
        
        // 2. Status breakdown
        Map<FeedbackStatus, Long> statusBreakdown = new HashMap<>();
        for (FeedbackStatus status : FeedbackStatus.values()) {
            long count = feedbackRepository.countByStatus(status);
            statusBreakdown.put(status, count);
        }
        summary.setStatusBreakdown(statusBreakdown);
        
        // 3. Average rating
        Double avgRating = feedbackRepository.calculateAverageRating();
        summary.setAverageRating(avgRating != null ? avgRating : 0.0);
        
        // 4. New feedback count
        summary.setNewFeedbackCount(feedbackRepository.countByStatus(FeedbackStatus.NEW));
        
     
        Map<String, Long> categoryDistribution = getCategoryDistribution();
        summary.setCategoryDistribution(categoryDistribution);
        
        return summary;
    }

    // ✅ NEW METHOD: Get category distribution
    private Map<String, Long> getCategoryDistribution() {
        Map<String, Long> categoryDistribution = new HashMap<>();
        
        try {
            List<Object[]> results = feedbackRepository.countGroupedByCategory();
            
            for (Object[] result : results) {
                String categoryName = (String) result[0];
                Long count = (Long) result[1];
                categoryDistribution.put(categoryName, count);
            }
        } catch (Exception e) {
            // If no categories exist or query fails, return empty map
            System.err.println("Error getting category distribution: " + e.getMessage());
        }
        
        return categoryDistribution;
    }
}
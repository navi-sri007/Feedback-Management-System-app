package com.examly.springapp.dto;

import java.util.Map;  // ← Make sure this import exists

import com.examly.springapp.model.FeedbackStatus;

public class DashboardSummary {
    private long totalFeedback;
    private Map<FeedbackStatus, Long> statusBreakdown;
    private double averageRating;
    private Map<String, Long> categoryDistribution;
    private long newFeedbackCount;

    // Getters and Setters
    public long getTotalFeedback() { return totalFeedback; }
    public void setTotalFeedback(long totalFeedback) { this.totalFeedback = totalFeedback; }

    public Map<FeedbackStatus, Long> getStatusBreakdown() { return statusBreakdown; }
    public void setStatusBreakdown(Map<FeedbackStatus, Long> statusBreakdown) { this.statusBreakdown = statusBreakdown; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public Map<String, Long> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(Map<String, Long> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

    public long getNewFeedbackCount() { return newFeedbackCount; }
    public void setNewFeedbackCount(long newFeedbackCount) { this.newFeedbackCount = newFeedbackCount; }
}
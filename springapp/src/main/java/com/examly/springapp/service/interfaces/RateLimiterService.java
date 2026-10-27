package com.examly.springapp.service.interfaces;

public interface RateLimiterService {
    boolean isAllowed(String clientIp);
}
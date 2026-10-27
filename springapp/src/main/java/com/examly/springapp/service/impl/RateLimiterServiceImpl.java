package com.examly.springapp.service.impl;

import com.examly.springapp.service.interfaces.RateLimiterService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RateLimiterServiceImpl implements RateLimiterService {

    @Value("${rate.limit.requests:5}")
    private int maxRequests;

    @Value("${rate.limit.duration:60}")
    private int durationSeconds;

    private final ConcurrentHashMap<String, RateLimitInfo> requestCounts = new ConcurrentHashMap<>();

    @Override
    public boolean isAllowed(String clientIp) {
        long currentTime = System.currentTimeMillis() / 1000;
        
        RateLimitInfo info = requestCounts.computeIfAbsent(clientIp, 
                k -> new RateLimitInfo(currentTime, new AtomicInteger(0)));
        
        // Reset if expired
        if (currentTime - info.getStartTime() > durationSeconds) {
            info.setStartTime(currentTime);
            info.getCount().set(0);
        }
        
        int currentCount = info.getCount().incrementAndGet();
        return currentCount <= maxRequests;
    }

    private static class RateLimitInfo {
        private long startTime;
        private final AtomicInteger count;

        public RateLimitInfo(long startTime, AtomicInteger count) {
            this.startTime = startTime;
            this.count = count;
        }

        public long getStartTime() { return startTime; }
        public void setStartTime(long startTime) { this.startTime = startTime; }
        public AtomicInteger getCount() { return count; }
    }
}
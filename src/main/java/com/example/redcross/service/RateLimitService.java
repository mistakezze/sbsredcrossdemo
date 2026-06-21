package com.example.redcross.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Deque;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;

/**
 * 非常简单的滑动窗口限流：
 * 每个 IP 每 60 秒内最多调用 N 次 AI 接口
 */
@Service
public class RateLimitService {

    @Value("${app.rate-limit.requests-per-minute:10}")
    private int requestsPerMinute;

    private static final long WINDOW_MS = 60_000L;

    private final Map<String, Deque<Long>> timestampsByIp = new HashMap<>();

    public synchronized boolean allow(String ip) {
        long now = System.currentTimeMillis();
        Deque<Long> q = timestampsByIp.computeIfAbsent(ip, k -> new LinkedList<>());

        // 移除窗口外的时间戳
        while (!q.isEmpty() && now - q.peekFirst() > WINDOW_MS) {
            q.pollFirst();
        }

        if (q.size() < requestsPerMinute) {
            q.offerLast(now);
            return true;
        }
        return false;
    }

    public synchronized int remaining(String ip) {
        long now = System.currentTimeMillis();
        Deque<Long> q = timestampsByIp.get(ip);
        if (q == null) return requestsPerMinute;
        while (!q.isEmpty() && now - q.peekFirst() > WINDOW_MS) {
            q.pollFirst();
        }
        return Math.max(0, requestsPerMinute - q.size());
    }
}

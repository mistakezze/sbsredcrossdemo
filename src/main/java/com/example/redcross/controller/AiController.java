package com.example.redcross.controller;

import com.example.redcross.dto.AiRouteRequest;
import com.example.redcross.dto.AiRouteResponse;
import com.example.redcross.service.DeepSeekService;
import com.example.redcross.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AI 路线推荐接口
 * 前端通过该接口调用，由后端代理访问 DeepSeek，避免在浏览器暴露 API Key
 */
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private static final Logger logger = LoggerFactory.getLogger(AiController.class);

    private final DeepSeekService deepSeekService;
    private final RateLimitService rateLimitService;

    public AiController(DeepSeekService deepSeekService, RateLimitService rateLimitService) {
        this.deepSeekService = deepSeekService;
        this.rateLimitService = rateLimitService;
    }

    /**
     * 生成红十字文化游览路线
     * POST /api/ai/route
     */
    @PostMapping(value = "/route", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> generateRoute(
            @RequestBody AiRouteRequest request,
            HttpServletRequest httpRequest) {

        // 限流检查
        String clientIp = resolveIp(httpRequest);
        if (!rateLimitService.allow(clientIp)) {
            logger.warn("IP [{}] 触发限流", clientIp);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(Map.of(
                    "error", "请求过于频繁，请稍后再试",
                    "rateLimit", "每 60 秒最多 " + rateLimitLimit(request) + " 次",
                    "remaining", rateLimitService.remaining(clientIp)
                ));
        }

        logger.info("AI 路线请求: IP={}, question={}", clientIp, request.getQuestion());
        AiRouteResponse response = deepSeekService.generateRoute(
            request.getQuestion(),
            request.getLocations()
        );

        if (response.getErrorMessage() != null) {
            logger.warn("AI 路线请求返回(含错误信息): {}", response.getErrorMessage());
        }
        return ResponseEntity.ok(response);
    }

    /** 健康检查 & 状态查询 */
    @GetMapping("/status")
    public ResponseEntity<?> status(HttpServletRequest httpRequest) {
        String clientIp = resolveIp(httpRequest);
        return ResponseEntity.ok(Map.of(
            "ok", true,
            "remainingInWindow", rateLimitService.remaining(clientIp),
            "ip", clientIp
        ));
    }

    private String resolveIp(HttpServletRequest req) {
        String xf = req.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return req.getRemoteAddr();
    }

    // 仅用于错误提示，不参与限流逻辑
    private int rateLimitLimit(AiRouteRequest ignored) { return 10; }
}

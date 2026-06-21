package com.example.redcross.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * RestTemplate 配置，主要用于调用 DeepSeek API
 */
@Configuration
public class RestTemplateConfig {

    @Value("${deepseek.api.timeout-seconds:30}")
    private int timeoutSeconds;

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        int ms = timeoutSeconds * 1000;
        factory.setConnectTimeout(ms);
        factory.setReadTimeout(ms);
        return new RestTemplate(factory);
    }
}

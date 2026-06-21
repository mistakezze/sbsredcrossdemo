package com.example.redcross.deepseek;

import java.util.List;
import java.util.Map;

/**
 * DeepSeek Chat API 请求体
 * 参考：https://api.deepseek.com/chat/completions
 */
public class DeepSeekRequest {

    private String model;
    private List<Message> messages;
    private double temperature;
    private Map<String, Object> responseFormat;

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }

    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }

    public Map<String, Object> getResponseFormat() { return responseFormat; }
    public void setResponseFormat(Map<String, Object> responseFormat) { this.responseFormat = responseFormat; }

    /**
     * 单条对话消息
     */
    public static class Message {
        private String role;
        private String content;

        public Message() {}

        public Message(String role, String content) {
            this.role = role;
            this.content = content;
        }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}

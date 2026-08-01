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

    /** 频率惩罚，>0 降低重复 token 的出现概率，取值范围 [-2, 2] */
    private Double frequencyPenalty;

    /** 主题惩罚，>0 鼓励模型引入新主题，取值范围 [-2, 2] */
    private Double presencePenalty;

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }

    public double getTemperature() { return temperature; }
    public void setTemperature(double temperature) { this.temperature = temperature; }

    public Map<String, Object> getResponseFormat() { return responseFormat; }
    public void setResponseFormat(Map<String, Object> responseFormat) { this.responseFormat = responseFormat; }

    public Double getFrequencyPenalty() { return frequencyPenalty; }
    public void setFrequencyPenalty(Double frequencyPenalty) { this.frequencyPenalty = frequencyPenalty; }

    public Double getPresencePenalty() { return presencePenalty; }
    public void setPresencePenalty(Double presencePenalty) { this.presencePenalty = presencePenalty; }

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

package com.example.redcross.deepseek;

import java.util.List;

/**
 * DeepSeek Chat API 响应体（精简版，只解析我们需要的字段）
 */
public class DeepSeekResponse {

    private List<Choice> choices;
    private String model;
    private Usage usage;

    public List<Choice> getChoices() { return choices; }
    public void setChoices(List<Choice> choices) { this.choices = choices; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Usage getUsage() { return usage; }
    public void setUsage(Usage usage) { this.usage = usage; }

    public static class Choice {
        private int index;
        private Message message;

        public int getIndex() { return index; }
        public void setIndex(int index) { this.index = index; }

        public Message getMessage() { return message; }
        public void setMessage(Message message) { this.message = message; }
    }

    public static class Message {
        private String role;
        private String content;

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class Usage {
        private int promptTokens;
        private int completionTokens;
        private int totalTokens;

        public int getPromptTokens() { return promptTokens; }
        public void setPromptTokens(int promptTokens) { this.promptTokens = promptTokens; }

        public int getCompletionTokens() { return completionTokens; }
        public void setCompletionTokens(int completionTokens) { this.completionTokens = completionTokens; }

        public int getTotalTokens() { return totalTokens; }
        public void setTotalTokens(int totalTokens) { this.totalTokens = totalTokens; }
    }
}

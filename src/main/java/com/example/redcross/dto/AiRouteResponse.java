package com.example.redcross.dto;

import java.util.List;

/**
 * 后端返回给前端的 AI 路线推荐结果
 */
public class AiRouteResponse {

    /** 原始问题 */
    private String question;

    /** 路线步骤列表 */
    private List<RouteStep> steps;

    /** 路线要点总结 */
    private List<String> summary;

    /** 是否来自 mock 数据（未配置 API Key 或调用失败时为 true） */
    private boolean mocked;

    /** 当调用失败时的错误信息（可选） */
    private String errorMessage;

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public List<RouteStep> getSteps() { return steps; }
    public void setSteps(List<RouteStep> steps) { this.steps = steps; }

    public List<String> getSummary() { return summary; }
    public void setSummary(List<String> summary) { this.summary = summary; }

    public boolean isMocked() { return mocked; }
    public void setMocked(boolean mocked) { this.mocked = mocked; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}

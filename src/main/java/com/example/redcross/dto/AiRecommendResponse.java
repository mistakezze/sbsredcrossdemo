package com.example.redcross.dto;

import java.util.List;

/**
 * 后端返回给前端的 AI 地点推荐结果
 */
public class AiRecommendResponse {

    /** 本次推荐的整体思路（一句话到一段话） */
    private String summary;

    /** 推荐地点列表 */
    private List<PlaceRecommendation> recommendations;

    /** 是否来自 mock 数据 */
    private boolean mocked;

    /** 调用失败时的错误信息 */
    private String errorMessage;

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<PlaceRecommendation> getRecommendations() { return recommendations; }
    public void setRecommendations(List<PlaceRecommendation> recommendations) { this.recommendations = recommendations; }

    public boolean isMocked() { return mocked; }
    public void setMocked(boolean mocked) { this.mocked = mocked; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}

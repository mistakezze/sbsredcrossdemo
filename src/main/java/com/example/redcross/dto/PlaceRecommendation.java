package com.example.redcross.dto;

/**
 * AI 推荐的单个地点
 */
public class PlaceRecommendation {

    /** 地点全称，必须与候选列表完全一致 */
    private String name;

    /** 类别 */
    private String category;

    /** 为什么推荐给这位用户（结合其打卡历史与偏好） */
    private String reason;

    /** 最值得做的一件事 */
    private String highlight;

    /** 建议到访时间与理由 */
    private String bestTime;

    /** 一条实用提示 */
    private String tip;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getHighlight() { return highlight; }
    public void setHighlight(String highlight) { this.highlight = highlight; }

    public String getBestTime() { return bestTime; }
    public void setBestTime(String bestTime) { this.bestTime = bestTime; }

    public String getTip() { return tip; }
    public void setTip(String tip) { this.tip = tip; }
}

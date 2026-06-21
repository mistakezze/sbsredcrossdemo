package com.example.redcross.dto;

import java.util.List;

/**
 * 前端请求体：用户问题 + 可选的红十字地点信息
 */
public class AiRouteRequest {

    /** 用户输入的问题文本（例如："半天能走完的精华路线） */
    private String question;

    /** 当前系统中可用的红十字地点列表 */
    private List<LocationItem> locations;

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public List<LocationItem> getLocations() { return locations; }
    public void setLocations(List<LocationItem> locations) { this.locations = locations; }
}

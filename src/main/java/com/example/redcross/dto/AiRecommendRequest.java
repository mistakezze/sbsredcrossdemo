package com.example.redcross.dto;

import java.util.List;

/**
 * 前端请求体：用户画像 + 候选地点 + 可选偏好描述
 */
public class AiRecommendRequest {

    /** 用户额外输入的偏好描述（可为空） */
    private String preference;

    /** 已打卡地点的类别 */
    private List<String> checkedCategories;

    /** 给出 4 星以上评价的地点的类别 */
    private List<String> likedCategories;

    /** 已打卡过的地点名称 */
    private List<String> checkedNames;

    /** 候选地点列表 */
    private List<LocationItem> locations;

    public String getPreference() { return preference; }
    public void setPreference(String preference) { this.preference = preference; }

    public List<String> getCheckedCategories() { return checkedCategories; }
    public void setCheckedCategories(List<String> checkedCategories) { this.checkedCategories = checkedCategories; }

    public List<String> getLikedCategories() { return likedCategories; }
    public void setLikedCategories(List<String> likedCategories) { this.likedCategories = likedCategories; }

    public List<String> getCheckedNames() { return checkedNames; }
    public void setCheckedNames(List<String> checkedNames) { this.checkedNames = checkedNames; }

    public List<LocationItem> getLocations() { return locations; }
    public void setLocations(List<LocationItem> locations) { this.locations = locations; }
}

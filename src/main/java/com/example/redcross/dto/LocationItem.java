package com.example.redcross.dto;

/**
 * 红十字地点信息，用于发送给 AI 做路线推荐
 */
public class LocationItem {

    private String name;
    private String category;
    private String location;
    private String description;

    public LocationItem() {}

    public LocationItem(String name, String category, String location, String description) {
        this.name = name;
        this.category = category;
        this.location = location;
        this.description = description;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

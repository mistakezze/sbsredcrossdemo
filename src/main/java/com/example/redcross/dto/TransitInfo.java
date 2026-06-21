package com.example.redcross.dto;

/**
 * 交通路线信息（从一地点到下一地点的交通方式，含费用和时间）
 */
public class TransitInfo {

    private String fromPrev;
    private String routeHint;
    private String mode;

    /** 预估交通费用，例如"约3元（地铁）" */
    private String cost;

    /** 预估交通时间，例如"约25分钟" */
    private String duration;

    public String getFromPrev() { return fromPrev; }
    public void setFromPrev(String fromPrev) { this.fromPrev = fromPrev; }

    public String getRouteHint() { return routeHint; }
    public void setRouteHint(String routeHint) { this.routeHint = routeHint; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getCost() { return cost; }
    public void setCost(String cost) { this.cost = cost; }

    public String getDuration() { return duration; }
    public void setDuration(String duration) { this.duration = duration; }
}

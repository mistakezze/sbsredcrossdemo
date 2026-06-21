package com.example.redcross.dto;

import java.util.List;

/**
 * 路线步骤（详细版：名称 / 简介 / 历史 / 亮点 / 餐饮 / 打卡点 / 交通 / 实用贴士）
 */
public class RouteStep {

    private String name;
    private String meta;
    private String desc;
    private List<String> tips;
    private TransitInfo transit;

    // ============ 新增详细字段 ============
    /** 最佳游览时间，例如"建议上午9:00-11:00，周末人流较大" */
    private String bestTime;

    /** 门票/预约信息，例如"免费，需提前在公众号预约" */
    private String ticket;

    /** 参观亮点列表，例如["中国最早的急救车实物展示","AR互动体验区"] */
    private List<String> highlights;

    /** 简短历史故事，1-2句话，例如"1949年上海解放后首任会长由陈毅市长兼任" */
    private String history;

    /** 附近餐饮推荐，例如"出门右转200米有沪上知名本帮菜馆光明邨" */
    private String nearbyFood;

    /** 拍照打卡点，例如["馆前广场的红十字主题雕塑","二楼临展互动区"] */
    private List<String> photoSpots;

    /** 实用贴士，比 tips 更详细，例如["周边停车困难，建议地铁出行","有免费寄存行李服务"] */
    private List<String> practicalTips;

    // ============ 原有 getter/setter ============
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMeta() { return meta; }
    public void setMeta(String meta) { this.meta = meta; }

    public String getDesc() { return desc; }
    public void setDesc(String desc) { this.desc = desc; }

    public List<String> getTips() { return tips; }
    public void setTips(List<String> tips) { this.tips = tips; }

    public TransitInfo getTransit() { return transit; }
    public void setTransit(TransitInfo transit) { this.transit = transit; }

    // ============ 新增 getter/setter ============
    public String getBestTime() { return bestTime; }
    public void setBestTime(String bestTime) { this.bestTime = bestTime; }

    public String getTicket() { return ticket; }
    public void setTicket(String ticket) { this.ticket = ticket; }

    public List<String> getHighlights() { return highlights; }
    public void setHighlights(List<String> highlights) { this.highlights = highlights; }

    public String getHistory() { return history; }
    public void setHistory(String history) { this.history = history; }

    public String getNearbyFood() { return nearbyFood; }
    public void setNearbyFood(String nearbyFood) { this.nearbyFood = nearbyFood; }

    public List<String> getPhotoSpots() { return photoSpots; }
    public void setPhotoSpots(List<String> photoSpots) { this.photoSpots = photoSpots; }

    public List<String> getPracticalTips() { return practicalTips; }
    public void setPracticalTips(List<String> practicalTips) { this.practicalTips = practicalTips; }
}

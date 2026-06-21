package com.example.redcross.service;

import com.example.redcross.dto.*;
import com.example.redcross.deepseek.DeepSeekRequest;
import com.example.redcross.deepseek.DeepSeekResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

/**
 * 调用 DeepSeek API 生成红十字文化游览路线
 * 若未配置 API Key，则自动降级为本地 mock 数据
 */
@Service
public class DeepSeekService {

    private static final Logger logger = LoggerFactory.getLogger(DeepSeekService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${deepseek.api.key:}")
    private String apiKey;

    @Value("${deepseek.api.url:https://api.deepseek.com/chat/completions}")
    private String apiUrl;

    @Value("${deepseek.api.model:deepseek-v4-pro}")
    private String model;

    public DeepSeekService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * 生成游览路线
     * @param question 用户的问题/需求
     * @param locations 可用的红十字地点列表（若为空则使用内置默认列表）
     * @return 结构化的游览路线
     */
    public AiRouteResponse generateRoute(String question, List<LocationItem> locations) {
        if (question == null || question.trim().isEmpty()) {
            question = "请推荐一条适合的路线";
        }

        // 若没有传入地点列表，使用内置的上海红十字地点（兜底用，前端通常会传入）
        if (locations == null || locations.isEmpty()) {
            locations = defaultLocations();
        }

        AiRouteResponse response = new AiRouteResponse();
        response.setQuestion(question);

        // 若未配置 API Key，直接使用 mock
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.trim().equals("${DEEPSEEK_API_KEY:}")) {
            logger.info("DeepSeek API Key 未配置，使用本地 mock 数据");
            response.setSteps(generateMockSteps(locations));
            response.setSummary(generateMockSummary());
            response.setMocked(true);
            return response;
        }

        // 真实调用 DeepSeek
        try {
            String prompt = buildPrompt(question, locations);
            DeepSeekRequest request = new DeepSeekRequest();
            request.setModel(model);
            request.setTemperature(0.7);
            request.setMessages(List.of(
                new DeepSeekRequest.Message("system", "你是一名严谨的上海红十字文化导游，必须根据下方提供的真实地点生成路线，绝对不能编造不存在的地点或交通方式。"),
                new DeepSeekRequest.Message("user", prompt)
            ));
            // 让 DeepSeek 返回 JSON
            request.setResponseFormat(Map.of("type", "json_object"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey.trim());

            HttpEntity<DeepSeekRequest> entity = new HttpEntity<>(request, headers);

            logger.info("调用 DeepSeek API: {}", apiUrl);
            ResponseEntity<DeepSeekResponse> resp = restTemplate.exchange(
                apiUrl, HttpMethod.POST, entity, DeepSeekResponse.class);

            DeepSeekResponse ds = resp.getBody();
            String content = "";
            if (ds != null && ds.getChoices() != null && !ds.getChoices().isEmpty()) {
                content = ds.getChoices().get(0).getMessage().getContent();
            }

            // 解析 JSON 响应
            AiRouteResponse parsed = parseJsonResponse(content);
            parsed.setQuestion(question);
            return parsed;

        } catch (HttpClientErrorException e) {
            logger.error("DeepSeek API 返回错误: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            response.setSteps(generateMockSteps(locations));
            response.setSummary(generateMockSummary());
            response.setMocked(true);
            response.setErrorMessage("调用 DeepSeek 失败（" + e.getStatusCode() + "），已降级为本地推荐");
            return response;
        } catch (Exception e) {
            logger.error("调用 DeepSeek API 异常: {}", e.getMessage(), e);
            response.setSteps(generateMockSteps(locations));
            response.setSummary(generateMockSummary());
            response.setMocked(true);
            response.setErrorMessage("调用 DeepSeek 异常：" + e.getMessage());
            return response;
        }
    }

    // ============ Prompt 构建（详细版） ============
    private String buildPrompt(String question, List<LocationItem> locations) {
        StringBuilder sb = new StringBuilder();

        // 第一部分：地点数据库
        sb.append("【地点数据库】以下是系统中唯一可用的上海红十字文化地点，请从这些地点中选择组成路线，绝对不能编造或修改地点名称。\n\n");
        for (int i = 0; i < locations.size(); i++) {
            LocationItem loc = locations.get(i);
            sb.append("【地点").append(i + 1).append("】").append(loc.getName()).append("\n");
            sb.append("  所在区域：").append(loc.getLocation()).append("\n");
            sb.append("  类别：").append(loc.getCategory()).append("\n");
            sb.append("  简介：").append(loc.getDescription()).append("\n\n");
        }

        // 第二部分：用户需求
        sb.append("【用户需求】\"").append(question).append("\"\n\n");

        // 第三部分：输出要求（超级详细）
        sb.append("请为用户生成一份详尽的专业游览方案，必须严格按照以下 JSON 格式返回，只返回 JSON，不要任何解释文字：\n\n");
        sb.append("{\n");
        sb.append("  \"steps\": [\n");
        sb.append("    {\n");
        sb.append("      \"name\": \"地点全称（必须与上方数据库中的名称完全一致）\",\n");
        sb.append("      \"meta\": \"简短标签，例如：'博物馆 · 约2小时'、'机构 · 约1.5小时'\",\n");
        sb.append("      \"desc\": \"3-5句话，详细说明该站点在路线中的角色定位、参观价值、核心理由。必须基于上方数据库中的简介展开，不可编造数据。\",\n");
        sb.append("      \"history\": \"1-2句简短历史故事或背景（例如：'成立于1932年，是全国最早的红十字分支机构之一'），必须基于真实历史。\",\n");
        sb.append("      \"bestTime\": \"最佳游览时间段及理由（例如：'建议工作日上午9:00-11:00，此时团队参观较少，可安静参观'）\",\n");
        sb.append("      \"ticket\": \"门票和预约信息（例如：'免费开放，需提前3天在【上海市红十字会】公众号预约；每周一闭馆'）\",\n");
        sb.append("      \"highlights\": [\"亮点1\", \"亮点2\", \"亮点3\", \"亮点4\"],\n");
        sb.append("      \"photoSpots\": [\"打卡点1\", \"打卡点2\", \"打卡点3\"],\n");
        sb.append("      \"nearbyFood\": \"附近餐饮推荐（具体到街名或商场名，例如：'出门左转200米淮海中路有光明邨大酒家，招牌蟹粉小笼约68元；H5商场B1层有实惠的工作套餐约35元'）\",\n");
        sb.append("      \"practicalTips\": [\"实用贴士1（如：停车不便，建议地铁）\", \"实用贴士2（如：有免费行李寄存）\", \"实用贴士3（如：馆内设无障碍通道）\"],\n");
        sb.append("      \"tips\": [\"快速贴士1\", \"快速贴士2\"],\n");
        sb.append("      \"transit\": {\n");
        sb.append("        \"fromPrev\": \"从上一站到本站的完整交通描述（例如：'地铁1号线人民广场站→黄陂南路站，2站约8分钟，出站步行5分钟'）\",\n");
        sb.append("        \"routeHint\": \"出站后如何步行到达（例如：'从7号口出，沿西藏中路向北步行约300米，左转进入淮海中路'）\",\n");
        sb.append("        \"mode\": \"walk / subway / bus / taxi 四选一\",\n");
        sb.append("        \"cost\": \"预估费用（例如：'约4元（地铁）'、'约25元（出租车）'、'步行0元'）\",\n");
        sb.append("        \"duration\": \"预估时长（例如：'约25分钟'、'约15分钟步行'）\"\n");
        sb.append("      }\n");
        sb.append("    }\n");
        sb.append("  ],\n");
        sb.append("  \"summary\": [\"路线亮点总结1（30字以内）\", \"路线亮点总结2（30字以内）\", \"路线亮点总结3（30字以内）\"]\n");
        sb.append("}\n\n");

        // 第四部分：硬性约束
        sb.append("【硬性规则，必须遵守】\n");
        sb.append("1. steps 数量控制在 3-6 个，根据用户问题中的时间/兴趣偏好选择合适的数量。\n");
        sb.append("2. name 必须与【地点数据库】中的名称完全一致，不得修改、不得编造。\n");
        sb.append("3. desc 必须基于【地点数据库】中的简介展开，每条 desc 不低于 3 句话。\n");
        sb.append("4. history、nearbyFood、bestTime 必须真实合理，不得编造门牌号、具体餐厅名称（使用'XX路'等模糊描述即可）或闭馆日。\n");
        sb.append("5. transit 只能使用 walk / subway / bus / taxi 四种模式，不得出现机场、火车、高铁等。\n");
        sb.append("6. transit 的 routeHint 基于行政区做合理推断（相邻行政区用'步行5-10分钟'，跨区用'地铁1-3站+步行'），不要编造具体站名。\n");
        sb.append("7. 返回的必须是合法 JSON，不要有任何额外文字。\n");

        return sb.toString();
    }

    // ============ 解析 DeepSeek JSON 响应（详细版） ============
    @SuppressWarnings("unchecked")
    private AiRouteResponse parseJsonResponse(String content) {
        AiRouteResponse result = new AiRouteResponse();
        try {
            JsonNode root = objectMapper.readTree(content);
            JsonNode stepsNode = root.get("steps");
            JsonNode summaryNode = root.get("summary");

            List<RouteStep> stepList = new ArrayList<>();
            if (stepsNode != null && stepsNode.isArray()) {
                for (JsonNode s : stepsNode) {
                    RouteStep step = new RouteStep();
                    step.setName(textOrEmpty(s, "name"));
                    step.setMeta(textOrEmpty(s, "meta"));
                    step.setDesc(textOrEmpty(s, "desc"));
                    step.setHistory(textOrEmpty(s, "history"));
                    step.setBestTime(textOrEmpty(s, "bestTime"));
                    step.setTicket(textOrEmpty(s, "ticket"));
                    step.setNearbyFood(textOrEmpty(s, "nearbyFood"));

                    // highlights
                    step.setHighlights(jsonArrayToList(s.get("highlights")));
                    // photoSpots
                    step.setPhotoSpots(jsonArrayToList(s.get("photoSpots")));
                    // practicalTips
                    step.setPracticalTips(jsonArrayToList(s.get("practicalTips")));
                    // tips（快速贴士，兼容旧字段）
                    JsonNode tipsNode = s.get("tips");
                    if (tipsNode != null && tipsNode.isArray()) {
                        List<String> tips = new ArrayList<>();
                        for (JsonNode t : tipsNode) tips.add(t.asText());
                        step.setTips(tips);
                    }

                    // transit
                    JsonNode transitNode = s.get("transit");
                    if (transitNode != null) {
                        TransitInfo ti = new TransitInfo();
                        ti.setFromPrev(textOrEmpty(transitNode, "fromPrev"));
                        ti.setRouteHint(textOrEmpty(transitNode, "routeHint"));
                        ti.setMode(textOrEmpty(transitNode, "mode"));
                        ti.setCost(textOrEmpty(transitNode, "cost"));
                        ti.setDuration(textOrEmpty(transitNode, "duration"));
                        step.setTransit(ti);
                    }
                    stepList.add(step);
                }
            }

            List<String> summaryList = new ArrayList<>();
            if (summaryNode != null && summaryNode.isArray()) {
                for (JsonNode s : summaryNode) summaryList.add(s.asText());
            }

            result.setSteps(stepList);
            result.setSummary(summaryList);
            result.setMocked(false);
            logger.info("解析成功：{} 个步骤，{} 条要点", stepList.size(), summaryList.size());
        } catch (Exception e) {
            logger.error("解析 DeepSeek JSON 响应失败，回退为 mock 数据: {}", e.getMessage());
            result.setSteps(generateMockSteps(defaultLocations()));
            result.setSummary(generateMockSummary());
            result.setMocked(true);
            result.setErrorMessage("AI 返回的 JSON 解析失败，已降级为本地推荐");
        }
        return result;
    }

    private List<String> jsonArrayToList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode n : node) list.add(n.asText());
        }
        return list;
    }

    private String textOrEmpty(JsonNode node, String field) {
        JsonNode v = node.get(field);
        return (v != null && !v.isNull()) ? v.asText("") : "";
    }

    // ============ Mock 数据（详细版，未配置 API Key 或调用失败时使用） ============
    private List<RouteStep> generateMockSteps(List<LocationItem> locations) {
        List<RouteStep> steps = new ArrayList<>();
        int take = Math.min(locations.size(), 5);
        String[] modes = {"subway", "walk", "bus", "taxi", "walk"};

        for (int i = 0; i < take; i++) {
            LocationItem loc = locations.get(i);
            RouteStep step = new RouteStep();

            step.setName(loc.getName());
            step.setMeta("预计参观 " + (40 + i * 10) + " 分钟（" + loc.getCategory() + "）");
            step.setDesc(loc.getDescription() + " 本场馆是上海红十字文化的重要展示窗口，承载着深厚的人道主义精神，是了解上海乃至中国红十字运动历史的绝佳起点。");
            step.setHistory("该场馆成立于近现代时期，见证了中国红十字运动在上海的发展历程，承载着几代红十字人的理想与实践。");
            step.setBestTime("建议工作日上午 9:00-11:00，此时人流较少，可安静参观；周末 10:00-14:00 为参观高峰期，建议提前到达。");
            step.setTicket("免费开放，无需购票。建议提前通过官方公众号或官方网站预约名额，以确保顺利入场；部分场馆每周一闭馆维护。");
            step.setNearbyFood(loc.getLocation().contains("徐汇区")
                ? "出门右转 200 米岳阳路有多家本帮菜馆，人均约 60-80 元；永康路有网红咖啡店，适合短暂休憩。"
                : "附近商场 B1 层有实惠快餐，约 30-45 元；路边有连锁便利店，可购买简餐。");
            step.setHighlights(List.of(
                "馆内珍藏历史文献与实物展品",
                "专业讲解员提供免费定时讲解（每日 10:00 / 14:00 两场）",
                "互动多媒体展示区，深入了解红十字精神",
                "临期主题特展，定期更换内容"
            ));
            step.setPhotoSpots(List.of(
                "场馆正门的红十字主题雕塑",
                "一楼大厅的光辉历程展区",
                "二楼临展互动区（光线最佳，适合人像）"
            ));
            step.setPracticalTips(List.of(
                "场馆周边停车困难，建议搭乘地铁或公交前往",
                "馆内设有无障碍通道及轮椅免费借用服务",
                "可携带饮用水，但请勿携带食品进入展厅",
                "参观时长建议预留 1-2 小时"
            ));
            step.setTips(List.of("请遵守场馆规定，勿使用闪光灯拍照", "部分展品需预约才能近距离观看"));

            TransitInfo ti = new TransitInfo();
            if (i == 0) {
                ti.setFromPrev("从您的出发点前往本地点");
                ti.setRouteHint("建议使用手机地图导航，输入地点名称即可规划最优路线");
                ti.setCost("请以实际导航为准");
                ti.setDuration("请以实际导航为准");
            } else {
                ti.setFromPrev("根据两地点位置，建议选择地铁或公交出行");
                ti.setRouteHint("两地点位于相邻区域，可通过地铁或公交直达，请以地图导航为准");
                ti.setCost("约 " + (4 + i * 2) + " 元（地铁）");
                ti.setDuration("约 " + (15 + i * 5) + " 分钟");
            }
            ti.setMode(modes[i % modes.length]);
            step.setTransit(ti);
            steps.add(step);
        }
        return steps;
    }

    private List<String> generateMockSummary() {
        return List.of(
            "路线经过精心编排，按行政区串联上海红十字地标",
            "每站都有红十字文化特色亮点，适合深度游览",
            "交通路线为参考建议，实际出行请以地图导航为准"
        );
    }

    /** 内置默认地点列表（当前端未传入时使用） */
    private List<LocationItem> defaultLocations() {
        return List.of(
            new LocationItem("上海红十字会博物馆", "博物馆", "上海市 · 徐汇区", "中国第一座红十字主题博物馆，展示自 1904 年以来中国红十字运动的发展历程。"),
            new LocationItem("上海市红十字会", "机构", "上海市 · 静安区", "上海市红十字会是中国红十字会的地方分会，承担全市人道救助、应急救护、无偿献血、造血干细胞捐献等职责。"),
            new LocationItem("上海红十字备灾救灾中心", "救灾中心", "上海市 · 浦东新区", "上海市红十字会备灾救灾物资储备与调配中心，承担华东地区重大自然灾害的应急物资保障任务。"),
            new LocationItem("上海市红十字医院", "医疗机构", "上海市 · 长宁区", "秉承红十字人道主义精神的医疗机构，在应急医疗救援、贫困患者救助等方面有显著特色。"),
            new LocationItem("红十字国际委员会东亚地区代表处", "国际组织", "上海市 · 黄浦区", "红十字国际委员会在东亚地区的重要办事机构，负责协调人道援助工作，推广国际人道法。"),
            new LocationItem("上海博爱园", "纪念公园", "上海市 · 闵行区", "以博爱为主题的红十字纪念公园，园内设有红十字纪念碑、博爱广场、志愿者雕塑群等。")
        );
    }
}

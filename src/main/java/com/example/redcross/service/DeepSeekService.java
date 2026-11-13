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

    @Value("${deepseek.api.model:deepseek-flash}")
    private String model;

    @Value("${deepseek.api.reasoning-effort:low}")
    private String reasoningEffort;

    public DeepSeekService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * DeepSeek-Flash 的快速配置：
     * 启用轻量思考，用 low 推理强度、较短输出上限和低温度减少响应等待。
     */
    private Map<String, Object> buildChatRequest(
            String systemPrompt,
            String userPrompt,
            int maxTokens,
            double temperature) {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("model", model);
        request.put("messages", List.of(
            new DeepSeekRequest.Message("system", systemPrompt),
            new DeepSeekRequest.Message("user", userPrompt)
        ));
        request.put("temperature", temperature);
        request.put("frequency_penalty", 0.2);
        request.put("presence_penalty", 0.15);
        request.put("response_format", Map.of("type", "json_object"));
        request.put("thinking", Map.of("type", "enabled"));
        request.put("reasoning_effort", reasoningEffort == null || reasoningEffort.isBlank() ? "low" : reasoningEffort);
        request.put("max_tokens", maxTokens);
        request.put("stream", false);
        return request;
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
            response.setRouteGenerationProcess(generateMockProcess());
            response.setMocked(true);
            return response;
        }

        // 真实调用 DeepSeek：Flash + 轻量思考，减少首字与完整响应时间
        try {
            String prompt = buildPrompt(question, locations);
            Map<String, Object> request = buildChatRequest(
                "你是一名严谨且富有文采的上海红十字文化导游，必须根据提供的真实地点生成路线，"
                    + "绝对不能编造地点。直接返回精简、完整的 JSON，不展示思考过程。",
                prompt,
                3600,
                0.55
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey.trim());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            logger.info("调用 DeepSeek API: {}", apiUrl);
            ResponseEntity<DeepSeekResponse> resp = restTemplate.exchange(
                apiUrl, HttpMethod.POST, entity, DeepSeekResponse.class);

            DeepSeekResponse ds = resp.getBody();
            String content = "";
            if (ds != null && ds.getChoices() != null && !ds.getChoices().isEmpty()) {
                content = ds.getChoices().get(0).getMessage().getContent();
            }
            logger.info("DeepSeek 路线响应字符数: {}", content == null ? 0 : content.length());

            // 解析 JSON 响应
            AiRouteResponse parsed = parseJsonResponse(content);
            parsed.setQuestion(question);
            return parsed;

        } catch (HttpClientErrorException e) {
            logger.error("DeepSeek API 返回错误: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            response.setSteps(generateMockSteps(locations));
            response.setSummary(generateMockSummary());
            response.setRouteGenerationProcess(generateMockProcess());
            response.setMocked(true);
            response.setErrorMessage("调用 DeepSeek 失败（" + e.getStatusCode() + "），已降级为本地推荐");
            return response;
        } catch (Exception e) {
            logger.error("调用 DeepSeek API 异常: {}", e.getMessage(), e);
            response.setSteps(generateMockSteps(locations));
            response.setSummary(generateMockSummary());
            response.setRouteGenerationProcess(generateMockProcess());
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
        sb.append("  \"routeGenerationProcess\": \"用 2 句话说明筛选地点、安排顺序和匹配时间的主要思路。\",\n");
        sb.append("  \"steps\": [\n");
        sb.append("    {\n");
        sb.append("      \"name\": \"地点全称（必须与上方数据库中的名称完全一致）\",\n");
        sb.append("      \"meta\": \"类别 · 建议时长\",\n");
        sb.append("      \"desc\": \"2句话说明站点在路线中的角色、参观价值和推荐理由，必须基于上方简介。\",\n");
        sb.append("      \"history\": \"1 句真实历史背景。\",\n");
        sb.append("      \"bestTime\": \"建议时段及一句简短理由\",\n");
        sb.append("      \"ticket\": \"门票与预约信息，保持简短\",\n");
        sb.append("      \"highlights\": [\"亮点1\", \"亮点2\", \"亮点3\"],\n");
        sb.append("      \"photoSpots\": [\"打卡点1\", \"打卡点2\"],\n");
        sb.append("      \"nearbyFood\": \"一条附近餐饮建议，不得编造精确门牌号\",\n");
        sb.append("      \"practicalTips\": [\"实用贴士1\", \"实用贴士2\"],\n");
        sb.append("      \"tips\": [\"快速贴士\"]\n");
        sb.append("    }\n");
        sb.append("  ],\n");
        sb.append("  \"summary\": [\"路线亮点1（20字以内）\", \"路线亮点2（20字以内）\"]\n");
        sb.append("}\n\n");

        // 第四部分：硬性约束
        sb.append("【硬性规则，必须遵守】\n");
        sb.append("1. steps 数量控制在 3-5 个，根据用户问题中的时间/兴趣偏好选择合适的数量。\n");
        sb.append("2. name 必须与【地点数据库】中的名称完全一致，不得修改、不得编造。\n");
        sb.append("3. desc 必须基于【地点数据库】中的简介展开，每条 desc 固定 2 句话。\n");
        sb.append("4. history、nearbyFood、bestTime 必须真实合理，不得编造门牌号、具体餐厅名称（使用'XX路'等模糊描述即可）或闭馆日。\n");
        sb.append("5. routeGenerationProcess 必须清晰描述思考过程，不要重复路线步骤的内容，要体现『为什么这样安排』。\n");
        sb.append("6. 返回的必须是合法 JSON，不要有任何额外文字。\n");
        sb.append("7. 【表达精简】字段措辞简洁具体，不使用'承载着''绝佳''不可错过'等套话；每站至少有一处独特视角。\n");
        sb.append("8. 【结合上下文】根据用户问题的具体场景（亲子/拍照/深度/半天/一天/医疗等）调整语言风格：亲子场景语气活泼，深度场景强调历史厚重感，拍照场景突出视觉亮点，半天场景突出节奏紧凑。\n");

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
            JsonNode processNode = root.get("routeGenerationProcess");

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

                    stepList.add(step);
                }
            }

            List<String> summaryList = new ArrayList<>();
            if (summaryNode != null && summaryNode.isArray()) {
                for (JsonNode s : summaryNode) summaryList.add(s.asText());
            }

            // 路线生成过程描述
            String processText = (processNode != null && !processNode.isNull()) ? processNode.asText("") : "";

            result.setSteps(stepList);
            result.setSummary(summaryList);
            result.setRouteGenerationProcess(processText);
            result.setMocked(false);
            logger.info("解析成功：{} 个步骤，{} 条要点，路线生成过程 {} 字", stepList.size(), summaryList.size(), processText.length());
        } catch (Exception e) {
            logger.error("解析 DeepSeek JSON 响应失败，回退为 mock 数据: {}", e.getMessage());
            result.setSteps(generateMockSteps(defaultLocations()));
            result.setSummary(generateMockSummary());
            result.setRouteGenerationProcess(generateMockProcess());
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

            steps.add(step);
        }
        return steps;
    }

    private List<String> generateMockSummary() {
        return List.of(
            "路线经过精心编排，按行政区串联上海红十字地标",
            "每站都有红十字文化特色亮点，适合深度游览",
            "建议结合实际出行时间灵活调整参观顺序"
        );
    }

    /** Mock 模式下的路线生成过程描述 */
    private String generateMockProcess() {
        return "首先分析用户偏好与可用时间，从地点库中挑选与主题契合的代表性场馆；"
            + "其次按照主题相关性与参观节奏确定浏览顺序，避免主题重复并保持体验连贯；"
            + "然后根据每个地点的常规参观时长估算总耗时，确保与用户的可用时间相匹配；"
            + "最后补充参观亮点、餐饮与拍照点等实用信息，方便用户落地执行。";
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

    // ============ AI 地点推荐 ============

    /**
     * 根据用户画像推荐地点
     * 未配置 API Key 或调用失败时降级为本地生成
     */
    public AiRecommendResponse recommendPlaces(AiRecommendRequest req) {
        if (req == null) req = new AiRecommendRequest();

        List<LocationItem> locations = req.getLocations();
        if (locations == null || locations.isEmpty()) {
            locations = defaultLocations();
        }

        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.trim().equals("${DEEPSEEK_API_KEY:}")) {
            logger.info("DeepSeek API Key 未配置，AI 地点推荐使用本地 mock");
            AiRecommendResponse mock = buildMockRecommend(req, locations);
            mock.setMocked(true);
            return mock;
        }

        try {
            String prompt = buildRecommendPrompt(req, locations);

            Map<String, Object> dsReq = buildChatRequest(
                "你是一位熟悉上海红十字文化的策展人。根据访客经历挑选地点，"
                    + "推荐理由要具体、简洁，直接返回完整 JSON。",
                prompt,
                1500,
                0.65
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey.trim());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(dsReq, headers);

            logger.info("调用 DeepSeek API 进行地点推荐: {}", apiUrl);
            ResponseEntity<DeepSeekResponse> resp = restTemplate.exchange(
                apiUrl, HttpMethod.POST, entity, DeepSeekResponse.class);

            DeepSeekResponse ds = resp.getBody();
            String content = "";
            if (ds != null && ds.getChoices() != null && !ds.getChoices().isEmpty()) {
                content = ds.getChoices().get(0).getMessage().getContent();
            }

            AiRecommendResponse parsed = parseRecommendResponse(content);
            if (parsed.getRecommendations() == null || parsed.getRecommendations().isEmpty()) {
                throw new IllegalStateException("AI 未返回有效的推荐内容");
            }
            return parsed;

        } catch (HttpClientErrorException e) {
            logger.error("DeepSeek 推荐接口返回错误: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            AiRecommendResponse fallback = buildMockRecommend(req, locations);
            fallback.setMocked(true);
            fallback.setErrorMessage("调用 DeepSeek 失败（" + e.getStatusCode() + "），已降级为本地推荐");
            return fallback;
        } catch (Exception e) {
            logger.error("AI 地点推荐异常: {}", e.getMessage(), e);
            AiRecommendResponse fallback = buildMockRecommend(req, locations);
            fallback.setMocked(true);
            fallback.setErrorMessage("调用 DeepSeek 异常：" + e.getMessage());
            return fallback;
        }
    }

    private String buildRecommendPrompt(AiRecommendRequest req, List<LocationItem> locations) {
        StringBuilder sb = new StringBuilder();

        sb.append("【候选地点】以下是系统中唯一可用的地点，推荐时必须从中选择，名称要与下面完全一致，不能编造。\n\n");
        for (int i = 0; i < locations.size(); i++) {
            LocationItem loc = locations.get(i);
            sb.append("【地点").append(i + 1).append("】").append(loc.getName()).append("\n");
            sb.append("  区域：").append(loc.getLocation()).append("\n");
            sb.append("  类别：").append(loc.getCategory()).append("\n");
            sb.append("  简介：").append(loc.getDescription()).append("\n\n");
        }

        sb.append("【访客画像】\n");
        List<String> checkedNames = req.getCheckedNames();
        sb.append("  已打卡过的地点：")
          .append(checkedNames == null || checkedNames.isEmpty() ? "暂无（新访客）" : String.join("、", checkedNames))
          .append("\n");

        List<String> checkedCats = req.getCheckedCategories();
        sb.append("  已到访过的类别：")
          .append(checkedCats == null || checkedCats.isEmpty() ? "暂无" : String.join("、", checkedCats))
          .append("\n");

        List<String> likedCats = req.getLikedCategories();
        sb.append("  给出高分评价的类别：")
          .append(likedCats == null || likedCats.isEmpty() ? "暂无" : String.join("、", likedCats))
          .append("\n");

        if (req.getPreference() != null && !req.getPreference().isBlank()) {
            sb.append("  访客当下的偏好：").append(req.getPreference().trim()).append("\n");
        }
        sb.append("\n");

        sb.append("【输出要求】请严格按以下 JSON 格式返回，只返回 JSON，不要任何解释文字：\n");
        sb.append("{\n");
        sb.append("  \"summary\": \"一到两句，概括你这次为这位访客挑选地点的整体思路。\",\n");
        sb.append("  \"recommendations\": [\n");
        sb.append("    {\n");
        sb.append("      \"name\": \"地点全称（必须与候选地点完全一致）\",\n");
        sb.append("      \"category\": \"该地点的类别\",\n");
        sb.append("      \"reason\": \"1-2 句话。必须结合访客的打卡历史或高分偏好说明推荐理由，避免空泛套话。\",\n");
        sb.append("      \"highlight\": \"最值得做的一件具体的事（一个动作，不是泛泛的形容词）\",\n");
        sb.append("      \"bestTime\": \"建议到访的时间段与理由\",\n");
        sb.append("      \"tip\": \"一条实用提示（交通、预约、注意事项等）\"\n");
        sb.append("    }\n");
        sb.append("  ]\n");
        sb.append("}\n\n");

        sb.append("【硬性规则】\n");
        sb.append("1. 推荐 3 个地点，全部必须来自候选地点，不得编造或改写名称。\n");
        sb.append("2. 优先推荐访客还没打卡过的地点；若候选几乎都去过，可推荐重访，但要说明「这次可以看什么不一样的东西」。\n");
        sb.append("3. reason 必须体现个性化：提到访客去过的地方、偏好过的类别，或直接回应用户的偏好描述。\n");
        sb.append("4. 同一批推荐中，每个地点的推荐理由句式、切入角度要各不相同，禁止套用同一模板。\n");
        sb.append("5. 不要使用「绝佳」「不可错过」「承载着」这类高频套话。\n");
        sb.append("6. 只返回 JSON。\n");

        return sb.toString();
    }

    private AiRecommendResponse parseRecommendResponse(String content) {
        AiRecommendResponse response = new AiRecommendResponse();
        List<PlaceRecommendation> list = new ArrayList<>();
        response.setRecommendations(list);

        String json = extractJson(content);
        if (json == null) {
            response.setErrorMessage("AI 返回内容为空");
            return response;
        }

        try {
            JsonNode root = objectMapper.readTree(json);
            response.setSummary(textOrEmpty(root, "summary"));

            JsonNode arr = root.get("recommendations");
            if (arr != null && arr.isArray()) {
                for (JsonNode n : arr) {
                    PlaceRecommendation r = new PlaceRecommendation();
                    r.setName(textOrEmpty(n, "name"));
                    r.setCategory(textOrEmpty(n, "category"));
                    r.setReason(textOrEmpty(n, "reason"));
                    r.setHighlight(textOrEmpty(n, "highlight"));
                    r.setBestTime(textOrEmpty(n, "bestTime"));
                    r.setTip(textOrEmpty(n, "tip"));
                    if (!r.getName().isEmpty()) list.add(r);
                }
            }
        } catch (Exception e) {
            logger.error("解析 AI 推荐 JSON 失败: {}", e.getMessage());
            response.setErrorMessage("解析 AI 返回内容失败");
        }
        return response;
    }

    /** 从可能带有 ```json 包裹的文本中提取 JSON 主体 */
    private String extractJson(String content) {
        if (content == null || content.isBlank()) return null;
        String s = content.trim();

        int fence = s.indexOf("```");
        if (fence >= 0) {
            int start = s.indexOf('\n', fence);
            int end = s.indexOf("```", fence + 3);
            if (start > 0 && end > start) {
                s = s.substring(start + 1, end).trim();
            }
        }

        int first = s.indexOf('{');
        int last = s.lastIndexOf('}');
        if (first >= 0 && last > first) {
            s = s.substring(first, last + 1);
        }
        return s;
    }

    /** 本地生成的推荐（无 API Key 或调用失败时使用） */
    private AiRecommendResponse buildMockRecommend(AiRecommendRequest req, List<LocationItem> locations) {
        AiRecommendResponse response = new AiRecommendResponse();

        List<String> checkedNames = req.getCheckedNames() == null ? List.of() : req.getCheckedNames();
        List<String> likedCats = req.getLikedCategories() == null ? List.of() : req.getLikedCategories();
        List<String> checkedCats = req.getCheckedCategories() == null ? List.of() : req.getCheckedCategories();

        // 优先挑选尚未打卡的地点
        List<LocationItem> pool = new ArrayList<>();
        for (LocationItem loc : locations) {
            if (!checkedNames.contains(loc.getName())) pool.add(loc);
        }
        boolean allVisited = pool.isEmpty();
        if (allVisited) pool = new ArrayList<>(locations);

        response.setSummary(allVisited
            ? "大部分地点你都走过了，这次换个视角——重访那些容易被匆匆略过的地方。"
            : "顺着你已经走过的足迹，这次挑了几个还没踏足、但和你口味对得上的地方。");

        List<PlaceRecommendation> list = new ArrayList<>();
        int take = Math.min(3, pool.size());
        for (int i = 0; i < take; i++) {
            LocationItem loc = pool.get(i);
            PlaceRecommendation r = new PlaceRecommendation();
            r.setName(loc.getName());
            r.setCategory(loc.getCategory());
            r.setReason(mockRecommendReason(i, loc, likedCats, checkedCats, allVisited));
            r.setHighlight(mockRecommendHighlight(i));
            r.setBestTime(mockRecommendBestTime(i));
            r.setTip("出发前先确认开放时间，部分场馆需提前预约。");
            list.add(r);
        }
        response.setRecommendations(list);
        return response;
    }

    private String mockRecommendReason(int index, LocationItem loc, List<String> likedCats,
                                       List<String> checkedCats, boolean allVisited) {
        if (allVisited) {
            switch (index % 3) {
                case 0: return "你去过这里，但大概率漏掉了展厅角落里那些不起眼的细节，二刷只看一个主题收获反而更大。";
                case 1: return "同一个地方换个时段来感受完全不同，尤其是人少的时候，整个空间的氛围都会变。";
                default: return "既然已经走过一圈，这次带上一个没来过的朋友，讲解的过程也是重新理解的过程。";
            }
        }
        if (likedCats.contains(loc.getCategory())) {
            return "你在" + loc.getCategory() + "类地点给过高分，这里的调性和你的口味是一路的，"
                + "而且还留着你没看过的那部分内容。";
        }
        if (checkedCats.contains(loc.getCategory())) {
            return "你已经接触过" + loc.getCategory() + "类地点，这一处呈现的是另一个切面，"
                + "补上它，你对这条线索的理解会完整很多。";
        }
        switch (index % 3) {
            case 0: return "你走过的地点里还没有" + loc.getCategory() + "这一类，正好补上一块空白。";
            case 1: return "从你过往的足迹看，这里是很自然的延伸——主题不重复，气质却接得上。";
            default: return "这次给你换个方向，去一个和你已打卡地点完全不同类型的地方，对比着看会更有意思。";
        }
    }

    private String mockRecommendHighlight(int index) {
        switch (index % 3) {
            case 0: return "在免费讲解开始前十分钟到，能占到最靠近展柜的位置。";
            case 1: return "向服务台要一份纸质导览图，按编号走一遍，不会漏掉展项。";
            default: return "离馆前在留言簿上写一句话，比拍照更容易记住当时的感觉。";
        }
    }

    private String mockRecommendBestTime(int index) {
        switch (index % 3) {
            case 0: return "工作日上午 9:30-11:30，团队客还没到，展厅最安静。";
            case 1: return "周末下午 14:00 之后，光线和人气都刚好。";
            default: return "周三通常人最少，时间能调的话优先选这天。";
        }
    }
}

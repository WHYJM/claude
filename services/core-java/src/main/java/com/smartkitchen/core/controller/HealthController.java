// [IN]: Spring Web (RestController, GetMapping) / Spring Web 注解
// [OUT]: /api/health, /api/ endpoints / 健康检查和服务信息端点
// [POS]: Health check controller, provides service status for orchestration / 健康检查控制器，为容器编排提供服务状态
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

package com.smartkitchen.core.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
            "status", "healthy",
            "service", "core-java",
            "timestamp", Instant.now().toString()
        );
    }

    @GetMapping("/")
    public Map<String, Object> info() {
        return Map.of(
            "name", "Smart Kitchen Core Service",
            "version", "0.0.1",
            "description", "Core business logic: inventory, recipes, users"
        );
    }
}

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

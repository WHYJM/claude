// [IN]: Spring Boot framework / Spring Boot 框架
// [OUT]: Spring application context, HTTP server on port 8080 / Spring 应用上下文、HTTP 服务器（端口 8080）
// [POS]: Application entry point, bootstraps Spring Boot core service / 应用入口，启动 Spring Boot 核心服务
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

package com.smartkitchen.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

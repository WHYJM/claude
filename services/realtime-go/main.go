// [IN]: Gin framework, gorilla/websocket / Gin 框架、gorilla/websocket
// [OUT]: HTTP/WebSocket server on port 8081 / HTTP/WebSocket 服务器（端口 8081）
// [POS]: Realtime service entry, handles WebSocket connections for collaboration / 实时服务入口，处理协作 WebSocket 连接
// Protocol: When updating me, sync this header + parent folder's .folder.md
// 协议：更新本文件时，同步更新此头注释及所属文件夹的 .folder.md

package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // 开发环境允许所有来源
	},
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	r := gin.Default()

	// 健康检查
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"service":   "realtime-go",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})

	// 服务信息
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"name":        "Smart Kitchen Realtime Service",
			"version":     "0.0.1",
			"description": "WebSocket server for real-time collaboration",
		})
	})

	// WebSocket 端点
	r.GET("/ws/:roomId", handleWebSocket)

	log.Printf("🚀 Realtime service starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

func handleWebSocket(c *gin.Context) {
	roomId := c.Param("roomId")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	log.Printf("Client connected to room: %s", roomId)

	// TODO: 实现完整的 WebSocket 逻辑
	// - 房间管理
	// - CRDT 同步
	// - Redis Pub/Sub 广播

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Read error: %v", err)
			break
		}

		log.Printf("Received message in room %s: %s", roomId, message)

		// Echo back (placeholder)
		if err := conn.WriteMessage(messageType, message); err != nil {
			log.Printf("Write error: %v", err)
			break
		}
	}

	log.Printf("Client disconnected from room: %s", roomId)
}

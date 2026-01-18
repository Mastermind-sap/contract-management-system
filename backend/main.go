package main

import (
	"contract-platform/controllers"
	_ "contract-platform/docs" // Import generated docs
	"contract-platform/models"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// @title           Contract Management Platform API
// @version         1.0
// @description     REST API for managing blueprints and contracts.
// @host            localhost:8080
// @BasePath        /api
func main() {
	// Initialize Database
	db, err := gorm.Open(sqlite.Open("contract_platform.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto Migrate
	err = db.AutoMigrate(&models.Blueprint{}, &models.Contract{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Initialize Controllers
	blueprintController := controllers.NewBlueprintController(db)
	contractController := controllers.NewContractController(db)

	// Initialize Router
	r := gin.Default()

	// CORS Configuration
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true // For development simplicity
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type"}
	r.Use(cors.New(config))

	// Routes
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := r.Group("/api")
	{
		// Blueprint Routes
		api.GET("/blueprints", blueprintController.ListBlueprints)
		api.POST("/blueprints", blueprintController.CreateBlueprint)

		// Contract Routes
		api.GET("/contracts", contractController.ListContracts)
		api.POST("/contracts", contractController.CreateContract)
		api.GET("/contracts/:id", contractController.GetContract)
		api.PATCH("/contracts/:id/status", contractController.UpdateContractStatus)
	}

	// Swagger Route
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Run Server
	log.Println("Server running on port 8080")
	r.Run(":8080")
}

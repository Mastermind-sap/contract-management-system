package controllers

import (
	"contract-platform/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type BlueprintController struct {
	DB *gorm.DB
}

func NewBlueprintController(db *gorm.DB) *BlueprintController {
	return &BlueprintController{DB: db}
}

// ListBlueprints godoc
// @Summary      List all blueprints
// @Description  Get a list of all contract blueprints
// @Tags         blueprints
// @Produce      json
// @Success      200  {array}   models.Blueprint
// @Router       /blueprints [get]
func (ctrl *BlueprintController) ListBlueprints(c *gin.Context) {
	var blueprints []models.Blueprint
	if result := ctrl.DB.Find(&blueprints); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, blueprints)
}

// CreateBlueprint godoc
// @Summary      Create a blueprint
// @Description  Create a new contract blueprint with a schema
// @Tags         blueprints
// @Accept       json
// @Produce      json
// @Param        blueprint  body      models.Blueprint  true  "Blueprint JSON"
// @Success      201        {object}  models.Blueprint
// @Router       /blueprints [post]
func (ctrl *BlueprintController) CreateBlueprint(c *gin.Context) {
	var input models.Blueprint
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := ctrl.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, input)
}

package controllers

import (
	"contract-platform/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ContractController struct {
	DB *gorm.DB
}

func NewContractController(db *gorm.DB) *ContractController {
	return &ContractController{DB: db}
}

// ListContracts godoc
// @Summary      List all contracts
// @Description  Get a list of all contracts
// @Tags         contracts
// @Produce      json
// @Success      200  {array}   models.Contract
// @Router       /contracts [get]
func (ctrl *ContractController) ListContracts(c *gin.Context) {
	var contracts []models.Contract
	// Preload Blueprint to get blueprint details
	if result := ctrl.DB.Preload("Blueprint").Find(&contracts); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, contracts)
}

// CreateContract godoc
// @Summary      Create a contract
// @Description  Create a new contract instance from a blueprint
// @Tags         contracts
// @Accept       json
// @Produce      json
// @Param        contract   body      models.Contract  true  "Contract JSON"
// @Success      201        {object}  models.Contract
// @Router       /contracts [post]
func (ctrl *ContractController) CreateContract(c *gin.Context) {
	var input models.Contract
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify blueprint exists
	var blueprint models.Blueprint
	if err := ctrl.DB.First(&blueprint, "id = ?", input.BlueprintID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Blueprint ID"})
		return
	}

	// Set initial status
	input.Status = models.StatusCreated

	if err := ctrl.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, input)
}

// GetContract godoc
// @Summary      Get a contract
// @Description  Get contract details by ID
// @Tags         contracts
// @Produce      json
// @Param        id   path      string  true  "Contract ID"
// @Success      200  {object}  models.Contract
// @Router       /contracts/{id} [get]
func (ctrl *ContractController) GetContract(c *gin.Context) {
	id := c.Param("id")
	var contract models.Contract
	if err := ctrl.DB.Preload("Blueprint").First(&contract, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contract not found"})
		return
	}
	c.JSON(http.StatusOK, contract)
}

// UpdateContractStatus godoc
// @Summary      Update contract status
// @Description  Transition contract status (e.g. APPROVED, SIGNED)
// @Tags         contracts
// @Accept       json
// @Produce      json
// @Param        id     path      string  true  "Contract ID"
// @Param        status body      object  true  "Status Object {status: string}"
// @Success      200    {object}  models.Contract
// @Router       /contracts/{id}/status [patch]
func (ctrl *ContractController) UpdateContractStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status models.ContractStatus `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var contract models.Contract
	if err := ctrl.DB.First(&contract, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contract not found"})
		return
	}

	// State Machine Logic
	current := contract.Status
	next := req.Status

	if current == models.StatusLocked || current == models.StatusRevoked {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot update a finalized contract"})
		return
	}

	allowed := false

	// Revoke is allowed from any non-final state
	if next == models.StatusRevoked {
		allowed = true
	} else {
		// Linear progression
		switch current {
		case models.StatusCreated:
			if next == models.StatusApproved {
				allowed = true
			}
		case models.StatusApproved:
			if next == models.StatusSent {
				allowed = true
			}
		case models.StatusSent:
			if next == models.StatusSigned {
				allowed = true
			}
		case models.StatusSigned:
			if next == models.StatusLocked {
				allowed = true
			}
		}
	}

	if !allowed {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state transition from " + string(current) + " to " + string(next)})
		return
	}

	// Update Status
	contract.Status = next
	if err := ctrl.DB.Save(&contract).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, contract)
}

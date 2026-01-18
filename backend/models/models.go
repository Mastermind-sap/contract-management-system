package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Blueprint struct {
	ID          string    `gorm:"type:string;primaryKey" json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Schema      string    `json:"schema"` // Stored as JSON string
	CreatedAt   time.Time `json:"created_at"`
}

func (b *Blueprint) BeforeCreate(tx *gorm.DB) (err error) {
	if b.ID == "" {
		b.ID = uuid.New().String()
	}
	return
}

type ContractStatus string

const (
	StatusCreated  ContractStatus = "CREATED"
	StatusApproved ContractStatus = "APPROVED"
	StatusSent     ContractStatus = "SENT"
	StatusSigned   ContractStatus = "SIGNED"
	StatusLocked   ContractStatus = "LOCKED"
	StatusRevoked  ContractStatus = "REVOKED"
)

type Contract struct {
	ID          string         `gorm:"type:string;primaryKey" json:"id"`
	BlueprintID string         `json:"blueprint_id"`
	Blueprint   Blueprint      `gorm:"foreignKey:BlueprintID" json:"blueprint"`
	Status      ContractStatus `gorm:"default:CREATED" json:"status"`
	Data        string         `json:"data"` // Stored as JSON string
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

func (c *Contract) BeforeCreate(tx *gorm.DB) (err error) {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	if c.Status == "" {
		c.Status = StatusCreated
	}
	return
}

// UnmarshalSchema helps frontend parse the schema string
func (b *Blueprint) UnmarshalSchema() (map[string]interface{}, error) {
	var schema map[string]interface{}
	err := json.Unmarshal([]byte(b.Schema), &schema)
	return schema, err
}

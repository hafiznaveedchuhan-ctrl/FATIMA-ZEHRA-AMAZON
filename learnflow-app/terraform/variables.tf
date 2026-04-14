# Terraform Variables for Production Deployment

variable "aws_region" {
  type        = string
  description = "AWS region for deployment"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Environment name"
  default     = "production"

  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "project_name" {
  type        = string
  description = "Project name"
  default     = "reusable-shop"
}

# ============================================================================
# Database Configuration
# ============================================================================

variable "db_instance_class" {
  type        = string
  description = "RDS instance class (compute/memory capacity)"
  default     = "db.t3.small"

  validation {
    condition     = can(regex("^db\\.[a-z0-9]+\\.[a-z0-9]+$", var.db_instance_class))
    error_message = "Invalid RDS instance class format."
  }
}

variable "db_allocated_storage" {
  type        = number
  description = "Allocated storage in GB"
  default     = 100

  validation {
    condition     = var.db_allocated_storage >= 20 && var.db_allocated_storage <= 65536
    error_message = "Allocated storage must be between 20 and 65536 GB."
  }
}

variable "db_username" {
  type        = string
  description = "Database master username"
  sensitive   = true
  default     = "boutique_admin"

  validation {
    condition     = length(var.db_username) >= 3
    error_message = "Database username must be at least 3 characters."
  }
}

variable "db_password" {
  type        = string
  description = "Database master password"
  sensitive   = true

  validation {
    condition     = length(var.db_password) >= 16 && can(regex("[A-Z]", var.db_password)) && can(regex("[a-z]", var.db_password)) && can(regex("[0-9]", var.db_password))
    error_message = "Database password must be at least 16 characters with uppercase, lowercase, and numbers."
  }
}

variable "db_backup_retention_period" {
  type        = number
  description = "Database backup retention period in days"
  default     = 30

  validation {
    condition     = var.db_backup_retention_period >= 7 && var.db_backup_retention_period <= 35
    error_message = "Backup retention must be between 7 and 35 days."
  }
}

# ============================================================================
# Cache Configuration
# ============================================================================

variable "cache_node_type" {
  type        = string
  description = "ElastiCache node type"
  default     = "cache.t3.small"
}

# ============================================================================
# Monitoring & Alerting
# ============================================================================

variable "alert_email" {
  type        = string
  description = "Email address for CloudWatch alerts"

  validation {
    condition     = can(regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", var.alert_email))
    error_message = "Alert email must be a valid email address."
  }
}

variable "log_retention_days" {
  type        = number
  description = "CloudWatch log retention period in days"
  default     = 30

  validation {
    condition     = contains([1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653], var.log_retention_days)
    error_message = "Log retention days must be one of the valid CloudWatch retention values."
  }
}

# ============================================================================
# Scaling Configuration
# ============================================================================

variable "ecs_task_cpu" {
  type        = number
  description = "ECS task CPU units (256 = 0.25 vCPU)"
  default     = 512

  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.ecs_task_cpu)
    error_message = "ECS task CPU must be one of: 256, 512, 1024, 2048, 4096."
  }
}

variable "ecs_task_memory" {
  type        = number
  description = "ECS task memory in MB"
  default     = 1024

  validation {
    condition     = var.ecs_task_memory >= 512 && var.ecs_task_memory <= 30720
    error_message = "ECS task memory must be between 512 and 30720 MB."
  }
}

variable "ecs_desired_count" {
  type        = number
  description = "Desired number of ECS tasks"
  default     = 2

  validation {
    condition     = var.ecs_desired_count >= 1 && var.ecs_desired_count <= 10
    error_message = "Desired task count must be between 1 and 10."
  }
}

variable "ecs_min_capacity" {
  type        = number
  description = "Minimum ECS task count for autoscaling"
  default     = 2

  validation {
    condition     = var.ecs_min_capacity >= 1
    error_message = "Minimum capacity must be at least 1."
  }
}

variable "ecs_max_capacity" {
  type        = number
  description = "Maximum ECS task count for autoscaling"
  default     = 10

  validation {
    condition     = var.ecs_max_capacity >= var.ecs_min_capacity
    error_message = "Maximum capacity must be >= minimum capacity."
  }
}

variable "autoscaling_target_cpu_percentage" {
  type        = number
  description = "Target CPU percentage for autoscaling"
  default     = 70

  validation {
    condition     = var.autoscaling_target_cpu_percentage >= 20 && var.autoscaling_target_cpu_percentage <= 90
    error_message = "Target CPU percentage must be between 20 and 90."
  }
}

variable "autoscaling_target_memory_percentage" {
  type        = number
  description = "Target memory percentage for autoscaling"
  default     = 80

  validation {
    condition     = var.autoscaling_target_memory_percentage >= 20 && var.autoscaling_target_memory_percentage <= 90
    error_message = "Target memory percentage must be between 20 and 90."
  }
}

# ============================================================================
# Tags
# ============================================================================

variable "tags" {
  type        = map(string)
  description = "Common tags to apply to all resources"
  default = {
    Project     = "Reusable-Shop"
    Environment = "Production"
    ManagedBy   = "Terraform"
    Team        = "DevOps"
  }
}

variable "cost_center" {
  type        = string
  description = "Cost center for billing"
  default     = "Engineering"
}

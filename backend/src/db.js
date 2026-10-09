require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3307'),
  database: process.env.DB_NAME     || 'factory_safety',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

async function initTables() {
  const c = await pool.getConnection();
  try {
    await c.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(64) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        status VARCHAR(32) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(32) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS ppe_items (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(64) NOT NULL,
        display_name VARCHAR(128) NOT NULL,
        icon VARCHAR(16) DEFAULT '🔧',
        active TINYINT(1) DEFAULT 1
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS role_ppe_requirements (
        id VARCHAR(64) PRIMARY KEY,
        role_id VARCHAR(64) NOT NULL,
        department_id VARCHAR(64),
        ppe_item_id VARCHAR(64) NOT NULL,
        UNIQUE KEY uniq_role_dept_ppe (role_id, department_id, ppe_item_id)
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(64) PRIMARY KEY,
        card_number VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role_id VARCHAR(64),
        department_id VARCHAR(64),
        category VARCHAR(100),
        status VARCHAR(32) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS employee_ppe_requirements (
        id VARCHAR(64) PRIMARY KEY,
        employee_id VARCHAR(64) NOT NULL,
        ppe_item_id VARCHAR(64) NOT NULL,
        UNIQUE KEY uniq_emp_ppe (employee_id, ppe_item_id)
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS gates (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        status VARCHAR(32) DEFAULT 'online',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS gate_scans (
        id VARCHAR(64) PRIMARY KEY,
        gate_id VARCHAR(64),
        employee_id VARCHAR(64),
        employee_code VARCHAR(64),
        employee_name VARCHAR(255),
        department_name VARCHAR(255),
        role_name VARCHAR(255),
        required_ppe JSON,
        detected_ppe JSON,
        missing_ppe JSON,
        compliance_status VARCHAR(32) NOT NULL,
        incident_id VARCHAR(64),
        deadline_at DATETIME,
        resolved_at DATETIME,
        escalated_at DATETIME,
        evidence_path VARCHAR(512),
        ai_inference_ms INT,
        total_ms INT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS compliance_incidents (
        id VARCHAR(64) PRIMARY KEY,
        incident_number VARCHAR(32) UNIQUE NOT NULL,
        employee_id VARCHAR(64) NOT NULL,
        employee_code VARCHAR(64),
        employee_name VARCHAR(255),
        department_name VARCHAR(255),
        role_name VARCHAR(255),
        gate_id VARCHAR(64),
        detected_ppe JSON,
        required_ppe JSON,
        missing_ppe JSON,
        severity VARCHAR(32) NOT NULL,
        status VARCHAR(32) DEFAULT 'PENDING',
        escalation_status VARCHAR(32) DEFAULT 'NONE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deadline_at DATETIME,
        resolved_at DATETIME,
        escalated_at DATETIME
      ) ENGINE=InnoDB;

      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        action VARCHAR(255) NOT NULL,
        entity VARCHAR(128),
        entity_id VARCHAR(64),
        detail TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
    console.log('[DB] Tables ready (MySQL/MariaDB)');
  } finally {
    c.release();
  }
}

// Run on startup
initTables().catch(err => console.error('[DB] Init error:', err.message));

module.exports = pool;

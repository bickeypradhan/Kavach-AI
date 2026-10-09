require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seed() {
  console.log('Seeding MySQL/MariaDB (factory_safety)...');
  const hash = await bcrypt.hash('password123', 10);
  const c = await pool.getConnection();

  try {
    // Users
    await c.execute(`INSERT IGNORE INTO users (id,name,email,role,password_hash,status) VALUES
      ('usr-1','Admin User','admin@astrasafety.com','ADMIN','${hash}','active'),
      ('usr-2','Safety Manager','safety@astrasafety.com','SAFETY_MANAGER','${hash}','active')`);

    // Departments
    await c.execute(`INSERT IGNORE INTO departments (id,name,description) VALUES
      ('dept-1','Production','Main production floor and assembly'),
      ('dept-2','Maintenance','Machine and equipment maintenance'),
      ('dept-3','Administration','Office and administration')`);

    // PPE Items
    await c.execute(`INSERT IGNORE INTO ppe_items (id,name,display_name,icon) VALUES
      ('ppe-1','helmet','Safety Helmet','⛑️'),
      ('ppe-2','vest','Safety Vest','🦺'),
      ('ppe-3','boots','Safety Boots','👟'),
      ('ppe-4','gloves','Safety Gloves','🧤'),
      ('ppe-5','goggles','Safety Goggles','🥽'),
      ('ppe-6','mask','Respirator Mask','😷'),
      ('ppe-7','ear_protection','Ear Protection','🎧')`);

    // Gates
    await c.execute(`INSERT IGNORE INTO gates (id,name,location,status) VALUES
      ('gate-1','Main Entry Gate','North Entrance, Bhubaneswar Plant','online')`);

    // Employees (Using flexible card_number as requested)
    await c.execute(`INSERT IGNORE INTO employees (id,card_number,name,department_id,category,status) VALUES
      ('emp-1','2401292298','Rahul Kumar','dept-1','Worker','active'),
      ('emp-2','2401292315','Amit Das','dept-2','Technician','active'),
      ('emp-3','2401292411','Priya Singh','dept-1','Supervisor','active'),
      ('emp-4','2401292500','Raj Sharma','dept-3','Manager','active')`);

    // Employee-Specific PPE Requirements
    // Rahul Kumar requires Helmet, Vest, Boots, Gloves
    await c.execute(`INSERT IGNORE INTO employee_ppe_requirements (id, employee_id, ppe_item_id) VALUES
      ('epr-1','emp-1','ppe-1'),
      ('epr-2','emp-1','ppe-2'),
      ('epr-3','emp-1','ppe-3'),
      ('epr-4','emp-1','ppe-4')`);

    // Amit Das requires Helmet, Boots
    await c.execute(`INSERT IGNORE INTO employee_ppe_requirements (id, employee_id, ppe_item_id) VALUES
      ('epr-5','emp-2','ppe-1'),
      ('epr-6','emp-2','ppe-3')`);

    // Priya Singh requires Vest
    await c.execute(`INSERT IGNORE INTO employee_ppe_requirements (id, employee_id, ppe_item_id) VALUES
      ('epr-7','emp-3','ppe-2')`);

    // Raj Sharma requires NO PPE (No records inserted)

    console.log('Seed complete.');
  } finally { c.release(); process.exit(0); }
}

// Wait for table init
setTimeout(seed, 2000);

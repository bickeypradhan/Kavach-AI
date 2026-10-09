require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer } = require('ws');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { JWT_SECRET, authenticateToken, requireRole } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- WEBSOCKET BROADCAST ---
const clients = new Set();
wss.on('connection', ws => { clients.add(ws); ws.on('close', () => clients.delete(ws)); });
function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const c of clients) { if (c.readyState === 1) c.send(msg); }
}

// Shorthand query helpers
const q  = (sql, p = []) => pool.execute(sql, p);
const q1 = async (sql, p = []) => { const [rows] = await pool.execute(sql, p); return rows[0] || null; };
const qa = async (sql, p = []) => { const [rows] = await pool.execute(sql, p); return rows; };
const id  = () => 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
const jp = v => { try { return JSON.parse(v); } catch { return v; } }

// =============================================
// AUTH
// =============================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await q1('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await q1('SELECT id,name,email,role,status FROM users WHERE id=?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// DEPARTMENTS
// =============================================
app.get('/api/departments', async (req, res) => {
  try { res.json(await qa('SELECT * FROM departments ORDER BY name')); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/departments', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const did = id();
    await q('INSERT INTO departments (id,name,description) VALUES (?,?,?)', [did, name, description || '']);
    res.status(201).json({ id: did, name, description });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/departments/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, description, status } = req.body;
    await q('UPDATE departments SET name=COALESCE(?,name), description=COALESCE(?,description), status=COALESCE(?,status) WHERE id=?',
      [name||null, description||null, status||null, req.params.id]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// ROLES
// =============================================
app.get('/api/roles', async (req, res) => {
  try { res.json(await qa('SELECT * FROM roles ORDER BY name')); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/roles', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const rid = id();
    await q('INSERT INTO roles (id,name,description) VALUES (?,?,?)', [rid, name, description || '']);
    res.status(201).json({ id: rid, name, description });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// PPE ITEMS
// =============================================
app.get('/api/ppe-items', async (req, res) => {
  try { res.json(await qa('SELECT * FROM ppe_items WHERE active=1 ORDER BY name')); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ppe-items', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { name, display_name, icon } = req.body;
    if (!name || !display_name) return res.status(400).json({ error: 'name,display_name required' });
    const pid = id();
    await q('INSERT INTO ppe_items (id,name,display_name,icon) VALUES (?,?,?,?)', [pid, name.toLowerCase(), display_name, icon||'🔧']);
    res.status(201).json({ id: pid, name, display_name, icon });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// ROLE-DEPARTMENT PPE POLICY
// =============================================
app.get('/api/ppe-policy', async (req, res) => {
  // ?role_id=x&department_id=y
  try {
    const { role_id, department_id } = req.query;
    let sql = `SELECT rpr.*, pi.name as ppe_name, pi.display_name, pi.icon 
               FROM role_ppe_requirements rpr 
               JOIN ppe_items pi ON rpr.ppe_item_id = pi.id WHERE 1=1`;
    const params = [];
    if (role_id)       { sql += ' AND rpr.role_id=?';       params.push(role_id); }
    if (department_id) { sql += ' AND (rpr.department_id=? OR rpr.department_id IS NULL)'; params.push(department_id); }
    res.json(await qa(sql, params));
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/ppe-policy', authenticateToken, requireRole(['ADMIN','SAFETY_MANAGER']), async (req, res) => {
  // { role_id, department_id, ppe_item_ids[] }
  try {
    const { role_id, department_id, ppe_item_ids } = req.body;
    if (!role_id || !Array.isArray(ppe_item_ids)) return res.status(400).json({ error: 'role_id and ppe_item_ids required' });
    const c = await pool.getConnection();
    try {
      await c.beginTransaction();
      await c.execute('DELETE FROM role_ppe_requirements WHERE role_id=? AND (department_id=? OR (department_id IS NULL AND ? IS NULL))',
        [role_id, department_id||null, department_id||null]);
      for (const pid of ppe_item_ids) {
        await c.execute('INSERT IGNORE INTO role_ppe_requirements (id,role_id,department_id,ppe_item_id) VALUES (?,?,?,?)',
          [id(), role_id, department_id||null, pid]);
      }
      await c.commit();
      res.json({ success: true });
    } catch(e) { await c.rollback(); throw e; } finally { c.release(); }
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Resolve PPE requirements for employee
async function resolvePPERequirements(employee_id) {
  const rows = await qa(
    `SELECT pi.name FROM employee_ppe_requirements epr 
     JOIN ppe_items pi ON epr.ppe_item_id=pi.id 
     WHERE epr.employee_id=?`, [employee_id]);
  return rows.map(r => r.name);
}

// =============================================
// EMPLOYEES
// =============================================
app.get('/api/employees', authenticateToken, async (req, res) => {
  try {
    const rows = await qa(`SELECT e.*, r.name as role_name, d.name as department_name 
      FROM employees e LEFT JOIN roles r ON e.role_id=r.id LEFT JOIN departments d ON e.department_id=d.id 
      ORDER BY e.name`);
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Lookup by card_number (public — used by gate)
app.get('/api/employees/:code', async (req, res) => {
  try {
    const code = req.params.code.trim(); // Use exactly the string passed
    const emp = await q1(
      `SELECT e.*, d.name as department_name, d.id as department_id
       FROM employees e 
       LEFT JOIN departments d ON e.department_id=d.id 
       WHERE e.card_number=?`, [code]);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    emp.required_ppe = await resolvePPERequirements(emp.id);
    emp.is_exempt = emp.required_ppe.length === 0;
    res.json(emp);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/employees', authenticateToken, requireRole(['ADMIN','SAFETY_MANAGER']), async (req, res) => {
  try {
    const { card_number, name, category, department_id, ppe_item_ids } = req.body;
    if (!card_number || !name) return res.status(400).json({ error: 'card_number and name required' });
    const eid = id();
    const c = await pool.getConnection();
    try {
      await c.beginTransaction();
      await c.execute('INSERT INTO employees (id,card_number,name,category,department_id) VALUES (?,?,?,?,?)',
        [eid, card_number, name, category||null, department_id||null]);
      
      if (Array.isArray(ppe_item_ids)) {
        for (const pid of ppe_item_ids) {
          await c.execute('INSERT INTO employee_ppe_requirements (id, employee_id, ppe_item_id) VALUES (?,?,?)', [id(), eid, pid]);
        }
      }
      await c.commit();
      res.status(201).json({ id: eid, card_number, name });
    } catch(e) { await c.rollback(); throw e; } finally { c.release(); }
  } catch(e) { res.status(e.message.includes('Duplicate') ? 409 : 500).json({ error: e.message }); }
});

app.put('/api/employees/:id', authenticateToken, requireRole(['ADMIN','SAFETY_MANAGER']), async (req, res) => {
  try {
    const { name, card_number, category, department_id, status, ppe_item_ids } = req.body;
    const c = await pool.getConnection();
    try {
      await c.beginTransaction();
      
      // Update employee details
      await c.execute(
        'UPDATE employees SET name=COALESCE(?,name), card_number=COALESCE(?,card_number), category=COALESCE(?,category), department_id=COALESCE(?,department_id), status=COALESCE(?,status) WHERE id=?',
        [name||null, card_number||null, category||null, department_id||null, status||null, req.params.id]
      );

      // If PPE items provided, replace them completely
      if (Array.isArray(ppe_item_ids)) {
        await c.execute('DELETE FROM employee_ppe_requirements WHERE employee_id=?', [req.params.id]);
        for (const pid of ppe_item_ids) {
          await c.execute('INSERT INTO employee_ppe_requirements (id, employee_id, ppe_item_id) VALUES (?,?,?)', [id(), req.params.id, pid]);
        }
      }

      await c.commit();
      res.json({ success: true });
    } catch(e) { await c.rollback(); throw e; } finally { c.release(); }
  } catch(e) { res.status(e.message.includes('Duplicate') ? 409 : 500).json({ error: e.message }); }
});

// =============================================
// GATES
// =============================================
app.get('/api/gates', authenticateToken, async (req, res) => {
  try { res.json(await qa('SELECT * FROM gates')); }
  catch(e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// COMPLIANCE DECISION ENGINE (pure function)
// =============================================
function makeDecision(requiredPPE, detectedPPE) {
  if (!requiredPPE || requiredPPE.length === 0)
    return { decision: 'EXEMPT', missing: [], message: 'No PPE required for this role.', severity: null };
  const detected = new Set((detectedPPE || []).map(p => p.toLowerCase()));
  const missing = requiredPPE.filter(p => !detected.has(p.toLowerCase()));
  if (missing.length === 0)
    return { decision: 'ALLOW', missing: [], message: 'All PPE detected. Entry allowed.', severity: null };
  return {
    decision: 'HOLD',
    missing,
    message: `Missing: ${missing.join(', ')}. Correct within 30 minutes.`,
    severity: missing.length >= 2 ? 'HIGH' : 'MEDIUM',
  };
}

// =============================================
// GATE SCAN (main endpoint)
// =============================================
app.post('/api/gate/scan', async (req, res) => {
  const t0 = Date.now();
  try {
    const { employee_id, gate_id, detected_ppe, evidence_path, ai_inference_ms } = req.body;
    if (!employee_id || !gate_id) return res.status(400).json({ error: 'employee_id and gate_id required' });

    // 1. Fetch employee + policy
    const emp = await q1(
      `SELECT e.*, d.name as department_name, d.id as department_id
       FROM employees e LEFT JOIN departments d ON e.department_id=d.id
       WHERE e.card_number=?`, [employee_id]);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    const requiredPPE = await resolvePPERequirements(emp.id);
    const result = makeDecision(requiredPPE, detected_ppe || []);
    const now = new Date();

    // 2. Check for existing pending incident
    const existingInc = await q1(
      `SELECT * FROM compliance_incidents WHERE employee_id=? AND status='PENDING' ORDER BY created_at DESC LIMIT 1`,
      [emp.id]);

    let incidentId = null;
    let deadlineAt = null;

    if (result.decision === 'ALLOW' || result.decision === 'EXEMPT') {
      if (existingInc && result.decision === 'ALLOW') {
        await q('UPDATE compliance_incidents SET status=\'RESOLVED\', resolved_at=? WHERE id=?', [now, existingInc.id]);
        broadcast({ type: 'COMPLIANCE_RESOLVED', incident_id: existingInc.id, employee: emp.name });
      }
    } else if (result.decision === 'HOLD') {
      if (existingInc) {
        incidentId = existingInc.id;
        deadlineAt = existingInc.deadline_at;
      } else {
        const incNum = 'INC-' + String(100000 + Math.floor(Math.random() * 900000));
        incidentId = id();
        deadlineAt = new Date(now.getTime() + 30 * 60 * 1000);
        await q(`INSERT INTO compliance_incidents 
          (id,incident_number,employee_id,employee_code,employee_name,department_name,role_name,gate_id,detected_ppe,required_ppe,missing_ppe,severity,status,deadline_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'PENDING',?)`,
          [incidentId, incNum, emp.id, emp.card_number, emp.name,
           emp.department_name, emp.category, gate_id,
           JSON.stringify(detected_ppe||[]), JSON.stringify(requiredPPE),
           JSON.stringify(result.missing), result.severity, deadlineAt]);
        broadcast({ type: 'NEW_INCIDENT', employee: emp.name, missing: result.missing, incident_id: incidentId });
      }
    }

    const totalMs = Date.now() - t0;

    // 3. Write gate scan (history record)
    const scanId = 'scan-' + Date.now();
    await q(`INSERT INTO gate_scans 
      (id,gate_id,employee_id,employee_code,employee_name,department_name,role_name,required_ppe,detected_ppe,missing_ppe,compliance_status,incident_id,deadline_at,evidence_path,ai_inference_ms,total_ms)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [scanId, gate_id, emp.id, emp.card_number, emp.name,
       emp.department_name||'', emp.category||'',
       JSON.stringify(requiredPPE), JSON.stringify(detected_ppe||[]),
       JSON.stringify(result.missing), result.decision,
       incidentId, deadlineAt, evidence_path||null, ai_inference_ms||null, totalMs]);

    // 4. Build response
    let deadline_remaining_sec = null;
    if (deadlineAt) {
      deadline_remaining_sec = Math.max(0, Math.floor((new Date(deadlineAt) - now) / 1000));
    }

    const payload = {
      scan_id: scanId,
      employee: {
        id: emp.card_number, name: emp.name,
        role: emp.category, department: emp.department_name,
      },
      required_ppe: requiredPPE,
      detected_ppe: detected_ppe || [],
      missing_ppe: result.missing,
      decision: result.decision,
      message: result.message,
      severity: result.severity,
      incident: incidentId ? {
        id: incidentId,
        status: existingInc ? existingInc.status : 'PENDING',
        deadline: deadlineAt,
        deadline_remaining_sec,
      } : null,
      latency: { total_ms: totalMs, ai_inference_ms: ai_inference_ms || null },
      timestamp: now.toISOString(),
    };
    broadcast({ type: 'GATE_SCAN', scan: payload });
    res.status(201).json(payload);
  } catch(e) { console.error(e); res.status(500).json({ error: e.message }); }
});

// =============================================
// SCAN HISTORY
// =============================================
app.get('/api/gate/scans', authenticateToken, async (req, res) => {
  try {
    const { department, status, employee, date_from, date_to, missing_ppe, limit = 100 } = req.query;
    let sql = 'SELECT * FROM gate_scans WHERE 1=1';
    const params = [];
    if (department)  { sql += ' AND department_name=?'; params.push(department); }
    if (status)      { sql += ' AND compliance_status=?'; params.push(status); }
    if (employee)    { sql += ' AND (employee_code LIKE ? OR employee_name LIKE ?)'; params.push(`%${employee}%`, `%${employee}%`); }
    if (date_from)   { sql += ' AND timestamp >= ?'; params.push(date_from); }
    if (date_to)     { sql += ' AND timestamp <= ?'; params.push(date_to); }
    if (missing_ppe) { sql += ' AND JSON_CONTAINS(missing_ppe, JSON_QUOTE(?))'; params.push(missing_ppe); }
    sql += ' ORDER BY timestamp DESC LIMIT ?'; params.push(parseInt(limit));
    const rows = await qa(sql, params);
    rows.forEach(r => {
      r.required_ppe = jp(r.required_ppe);
      r.detected_ppe = jp(r.detected_ppe);
      r.missing_ppe  = jp(r.missing_ppe);
    });
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/gate/scans/:id', authenticateToken, async (req, res) => {
  try {
    const row = await q1('SELECT * FROM gate_scans WHERE id=?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    row.required_ppe = jp(row.required_ppe);
    row.detected_ppe = jp(row.detected_ppe);
    row.missing_ppe  = jp(row.missing_ppe);
    res.json(row);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// COMPLIANCE INCIDENTS
// =============================================
app.get('/api/gate/compliance-incidents', authenticateToken, async (req, res) => {
  try {
    // Auto-escalate expired before returning
    await q(`UPDATE compliance_incidents SET status='ESCALATED', escalation_status='AUTO', escalated_at=NOW() 
      WHERE status='PENDING' AND deadline_at < NOW()`);
    const rows = await qa('SELECT * FROM compliance_incidents ORDER BY created_at DESC LIMIT 200');
    const now = new Date();
    rows.forEach(r => {
      r.required_ppe = jp(r.required_ppe);
      r.detected_ppe = jp(r.detected_ppe);
      r.missing_ppe  = jp(r.missing_ppe);
      r.deadline_remaining_sec = r.deadline_at && r.status === 'PENDING'
        ? Math.max(0, Math.floor((new Date(r.deadline_at) - now) / 1000)) : null;
    });
    res.json(rows);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// DASHBOARD STATS
// =============================================
app.get('/api/gate/stats', authenticateToken, async (req, res) => {
  try {
    await q(`UPDATE compliance_incidents SET status='ESCALATED', escalation_status='AUTO', escalated_at=NOW() 
      WHERE status='PENDING' AND deadline_at < NOW()`);
    const [scan]  = await pool.execute(`SELECT COUNT(*) as total, SUM(compliance_status='ALLOW') as allowed, SUM(compliance_status='HOLD') as violations, SUM(compliance_status='EXEMPT') as exempt FROM gate_scans`);
    const [inc]   = await pool.execute(`SELECT SUM(status='PENDING') as pending, SUM(status='RESOLVED') as resolved, SUM(status='ESCALATED') as escalated FROM compliance_incidents`);
    const [today] = await pool.execute(`SELECT COUNT(*) as today FROM gate_scans WHERE DATE(timestamp)=CURDATE()`);
    res.json({
      total_scans:       scan[0].total      || 0,
      allowed:           scan[0].allowed    || 0,
      violations:        scan[0].violations || 0,
      exempt:            scan[0].exempt     || 0,
      pending_incidents: inc[0].pending     || 0,
      resolved_incidents:inc[0].resolved    || 0,
      escalated_incidents:inc[0].escalated  || 0,
      today_scans:       today[0].today     || 0,
    });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// =============================================
// HEALTH
// =============================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', db: 'MySQL/MariaDB', port: process.env.DB_PORT, uptime: process.uptime() });
});

// =============================================
// ESCALATION CHECKER (every 60s)
// =============================================
async function runEscalation() {
  try {
    const [result] = await pool.execute(
      `UPDATE compliance_incidents SET status='ESCALATED', escalation_status='AUTO', escalated_at=NOW() WHERE status='PENDING' AND deadline_at < NOW()`);
    if (result.affectedRows > 0) {
      console.log(`[Escalation] Auto-escalated ${result.affectedRows} incidents`);
      broadcast({ type: 'ESCALATION_UPDATE', count: result.affectedRows });
    }
  } catch(e) { console.error('[Escalation]', e.message); }
}
setInterval(runEscalation, 60000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Backend running on :${PORT} → MySQL ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`));

// server/admin_db.js
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const ADMIN_DB_PATH = path.resolve(__dirname, './admin_controls.db');

export function hashPassword(password, salt = null) {
    if (!salt) {
        salt = crypto.randomBytes(16).toString('hex');
    }
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    return { hash, salt };
}

export function verifyPassword(password, hash, salt) {
    if (!password || !hash || !salt) return false;
    const computed = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
    return computed === hash;
}

export const PRE_SEEDED_ACCOUNTS = [
    // 1. ADMIN: Souvik Saha
    {
        id: 'usr_adm_1001',
        username: 'ADM-1001',
        name: 'Souvik Saha',
        email: 'souvik.saha@raildrishti.gov.in',
        phone: '9876543101',
        password: 'Admin@RailDrishti2026',
        role: 'admin',
        identifier: 'ADM-1001',
        department: 'Railway Operations & Safety Directorate',
        designation: 'Principal System Administrator & Operations Director',
        status: 'active'
    },
    // 2. ADMIN: Neeraj Singh Gaira (Swapped to Admin)
    {
        id: 'usr_adm_1002',
        username: 'ADM-1002',
        name: 'Neeraj Singh Gaira',
        email: 'neeraj.gaira@raildrishti.gov.in',
        phone: '9876543102',
        password: 'Admin@RailDrishti2026',
        role: 'admin',
        identifier: 'ADM-1002',
        department: 'Operations & Traffic Control Directorate',
        designation: 'Executive Director (Operations & Traffic)',
        status: 'active'
    },
    // 3. CONTROLLER: Shriya M
    {
        id: 'usr_ctrl_2001',
        username: 'CTRL-SBC-01',
        name: 'Shriya M',
        email: 'shriya.m@raildrishti.gov.in',
        phone: '9876543201',
        password: 'Controller@RailDrishti2026',
        role: 'controller',
        identifier: 'CTRL-SBC-01',
        department: 'Operations & Traffic Control',
        designation: 'Senior Section Controller (Bengaluru Section - SBC)',
        status: 'active'
    },
    // 4. CONTROLLER: Rohit Roy (Swapped to Controller)
    {
        id: 'usr_ctrl_2002',
        username: 'CTRL-NDLS-02',
        name: 'Rohit Roy',
        email: 'rohit.roy@raildrishti.gov.in',
        phone: '9876543202',
        password: 'Controller@RailDrishti2026',
        role: 'controller',
        identifier: 'CTRL-NDLS-02',
        department: 'Operations & Traffic Control',
        designation: 'Traffic Dispatch & Section Controller (Northern Corridor)',
        status: 'active'
    },
    // 5. EMPLOYEE: Manas Kumar
    {
        id: 'usr_emp_5001',
        username: 'IR-2024-5001',
        name: 'Manas Kumar',
        email: 'manas.kumar@raildrishti.gov.in',
        phone: '9876543301',
        password: 'Employee@RailDrishti2026',
        role: 'employee',
        identifier: 'IR-2024-5001',
        department: 'Signal & Telecommunication (S&T)',
        designation: 'Senior Signal & Telecom Maintainer',
        status: 'active'
    },
    // 6. EMPLOYEE: Krutika Girennavar
    {
        id: 'usr_emp_5002',
        username: 'IR-2024-5002',
        name: 'Krutika Girennavar',
        email: 'krutika.g@raildrishti.gov.in',
        phone: '9876543302',
        password: 'Employee@RailDrishti2026',
        role: 'employee',
        identifier: 'IR-2024-5002',
        department: 'Operations & Traffic Control',
        designation: 'Assistant Station Master (ASM)',
        status: 'active'
    },
    // 7. PASSENGER DEMO
    {
        id: 'usr_pass_001',
        username: '9876543210',
        name: 'Amit Verma',
        email: 'passenger@raildrishti.gov.in',
        phone: '9876543210',
        password: 'User@RailDrishti2026',
        role: 'user',
        identifier: '9876543210',
        department: 'Public Passenger Services',
        designation: 'Passenger',
        status: 'active'
    }
];

export const SAMPLE_PENDING_APPLICATIONS = [
    {
        id: 'app_ir_6011',
        full_name: 'Sunil Verma',
        employee_id: 'IR-2024-6011',
        official_email: 'sunil.verma@raildrishti.gov.in',
        phone: '9876544001',
        department: 'Civil & Track Engineering',
        requested_role: 'employee',
        status: 'pending'
    },
    {
        id: 'app_ir_6012',
        full_name: 'Pooja Sharma',
        employee_id: 'IR-2024-6012',
        official_email: 'pooja.sharma@raildrishti.gov.in',
        phone: '9876544002',
        department: 'Mechanical & Rolling Stock',
        requested_role: 'employee',
        status: 'pending'
    },
    {
        id: 'app_ir_6013',
        full_name: 'Amitesh Sen',
        employee_id: 'IR-2024-6013',
        official_email: 'amitesh.sen@raildrishti.gov.in',
        phone: '9876544003',
        department: 'Operations & Traffic Control',
        requested_role: 'controller',
        status: 'pending'
    }
];

export function initializeAdminDatabase(adminDb, callback) {
    adminDb.serialize(() => {
        console.log('Initializing dedicated admin_controls.db tables...');

        // 1. admin_users Table
        adminDb.run(`CREATE TABLE IF NOT EXISTS admin_users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            phone TEXT,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL,
            identifier TEXT,
            department TEXT,
            designation TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 2. employee_applications Table
        adminDb.run(`CREATE TABLE IF NOT EXISTS employee_applications (
            id TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            employee_id TEXT NOT NULL,
            official_email TEXT NOT NULL,
            phone TEXT,
            department TEXT NOT NULL,
            requested_role TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            reviewed_at DATETIME,
            reviewed_by TEXT
        )`);

        // 3. Seed pre-provisioned accounts
        const userStmt = adminDb.prepare(`
            INSERT OR REPLACE INTO admin_users (
                id, username, name, email, phone, password_hash, salt, role,
                identifier, department, designation, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);

        PRE_SEEDED_ACCOUNTS.forEach(acc => {
            const { hash, salt } = hashPassword(acc.password);
            userStmt.run(
                acc.id,
                acc.username,
                acc.name,
                acc.email,
                acc.phone,
                hash,
                salt,
                acc.role,
                acc.identifier,
                acc.department,
                acc.designation,
                acc.status
            );
        });
        userStmt.finalize();

        // 4. Seed pending sample registrations if none exist
        adminDb.get('SELECT COUNT(*) as count FROM employee_applications', (err, row) => {
            if (!err && (!row || row.count === 0)) {
                const appStmt = adminDb.prepare(`
                    INSERT OR REPLACE INTO employee_applications (
                        id, full_name, employee_id, official_email, phone, department, requested_role, status, submitted_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
                `);
                SAMPLE_PENDING_APPLICATIONS.forEach(app => {
                    appStmt.run(
                        app.id,
                        app.full_name,
                        app.employee_id,
                        app.official_email,
                        app.phone,
                        app.department,
                        app.requested_role
                    );
                });
                appStmt.finalize();
                console.log('Seeded sample pending employee applications for admin approval.');
            }
            if (callback) callback();
        });
    });
}

// Standalone execution: node server/admin_db.js
if (process.argv[1] && process.argv[1].endsWith('admin_db.js')) {
    const adminDb = new sqlite3.Database(ADMIN_DB_PATH, (err) => {
        if (err) console.error('Failed to open admin_controls.db:', err.message);
        else {
            initializeAdminDatabase(adminDb, () => {
                console.log('admin_controls.db successfully initialized!');
                adminDb.close();
            });
        }
    });
}

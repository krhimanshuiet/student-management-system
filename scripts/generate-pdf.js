const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { COLLEGE_LOGO } = require("./logo-data.js");

const BASE = "http://localhost:3000";

async function takeScreenshots(browser) {
  const shots = {};

  // Login page (unauthenticated)
  const loginPage = await browser.newPage();
  await loginPage.setViewport({ width: 1440, height: 900 });
  await loginPage.goto(`${BASE}/login`, { waitUntil: "networkidle2" });
  shots.login = await loginPage.screenshot({ encoding: "base64" });
  await loginPage.close();

  // Authenticated pages
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Login
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2", timeout: 30000 });
  await page.waitForSelector('#username', { timeout: 10000 });
  await page.type('#username', "admin");
  await page.type('#password', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForFunction(
    () => !window.location.pathname.includes("/login"),
    { timeout: 30000 }
  );
  await new Promise((r) => setTimeout(r, 1000));

  const authPages = [
    { name: "dashboard", url: `${BASE}/dashboard` },
    { name: "students", url: `${BASE}/dashboard/students` },
    { name: "companies", url: `${BASE}/dashboard/companies` },
    { name: "training", url: `${BASE}/dashboard/training` },
    { name: "results", url: `${BASE}/dashboard/results` },
    { name: "reports", url: `${BASE}/dashboard/reports` },
  ];

  for (const p of authPages) {
    await page.goto(p.url, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1500));
    shots[p.name] = await page.screenshot({ encoding: "base64" });
    console.log(`  ✓ ${p.name}`);
  }

  await page.close();
  return shots;
}

function buildHTML(shots) {
  const img = (name) =>
    `data:image/png;base64,${shots[name]}`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; background: #fff; }

  .slide {
    width: 297mm;
    height: 210mm;
    page-break-after: always;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .slide:last-child { page-break-after: avoid; }

  /* ── Cover ── */
  .cover {
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%);
    color: white;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 10px;
    padding: 40px;
  }
  .cover .tag {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 20px;
    padding: 4px 16px;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .cover h1 {
    font-size: 34px;
    font-weight: 800;
    line-height: 1.15;
    max-width: 600px;
  }
  .cover p { font-size: 13px; opacity: 0.85; max-width: 500px; line-height: 1.6; }
  .cover .divider {
    width: 60px; height: 3px;
    background: rgba(255,255,255,0.5);
    border-radius: 2px;
    margin: 6px auto;
  }
  .cover .institution { font-size: 12px; opacity: 0.7; margin-top: 4px; }

  /* ── Section header ── */
  .slide-header {
    background: #1e3a8a;
    color: white;
    padding: 14px 32px;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }
  .slide-header .num {
    width: 28px; height: 28px;
    background: rgba(255,255,255,0.2);
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
  }
  .slide-header h2 { font-size: 17px; font-weight: 700; }

  /* ── Body ── */
  .slide-body {
    flex: 1;
    padding: 20px 32px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: hidden;
  }
  .slide-body p { font-size: 12px; line-height: 1.7; color: #374151; }

  /* ── Two-col layout ── */
  .two-col { flex-direction: row !important; gap: 20px; }
  .col { flex: 1; display: flex; flex-direction: column; gap: 8px; }

  /* ── Cards ── */
  .card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 16px;
  }
  .card h3 { font-size: 12px; font-weight: 700; color: #1e3a8a; margin-bottom: 4px; }
  .card p, .card li { font-size: 11px; color: #4b5563; line-height: 1.6; }
  .card ul { padding-left: 14px; }

  /* ── Team table ── */
  .team-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 4px; }
  .team-table th {
    background: #1e3a8a; color: white;
    padding: 8px 16px; text-align: left; font-size: 11px;
  }
  .team-table td { padding: 8px 16px; border-bottom: 1px solid #e2e8f0; }
  .team-table tr:nth-child(even) td { background: #f8fafc; }

  /* ── Tech stack table ── */
  .tech-table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .tech-table th {
    background: #1e3a8a; color: white;
    padding: 7px 14px; text-align: left;
  }
  .tech-table td { padding: 8px 14px; border-bottom: 1px solid #e2e8f0; }
  .tech-table tr:nth-child(even) td { background: #f8fafc; }
  .badge {
    display: inline-block;
    background: #dbeafe; color: #1e40af;
    border-radius: 4px; padding: 2px 8px;
    font-size: 10px; font-weight: 600;
  }

  /* ── Screenshot slide ── */
  .screenshot-slide .slide-body {
    padding: 12px 20px;
    align-items: center;
    justify-content: center;
  }
  .screenshot-slide img {
    max-width: 100%;
    max-height: 155mm;
    object-fit: contain;
    border-radius: 6px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    border: 1px solid #e2e8f0;
  }

  /* ── Objectives list ── */
  .obj-list { list-style: none; display: flex; flex-direction: column; gap: 7px; }
  .obj-list li {
    display: flex; align-items: flex-start; gap: 10px;
    font-size: 11.5px; color: #374151; line-height: 1.5;
  }
  .obj-list li::before {
    content: '';
    width: 8px; height: 8px; min-width: 8px;
    background: #2563eb; border-radius: 50%;
    margin-top: 4px;
  }

  /* ── Module grid ── */
  .module-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .module-card {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-left: 4px solid #2563eb;
    border-radius: 6px;
    padding: 10px 12px;
  }
  .module-card h4 { font-size: 11px; font-weight: 700; color: #1e3a8a; margin-bottom: 4px; }
  .module-card ul { list-style: none; display: flex; flex-direction: column; gap: 2px; }
  .module-card ul li { font-size: 10px; color: #4b5563; }
  .module-card ul li::before { content: '→ '; color: #2563eb; }

  /* ── Thank you ── */
  .thankyou {
    background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
    color: white;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 14px;
  }
  .thankyou h1 { font-size: 52px; font-weight: 800; }
  .thankyou p { font-size: 14px; opacity: 0.8; }
  .thankyou .guide {
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 8px;
    padding: 10px 24px;
    font-size: 12px;
    margin-top: 8px;
  }

  /* ── Slide number ── */
  .slide-num {
    position: absolute;
    bottom: 10px; right: 20px;
    font-size: 10px; color: #9ca3af;
  }
  .cover .slide-num { color: rgba(255,255,255,0.4); }
  .thankyou .slide-num { color: rgba(255,255,255,0.4); }
</style>
</head>
<body>

<!-- SLIDE 1: Cover -->
<div class="slide cover">
  <img src="${COLLEGE_LOGO}" alt="Sityog Institute of Technology Logo" style="width:100px;height:100px;object-fit:contain;border-radius:50%;background:white;padding:4px;box-shadow:0 4px 16px rgba(0,0,0,0.25);" />
  <div class="tag" style="margin-top:6px;">BCA Final Year Project — 2023–2026</div>
  <h1>Student Training Management System</h1>
  <div class="divider"></div>
  <p>A modern web-based application for managing student records, training programs, company placements, and academic results.</p>
  <div style="margin-top:12px; font-size:12px; opacity:0.75;">
    <div style="margin-bottom:4px;"><strong>Abhishek Kumar</strong> &nbsp;·&nbsp; <strong>Chirag Singh</strong> &nbsp;·&nbsp; <strong>Mohit Raj</strong> &nbsp;·&nbsp; <strong>Om Prakash Kumar</strong> &nbsp;·&nbsp; <strong>Anand Kumar Pal</strong></div>
    <div>Under the guidance of <strong>Mr. S.K Ojha</strong>, Assistant Professor</div>
  </div>
  <div class="institution">Sityog Institute of Technology, Aurangabad (Bihar) — Session 2023–2026</div>
  <div class="slide-num">1</div>
</div>

<!-- SLIDE 2: Team & Guide -->
<div class="slide">
  <div class="slide-header"><div class="num">2</div><h2>Team & Project Details</h2></div>
  <div class="slide-body">
    <p style="color:#6b7280;font-size:11px;">Department of Computer Application — Bachelor of Computer Application</p>
    <table class="team-table">
      <thead><tr><th>#</th><th>Name</th><th>Registration No.</th><th>Role</th></tr></thead>
      <tbody>
        <tr><td>1</td><td><strong>Abhishek Kumar</strong></td><td>23303106037</td><td>Full Stack Development</td></tr>
        <tr><td>2</td><td><strong>Anand Kumar Pal</strong></td><td>23303106005</td><td>Frontend Development</td></tr>
        <tr><td>3</td><td><strong>Chirag Singh</strong></td><td>23303106010</td><td>Database & Backend</td></tr>
        <tr><td>4</td><td><strong>Mohit Raj</strong></td><td>23303106022</td><td>UI/UX Design</td></tr>
        <tr><td>5</td><td><strong>Om Prakash Kumar</strong></td><td>23303106053</td><td>Testing & Documentation</td></tr>
      </tbody>
    </table>
    <div class="card" style="margin-top:8px;">
      <h3>Project Guide</h3>
      <p><strong>Mr. S.K Ojha</strong> — Assistant Professor, Department of Computer Application<br/>Sityog Institute of Technology, Growth Centre, Jasoiya More, Aurangabad (Bihar) – 824101</p>
    </div>
  </div>
</div>

<!-- SLIDE 3: Introduction -->
<div class="slide">
  <div class="slide-header"><div class="num">3</div><h2>Introduction</h2></div>
  <div class="slide-body two-col">
    <div class="col">
      <div class="card">
        <h3>What is this system?</h3>
        <p>The Student Training Management System is a web-based application designed to efficiently maintain and manage student records in colleges, universities, and training institutes.</p>
      </div>
      <div class="card">
        <h3>What problem does it solve?</h3>
        <p>Educational institutions traditionally maintain records manually — which is time-consuming, error-prone, and difficult to update. This system provides a centralized digital platform to overcome those challenges.</p>
      </div>
    </div>
    <div class="col">
      <div class="card">
        <h3>What does it manage?</h3>
        <ul>
          <li>Personal and academic details of students</li>
          <li>Company and placement information</li>
          <li>Training and internship records</li>
          <li>Academic results and grades</li>
          <li>Comprehensive reports for all modules</li>
        </ul>
      </div>
      <div class="card">
        <h3>Key Benefits</h3>
        <ul>
          <li>Reduces paperwork and manual effort</li>
          <li>Centralised and secure data storage</li>
          <li>Quick search and retrieval</li>
          <li>Accessible from any browser</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<!-- SLIDE 4: Objectives -->
<div class="slide">
  <div class="slide-header"><div class="num">4</div><h2>Objectives</h2></div>
  <div class="slide-body">
    <ul class="obj-list">
      <li><strong>Student Record Management</strong> — Maintain and manage student personal details, academic records, training details, and project information in a centralised database.</li>
      <li><strong>Training & Company Management</strong> — Store and manage information related to training programs, companies, internships, and placement activities.</li>
      <li><strong>Efficient Search & Retrieval</strong> — Provide facilities for quick searching, updating, and retrieval of student and training records whenever required.</li>
      <li><strong>Project & Result Tracking</strong> — Maintain records of student projects, training outcomes, and academic results for effective monitoring.</li>
      <li><strong>Report Generation</strong> — Generate various reports including student reports, training records, result summaries, and individual student profiles.</li>
      <li><strong>Secure Access Control</strong> — Implement authentication mechanisms so only authorised administrators can access and modify sensitive data.</li>
    </ul>
  </div>
</div>

<!-- SLIDE 5: Tech Stack -->
<div class="slide">
  <div class="slide-header"><div class="num">5</div><h2>Technology Stack</h2></div>
  <div class="slide-body two-col">
    <div class="col">
      <table class="tech-table">
        <thead><tr><th>Layer</th><th>Technology</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td><strong>Framework</strong></td><td><span class="badge">Next.js 16</span></td><td>Full-stack React framework</td></tr>
          <tr><td><strong>Language</strong></td><td><span class="badge">TypeScript</span></td><td>Type-safe development</td></tr>
          <tr><td><strong>Styling</strong></td><td><span class="badge">Tailwind CSS</span></td><td>Utility-first CSS framework</td></tr>
          <tr><td><strong>UI Components</strong></td><td><span class="badge">shadcn/ui</span></td><td>Modern component library</td></tr>
          <tr><td><strong>Database</strong></td><td><span class="badge">PostgreSQL</span></td><td>Relational data storage</td></tr>
          <tr><td><strong>Cloud DB</strong></td><td><span class="badge">Neon DB</span></td><td>Serverless PostgreSQL</td></tr>
          <tr><td><strong>ORM</strong></td><td><span class="badge">Prisma 7</span></td><td>Database access layer</td></tr>
          <tr><td><strong>Auth</strong></td><td><span class="badge">NextAuth v5</span></td><td>Session management</td></tr>
        </tbody>
      </table>
    </div>
    <div class="col">
      <div class="card">
        <h3>Why Next.js over VB.NET?</h3>
        <ul>
          <li>Works on all platforms (macOS, Windows, Linux)</li>
          <li>Web-based — accessible from any browser</li>
          <li>Modern, industry-relevant stack</li>
          <li>Aligns with Recommendation #1 in our synopsis (web-based upgrade)</li>
        </ul>
      </div>
      <div class="card">
        <h3>Why Neon DB over SQL Server?</h3>
        <ul>
          <li>Free serverless PostgreSQL — no setup needed</li>
          <li>Scales automatically</li>
          <li>Works seamlessly with Prisma ORM</li>
          <li>PostgreSQL is industry standard</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<!-- SLIDE 6: System Modules -->
<div class="slide">
  <div class="slide-header"><div class="num">6</div><h2>System Modules</h2></div>
  <div class="slide-body">
    <div class="module-grid">
      <div class="module-card">
        <h4>🔐 Authentication</h4>
        <ul><li>Admin login/logout</li><li>JWT session management</li><li>Route protection</li><li>Credential validation</li></ul>
      </div>
      <div class="module-card">
        <h4>📊 Dashboard</h4>
        <ul><li>Summary statistics</li><li>Total students/companies</li><li>Training & result counts</li><li>Recent student records</li></ul>
      </div>
      <div class="module-card">
        <h4>🎓 Student Module</h4>
        <ul><li>Search by name / roll no.</li><li>Add / edit / delete records</li><li>View individual profile</li><li>Training & result history</li></ul>
      </div>
      <div class="module-card">
        <h4>🏢 Company Module</h4>
        <ul><li>Search by company name</li><li>Add / edit / delete records</li><li>Contact & industry info</li><li>Placement tracking</li></ul>
      </div>
      <div class="module-card">
        <h4>📋 Training Module</h4>
        <ul><li>Search by student name</li><li>Add / edit / delete records</li><li>Status: Ongoing / Completed</li><li>Project description</li></ul>
      </div>
      <div class="module-card">
        <h4>📈 Results Module</h4>
        <ul><li>Search by student name</li><li>Add / edit / delete records</li><li>Marks & grade tracking</li><li>Semester-wise records</li></ul>
      </div>
    </div>
    <div class="card" style="margin-top:10px; flex-direction:row; display:flex; align-items:center; gap:16px; padding:10px 16px;">
      <div style="font-size:11px; color:#374151;"><strong>Reports Module</strong> — View all students, companies, training records, and results in a single consolidated page with summary statistics.</div>
    </div>
  </div>
</div>

<!-- SLIDE 7: Screenshot — Login -->
<div class="slide screenshot-slide">
  <div class="slide-header"><div class="num">7</div><h2>Login Page</h2></div>
  <div class="slide-body">
    <img src="${img("login")}" alt="Login Page" />
  </div>
</div>

<!-- SLIDE 8: Screenshot — Dashboard -->
<div class="slide screenshot-slide">
  <div class="slide-header"><div class="num">8</div><h2>Dashboard — Overview & Statistics</h2></div>
  <div class="slide-body">
    <img src="${img("dashboard")}" alt="Dashboard" />
  </div>
</div>

<!-- SLIDE 9: Screenshot — Students -->
<div class="slide screenshot-slide">
  <div class="slide-header"><div class="num">9</div><h2>Student Module — Records Management</h2></div>
  <div class="slide-body">
    <img src="${img("students")}" alt="Students Module" />
  </div>
</div>

<!-- SLIDE 10: Screenshot — Companies -->
<div class="slide screenshot-slide">
  <div class="slide-header"><div class="num">10</div><h2>Company Module — Placement Records</h2></div>
  <div class="slide-body">
    <img src="${img("companies")}" alt="Companies Module" />
  </div>
</div>

<!-- SLIDE 11: Screenshot — Training -->
<div class="slide screenshot-slide">
  <div class="slide-header"><div class="num">11</div><h2>Training Module — Internship Tracking</h2></div>
  <div class="slide-body">
    <img src="${img("training")}" alt="Training Module" />
  </div>
</div>

<!-- SLIDE 12: Screenshot — Results -->
<div class="slide screenshot-slide">
  <div class="slide-header"><div class="num">12</div><h2>Results Module — Academic Performance</h2></div>
  <div class="slide-body">
    <img src="${img("results")}" alt="Results Module" />
  </div>
</div>

<!-- SLIDE 13: Screenshot — Reports -->
<div class="slide screenshot-slide">
  <div class="slide-header"><div class="num">13</div><h2>Reports Module — Consolidated View</h2></div>
  <div class="slide-body">
    <img src="${img("reports")}" alt="Reports Module" />
  </div>
</div>

<!-- SLIDE 14: Database Design -->
<div class="slide">
  <div class="slide-header"><div class="num">14</div><h2>Database Design</h2></div>
  <div class="slide-body two-col">
    <div class="col">
      <div class="card">
        <h3>Admin Table</h3>
        <ul><li>id, username, password, createdAt</li></ul>
      </div>
      <div class="card">
        <h3>Student Table</h3>
        <ul><li>id, rollNo (unique), name, email</li><li>phone, address, course, year</li><li>createdAt, updatedAt</li></ul>
      </div>
      <div class="card">
        <h3>Company Table</h3>
        <ul><li>id, name (unique), industry</li><li>location, contactPerson</li><li>email, phone, createdAt</li></ul>
      </div>
    </div>
    <div class="col">
      <div class="card">
        <h3>Training Table</h3>
        <ul><li>id, studentId (FK), companyId (FK)</li><li>projectName, startDate, endDate</li><li>status, description</li></ul>
      </div>
      <div class="card">
        <h3>Result Table</h3>
        <ul><li>id, studentId (FK)</li><li>subject, marks, maxMarks, grade</li><li>semester, year</li></ul>
      </div>
      <div class="card">
        <h3>Relationships</h3>
        <ul><li>Student → Training (one-to-many)</li><li>Company → Training (one-to-many)</li><li>Student → Result (one-to-many)</li><li>Cascade delete on Student/Company</li></ul>
      </div>
    </div>
  </div>
</div>

<!-- SLIDE 15: Key Features & Future Scope -->
<div class="slide">
  <div class="slide-header"><div class="num">15</div><h2>Key Features & Future Scope</h2></div>
  <div class="slide-body two-col">
    <div class="col">
      <div class="card">
        <h3>Key Features Implemented</h3>
        <ul>
          <li>Secure admin authentication with JWT</li>
          <li>Full CRUD for all 4 modules</li>
          <li>Real-time search and filtering</li>
          <li>Skeleton loading states for better UX</li>
          <li>Side drawer for add/edit forms</li>
          <li>Individual student profile with history</li>
          <li>Consolidated reports page</li>
          <li>Cloud PostgreSQL (Neon DB)</li>
          <li>Responsive modern UI with shadcn/ui</li>
        </ul>
      </div>
    </div>
    <div class="col">
      <div class="card">
        <h3>Future Scope (Recommendations)</h3>
        <ul>
          <li>Role-based access (Admin, Faculty, Student)</li>
          <li>Email/SMS notification system</li>
          <li>Mobile application support</li>
          <li>Online result viewing for students</li>
          <li>Placement & internship tracking dashboard</li>
          <li>PDF export for individual reports</li>
          <li>Attendance management module</li>
          <li>Multi-campus support</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<!-- SLIDE 16: Thank You -->
<div class="slide thankyou">
  <h1>Thank You</h1>
  <p>Student Training Management System</p>
  <div class="divider" style="width:60px;height:3px;background:rgba(255,255,255,0.4);border-radius:2px;margin:4px auto;"></div>
  <div class="guide">
    <strong>Under the Guidance of</strong><br/>
    Mr. S.K Ojha — Assistant Professor<br/>
    Sityog Institute of Technology, Aurangabad (Bihar)
  </div>
  <p style="margin-top:8px;font-size:11px;opacity:0.6;">Department of Computer Application &nbsp;·&nbsp; Session 2023–2026</p>
  <div class="slide-num">16</div>
</div>

</body>
</html>`;
}

async function main() {
  console.log("Taking screenshots...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  let shots;
  try {
    shots = await takeScreenshots(browser);
  } finally {
    await browser.close();
  }

  console.log("Building presentation HTML...");
  const html = buildHTML(shots);

  console.log("Generating PDF...");
  const pdfBrowser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const pdfPage = await pdfBrowser.newPage();
  await pdfPage.setContent(html, { waitUntil: "networkidle0" });

  const outPath = path.join(__dirname, "..", "Student_Management_System_Presentation.pdf");
  await pdfPage.pdf({
    path: outPath,
    format: "A4",
    landscape: true,
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  await pdfBrowser.close();
  console.log(`\n✅ PDF saved to: ${outPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });

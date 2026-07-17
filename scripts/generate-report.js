const puppeteer = require("puppeteer");
const path = require("path");
const { COLLEGE_LOGO } = require("./logo-data.js");

const BASE = "http://localhost:3000";

async function takeScreenshots(browser) {
  const shots = {};
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto(`${BASE}/login`, { waitUntil: "networkidle2", timeout: 30000 });
  await page.waitForSelector("#username", { timeout: 10000 });
  await page.type("#username", "admin");
  await page.type("#password", "admin123");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => !window.location.pathname.includes("/login"), { timeout: 30000 });
  await new Promise((r) => setTimeout(r, 1000));

  const pages = [
    { name: "dashboard", url: `${BASE}/dashboard` },
    { name: "students", url: `${BASE}/dashboard/students` },
    { name: "companies", url: `${BASE}/dashboard/companies` },
    { name: "training", url: `${BASE}/dashboard/training` },
    { name: "results", url: `${BASE}/dashboard/results` },
    { name: "reports", url: `${BASE}/dashboard/reports` },
  ];
  for (const p of pages) {
    await page.goto(p.url, { waitUntil: "networkidle2" });
    await new Promise((r) => setTimeout(r, 1500));
    shots[p.name] = await page.screenshot({ encoding: "base64" });
    console.log(`  ✓ ${p.name}`);
  }
  await page.close();
  return shots;
}

const I = (shots, name) => `data:image/png;base64,${shots[name]}`;

const STUDENTS = [
  { name: "Abhishek Kumar", reg: "23303106037" },
  { name: "Anand Kumar Pal", reg: "23303106005" },
  { name: "Chirag Singh", reg: "23303106010" },
  { name: "Mohit Raj", reg: "23303106022" },
  { name: "Om Prakash Kumar", reg: "23303106053" },
];

const studentRows = STUDENTS.map(
  (s) => `<div class="sr"><span>${s.name}</span><span>${s.reg}</span></div>`
).join("");

const studentList5 = STUDENTS.map(
  (s, i) => `<tr><td>${i + 1}</td><td><strong>${s.name}</strong></td><td>${s.reg}</td></tr>`
).join("");

function buildHTML(shots) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4 portrait; margin: 25mm 20mm 20mm 30mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', Georgia, serif; font-size: 12pt; line-height: 1.6; color: #000; }

  .page { page-break-after: always; min-height: 240mm; }
  .page:last-child { page-break-after: avoid; }

  /* Cover */
  .cover { display:flex; flex-direction:column; align-items:center; text-align:center; justify-content:space-between; min-height:240mm; padding:8mm 0; }
  .cover img { width:90px; height:90px; object-fit:contain; }
  .cover .inst { font-size:15pt; font-weight:bold; text-transform:uppercase; margin-top:8px; }
  .cover .addr { font-size:10pt; margin-top:2px; }
  .cover .dept-line { font-size:11pt; font-weight:bold; margin-top:6px; text-transform:uppercase; }
  .cover .report-on { font-size:13pt; margin-top:10px; }
  .cover .topic { font-size:16pt; font-weight:bold; text-transform:uppercase; border-top:2px solid #000; border-bottom:2px solid #000; padding:8px 16px; margin:10px 0; }
  .cover .partial { font-size:10.5pt; max-width:360px; line-height:1.7; }
  .cover .degree { font-size:13pt; font-weight:bold; margin-top:6px; }
  .cover .submit-wrap { display:flex; justify-content:space-between; width:100%; text-align:left; font-size:10.5pt; gap:20px; margin-top:10px; }
  .cover .submit-wrap h4 { font-size:11pt; font-weight:bold; text-decoration:underline; margin-bottom:6px; }
  .cover .submit-wrap p { margin:2px 0; line-height:1.6; }
  .cover .footer { font-size:11pt; font-weight:bold; line-height:2; text-align:center; border-top:1px solid #000; padding-top:10px; width:100%; }

  /* Formal pages */
  .ptitle { font-size:16pt; font-weight:bold; text-align:center; text-decoration:underline; text-transform:uppercase; margin-bottom:18px; letter-spacing:1px; }
  p { font-size:12pt; line-height:1.8; margin-bottom:10px; text-align:justify; }
  .sr { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #ddd; font-size:11pt; }
  .sr span:first-child { font-weight:bold; }
  .meta { font-size:11pt; margin-top:8px; }
  .sig-row { display:flex; justify-content:space-between; margin-top:40px; }
  .sig-row .s { flex:1; text-align:center; }
  .sig-row .s .ln { border-top:1px solid #000; margin:0 15px 4px; }
  .sig-row .s p { font-size:10.5pt; }

  /* TOC / LOF / LOT */
  .tbl { width:100%; border-collapse:collapse; font-size:11pt; margin-top:10px; }
  .tbl th { background:#222; color:#fff; padding:7px 10px; text-align:left; }
  .tbl td { padding:6px 10px; border-bottom:1px solid #ccc; vertical-align:top; }
  .tbl tr:nth-child(even) td { background:#f5f5f5; }
  .tbl .cr td { font-weight:bold; background:#ddd !important; }

  /* Chapter */
  .ch-title { font-size:15pt; font-weight:bold; border-bottom:2px solid #000; padding-bottom:6px; margin-bottom:16px; }
  .ch-title span { font-size:11pt; display:block; color:#444; margin-bottom:2px; }
  h2 { font-size:13pt; font-weight:bold; margin:16px 0 7px; text-decoration:underline; }
  h3 { font-size:12pt; font-weight:bold; margin:12px 0 5px; }
  ul, ol { margin:6px 0 12px 22px; }
  li { font-size:12pt; line-height:1.7; margin-bottom:3px; }

  /* Data tables */
  .dt { width:100%; border-collapse:collapse; margin:10px 0 18px; font-size:10.5pt; }
  .dt th { background:#333; color:#fff; padding:7px 9px; text-align:left; }
  .dt td { padding:6px 9px; border:1px solid #ccc; vertical-align:top; }
  .dt tr:nth-child(even) td { background:#f9f9f9; }
  .cap { text-align:center; font-size:10.5pt; font-style:italic; margin-bottom:4px; }

  /* Screenshots */
  .ss { text-align:center; margin:14px 0; }
  .ss img { max-width:100%; border:1px solid #bbb; box-shadow:0 2px 6px rgba(0,0,0,0.1); }
  .ss .fc { font-size:10.5pt; font-style:italic; margin-top:5px; }

  /* Arch box */
  .arch { border:1px solid #999; padding:16px; background:#f8f8f8; font-family:monospace; font-size:9.5pt; line-height:1.9; margin:10px 0 16px; }

  /* References */
  .refs ol { margin-left:18px; }
  .refs li { font-size:11.5pt; line-height:1.7; margin-bottom:8px; text-align:justify; }
</style>
</head>
<body>

<!-- ============ PAGE 1: COVER ============ -->
<div class="page">
<div class="cover">
  <div>
    <img src="${COLLEGE_LOGO}" alt="Logo" /><br/>
    <div class="inst">Sityog Institute of Technology</div>
    <div class="addr">Growth Centre, Jasoiya More, Aurangabad, Bihar – 824101</div>
    <div class="dept-line">Department of Computer Application</div>
  </div>
  <div>
    <div class="report-on">Report on</div>
    <div class="topic">Student Training Management System</div>
    <div class="partial">This report is submitted in partial fulfilment of the requirements for the award of the degree</div>
    <div class="degree">Bachelor of Computer Application</div>
  </div>
  <div class="submit-wrap">
    <div>
      <h4>Submitted by:</h4>
      ${STUDENTS.map((s) => `<p><strong>${s.name}</strong><br/>${s.reg}</p><br/>`).join("")}
    </div>
    <div>
      <h4>Submitted to:</h4>
      <p><strong>Mr. S.K Ojha</strong></p>
      <p>Assistant Professor</p>
      <p>Department of Computer Applications</p>
      <p>SITYOG Institute of Technology</p>
    </div>
  </div>
  <div class="footer">
    DEPARTMENT OF COMPUTER APPLICATION<br/>
    SITYOG INSTITUTE OF TECHNOLOGY, AURANGABAD, BIHAR – 824101<br/>
    JULY 2025
  </div>
</div>
</div>

<!-- ============ PAGE 2: DECLARATION ============ -->
<div class="page">
  <div class="ptitle">Declaration Certificate</div>
  <p>
    This is to certify the work presented in the Project Report in
    "<strong>Student Training Management System</strong>", in partial fulfilment of the
    requirement for the award of Degree of Bachelor of Computer Application of
    SITYOG Institute of Technology, Aurangabad, is an authentic work carried out
    by us under the supervision of <strong>Mr. S.K Ojha</strong>, Assistant Professor,
    Department of Computer Applications.
  </p>
  <p>
    To the best of our knowledge, the content of this report does not form a basis
    for the award of any previous Degree to anyone else.
  </p>
  <br/><p>Date: ……………………….</p><br/><br/>
  ${studentRows}
  <div class="meta"><strong>Branch:</strong> Bachelor of Computer Application</div>
  <div class="meta"><strong>Semester:</strong> 6th</div>
  <div class="meta"><strong>Year:</strong> 2025–26</div>
  <br/><br/><br/><br/>
  <div style="border-top:1px solid #000;padding-top:6px;max-width:200px;font-size:11pt;">Project Supervisor</div>
</div>

<!-- ============ PAGE 3: CERTIFICATE OF APPROVAL ============ -->
<div class="page">
  <div class="ptitle">Certificate of Approval</div>
  <p>
    The foregoing Project REPORT on "<strong>Student Training Management System</strong>"
    is hereby approved as a creditable study of Project report and has been presented
    in satisfactory manner to warrant its acceptance as prerequisite to the degree
    for which it has been submitted.
  </p>
  <p>
    It is understood that by this undersigned do not necessarily endorse any conclusion
    drawn or opinion expressed therein, but approve the report for the purpose for
    which it is submitted.
  </p>
  <br/>
  ${studentRows}
  <div class="meta"><strong>Branch:</strong> Bachelor of Computer Application</div>
  <div class="meta"><strong>Semester:</strong> 6th</div>
  <div class="meta"><strong>Year:</strong> 2025–26</div>
  <div class="sig-row">
    <div class="s"><div class="ln"></div><p>Internal Examiner</p></div>
    <div class="s"><div class="ln"></div><p>External Examiner</p></div>
    <div class="s"><div class="ln"></div><p>Head of Department</p></div>
  </div>
</div>

<!-- ============ PAGE 4: ACKNOWLEDGEMENT ============ -->
<div class="page">
  <div class="ptitle">Acknowledgement</div>
  <p>
    We express our sincere gratitude to our project guide, <strong>Mr. S.K Ojha</strong>,
    Assistant Professor, Department of Computer Applications, Sityog Institute of
    Technology, Aurangabad, for his invaluable guidance, constant encouragement,
    and constructive feedback throughout the development of this project. His expertise
    and dedication have been a constant source of inspiration for us.
  </p>
  <p>
    We extend our heartfelt thanks to the <strong>Head of the Department</strong>,
    Department of Computer Applications, Sityog Institute of Technology, for providing
    the necessary resources and facilities to complete this project successfully.
  </p>
  <p>
    We are deeply indebted to the <strong>Principal and Management</strong> of Sityog
    Institute of Technology for their continuous support and for providing an excellent
    academic environment that made this work possible.
  </p>
  <p>
    We also thank our fellow students and friends who provided valuable suggestions
    and moral support during the course of this project. Their insights helped us
    improve the quality of the final outcome.
  </p>
  <p>
    Finally, we would like to thank our <strong>families</strong> for their unwavering
    love, patience, and encouragement throughout our academic journey. Without their
    support, this work would not have been possible.
  </p>
  <br/>
  ${studentRows}
</div>

<!-- ============ PAGE 5: TABLE OF CONTENTS ============ -->
<div class="page">
  <div class="ptitle">Table of Contents</div>
  <table class="tbl">
    <thead><tr><th>Chapter</th><th>Topic</th><th>Page No.</th></tr></thead>
    <tbody>
      <tr><td></td><td>Declaration Certificate</td><td>ii</td></tr>
      <tr><td></td><td>Certificate of Approval</td><td>iii</td></tr>
      <tr><td></td><td>Acknowledgement</td><td>iv</td></tr>
      <tr><td></td><td>List of Figures</td><td>vi</td></tr>
      <tr><td></td><td>List of Tables</td><td>vii</td></tr>
      <tr class="cr"><td>1</td><td>Introduction</td><td>1</td></tr>
      <tr><td>1.1</td><td>Background</td><td>1</td></tr>
      <tr><td>1.2</td><td>Problem Statement</td><td>2</td></tr>
      <tr><td>1.3</td><td>Objectives</td><td>2</td></tr>
      <tr><td>1.4</td><td>Scope of the Project</td><td>3</td></tr>
      <tr class="cr"><td>2</td><td>Literature Review</td><td>4</td></tr>
      <tr><td>2.1</td><td>Existing Systems</td><td>4</td></tr>
      <tr><td>2.2</td><td>Proposed System</td><td>5</td></tr>
      <tr><td>2.3</td><td>Comparison of Systems</td><td>6</td></tr>
      <tr class="cr"><td>3</td><td>System Analysis and Requirements</td><td>7</td></tr>
      <tr><td>3.1</td><td>Feasibility Study</td><td>7</td></tr>
      <tr><td>3.2</td><td>Functional Requirements</td><td>8</td></tr>
      <tr><td>3.3</td><td>Non-Functional Requirements</td><td>9</td></tr>
      <tr><td>3.4</td><td>Use Case Description</td><td>9</td></tr>
      <tr class="cr"><td>4</td><td>System Design</td><td>11</td></tr>
      <tr><td>4.1</td><td>System Architecture</td><td>11</td></tr>
      <tr><td>4.2</td><td>Database Design</td><td>12</td></tr>
      <tr><td>4.3</td><td>Module Design</td><td>13</td></tr>
      <tr class="cr"><td>5</td><td>Implementation</td><td>14</td></tr>
      <tr><td>5.1</td><td>Technology Stack</td><td>14</td></tr>
      <tr><td>5.2</td><td>Module Screenshots</td><td>15</td></tr>
      <tr class="cr"><td>6</td><td>Testing</td><td>20</td></tr>
      <tr><td>6.1</td><td>Testing Strategy</td><td>20</td></tr>
      <tr><td>6.2</td><td>Test Cases</td><td>21</td></tr>
      <tr class="cr"><td>7</td><td>Conclusion and Future Scope</td><td>23</td></tr>
      <tr><td>7.1</td><td>Conclusion</td><td>23</td></tr>
      <tr><td>7.2</td><td>Future Scope</td><td>24</td></tr>
      <tr><td></td><td>References</td><td>25</td></tr>
    </tbody>
  </table>
</div>

<!-- ============ PAGE 6: LIST OF FIGURES ============ -->
<div class="page">
  <div class="ptitle">List of Figures</div>
  <table class="tbl">
    <thead><tr><th>Figure No.</th><th>Figure Name</th><th>Page No.</th></tr></thead>
    <tbody>
      <tr><td>4.1</td><td>System Architecture – Three-Tier Web Application</td><td>11</td></tr>
      <tr><td>5.1</td><td>Login Page</td><td>15</td></tr>
      <tr><td>5.2</td><td>Dashboard – Overview and Statistics</td><td>16</td></tr>
      <tr><td>5.3</td><td>Student Module – Records Management</td><td>17</td></tr>
      <tr><td>5.4</td><td>Company Module – Placement Records</td><td>17</td></tr>
      <tr><td>5.5</td><td>Training Module – Internship Tracking</td><td>18</td></tr>
      <tr><td>5.6</td><td>Results Module – Academic Performance</td><td>19</td></tr>
      <tr><td>5.7</td><td>Reports Module – Consolidated View</td><td>19</td></tr>
    </tbody>
  </table>
  <br/><br/>
  <div class="ptitle" style="margin-top:20px;">List of Tables</div>
  <table class="tbl">
    <thead><tr><th>Table No.</th><th>Table Name</th><th>Page No.</th></tr></thead>
    <tbody>
      <tr><td>2.1</td><td>Comparison of Existing and Proposed Systems</td><td>6</td></tr>
      <tr><td>3.1</td><td>Functional Requirements</td><td>8</td></tr>
      <tr><td>3.2</td><td>Non-Functional Requirements</td><td>9</td></tr>
      <tr><td>3.3</td><td>Use Case Table – Admin</td><td>10</td></tr>
      <tr><td>4.1</td><td>Student Table Schema</td><td>12</td></tr>
      <tr><td>4.2</td><td>Company Table Schema</td><td>12</td></tr>
      <tr><td>4.3</td><td>Training Table Schema</td><td>13</td></tr>
      <tr><td>4.4</td><td>Result Table Schema</td><td>13</td></tr>
      <tr><td>5.1</td><td>Technology Stack Details</td><td>14</td></tr>
      <tr><td>6.1</td><td>Test Cases – Authentication Module</td><td>21</td></tr>
      <tr><td>6.2</td><td>Test Cases – Student Module</td><td>21</td></tr>
      <tr><td>6.3</td><td>Test Cases – Company &amp; Training Modules</td><td>22</td></tr>
    </tbody>
  </table>
</div>

<!-- ============ PAGE 7: CHAPTER 1 – INTRODUCTION ============ -->
<div class="page">
  <div class="ch-title"><span>Chapter 1</span>Introduction</div>
  <h2>1.1 Background</h2>
  <p>
    The rapid advancement of information technology has transformed the way educational
    institutions manage their administrative and academic functions. Traditionally,
    student records, training programmes, and academic results were maintained manually
    through paper registers and spreadsheets — methods that are time-consuming, error-prone,
    and difficult to retrieve quickly.
  </p>
  <p>
    In the context of technical and professional education, managing training and
    internship records is particularly challenging. Students are placed with various
    companies as part of their curriculum, and keeping track of each student's training
    status, project, company, and performance requires a well-organised system.
  </p>
  <p>
    The <strong>Student Training Management System</strong> is developed to address these
    challenges by providing a centralised, web-based platform for managing student
    personal details, company information, training records, and academic results.
  </p>
  <h2>1.2 Problem Statement</h2>
  <p>The following problems were identified at educational institutions like Sityog Institute of Technology:</p>
  <ul>
    <li>Manual record-keeping is slow and error-prone; data retrieval is tedious.</li>
    <li>No centralised system exists to track which students are training with which companies.</li>
    <li>Academic results are stored separately without link to training records.</li>
    <li>Generating consolidated reports is laborious and time-consuming.</li>
    <li>No secure authentication to prevent unauthorised access to student data.</li>
  </ul>
</div>

<!-- ============ PAGE 8 ============ -->
<div class="page">
  <h2>1.3 Objectives</h2>
  <ul>
    <li><strong>Develop a web-based system</strong> for managing student details, training records, company information, and academic results.</li>
    <li><strong>Implement secure authentication</strong> so only authorised administrators can access and modify data.</li>
    <li><strong>Provide real-time search and filtering</strong> for quick access to records by name, roll number, or other parameters.</li>
    <li><strong>Maintain training and internship records</strong> including company, project, duration, and status.</li>
    <li><strong>Track academic results</strong> across semesters and generate result summaries.</li>
    <li><strong>Generate comprehensive reports</strong> covering all modules in a consolidated view.</li>
    <li><strong>Build a modern, responsive UI</strong> that is intuitive for administrative staff.</li>
  </ul>
  <h2>1.4 Scope of the Project</h2>
  <p><strong>In Scope:</strong></p>
  <ul>
    <li>Management of student personal and academic information.</li>
    <li>Management of company and placement records.</li>
    <li>Tracking of student training and internship programmes.</li>
    <li>Recording and viewing of semester-wise academic results.</li>
    <li>Consolidated report generation for all modules.</li>
    <li>Secure admin login and JWT session management.</li>
    <li>Individual student profile view with complete history.</li>
  </ul>
  <p><strong>Out of Scope:</strong></p>
  <ul>
    <li>Student-facing portal (students cannot log in in this version).</li>
    <li>Fee or payment management.</li>
    <li>Attendance management.</li>
    <li>Email or SMS notification system.</li>
    <li>Multi-campus or multi-department support.</li>
  </ul>
</div>

<!-- ============ PAGE 9: CHAPTER 2 – LITERATURE REVIEW ============ -->
<div class="page">
  <div class="ch-title"><span>Chapter 2</span>Literature Review</div>
  <h2>2.1 Existing Systems</h2>
  <h3>2.1.1 Traditional Manual Systems</h3>
  <p>
    Many small and medium-sized educational institutions in India still rely on paper
    registers and files. While simple, these methods require significant storage space,
    make retrieval tedious, and are highly susceptible to data loss due to damage or misplacement.
  </p>
  <h3>2.1.2 Microsoft Excel-Based Systems</h3>
  <p>
    Spreadsheets offer an improvement over paper-based records but lack multi-user
    access, role-based security, and the ability to generate dynamic cross-module reports.
    They also have no validation and are prone to accidental modification.
  </p>
  <h3>2.1.3 Enterprise ERP Systems</h3>
  <p>
    Large universities use enterprise ERP systems such as SAP or Oracle. While comprehensive,
    these are prohibitively expensive, require dedicated IT infrastructure, and are far
    too complex for small institutes with limited technical staff.
  </p>
  <h3>2.1.4 Desktop Applications (VB.NET / Access)</h3>
  <p>
    Desktop-based applications built with Visual Basic .NET and Microsoft Access are
    widely used in college projects. However, they are Windows-only, require local
    installation, and cannot be accessed remotely — making them unsuitable for modern
    institutional requirements.
  </p>
  <h2>2.2 Proposed System</h2>
  <p>
    The proposed system overcomes the above limitations through modern web technologies:
  </p>
  <ul>
    <li><strong>Web-based:</strong> Accessible from any browser without installation.</li>
    <li><strong>Cloud Database:</strong> Neon PostgreSQL ensures data availability, backups, and scalability.</li>
    <li><strong>Secure Auth:</strong> NextAuth v5 with JWT and bcrypt password hashing.</li>
    <li><strong>Modern UI:</strong> shadcn/ui with Tailwind CSS — clean, responsive, professional.</li>
    <li><strong>Real-time Search:</strong> Instant filtering across all modules.</li>
    <li><strong>REST API:</strong> Clean separation of frontend and backend, easy to extend.</li>
  </ul>
</div>

<!-- ============ PAGE 10 ============ -->
<div class="page">
  <h2>2.3 Comparison of Existing and Proposed System</h2>
  <p class="cap"><strong>Table 2.1:</strong> Comparison of Existing and Proposed Systems</p>
  <table class="dt">
    <thead><tr><th>Feature</th><th>Manual</th><th>Excel</th><th>VB.NET App</th><th>Proposed System</th></tr></thead>
    <tbody>
      <tr><td>Platform</td><td>Paper</td><td>Windows</td><td>Windows Only</td><td>Any Browser</td></tr>
      <tr><td>Multi-user Access</td><td>No</td><td>Limited</td><td>No</td><td>Yes</td></tr>
      <tr><td>Data Security</td><td>None</td><td>Password only</td><td>Basic</td><td>JWT + bcrypt</td></tr>
      <tr><td>Search &amp; Filter</td><td>Manual</td><td>Basic</td><td>Limited</td><td>Real-time</td></tr>
      <tr><td>Report Generation</td><td>Manual</td><td>Manual</td><td>Basic</td><td>Automated</td></tr>
      <tr><td>Cloud Storage</td><td>No</td><td>No</td><td>No</td><td>Yes (Neon DB)</td></tr>
      <tr><td>Remote Access</td><td>No</td><td>No</td><td>No</td><td>Yes</td></tr>
      <tr><td>Installation Required</td><td>No</td><td>Yes</td><td>Yes</td><td>No</td></tr>
      <tr><td>Training Records</td><td>Register</td><td>Sheet</td><td>Basic</td><td>Full CRUD</td></tr>
      <tr><td>Result Management</td><td>Register</td><td>Sheet</td><td>Basic</td><td>Full CRUD</td></tr>
      <tr><td>Cost</td><td>Low</td><td>Low</td><td>Medium</td><td>Low (free tier)</td></tr>
    </tbody>
  </table>
</div>

<!-- ============ PAGE 11: CHAPTER 3 ============ -->
<div class="page">
  <div class="ch-title"><span>Chapter 3</span>System Analysis and Requirements</div>
  <h2>3.1 Feasibility Study</h2>
  <h3>3.1.1 Technical Feasibility</h3>
  <p>
    The system uses Next.js 16, TypeScript, Prisma ORM, and Neon PostgreSQL — all
    open-source, well-documented, and widely supported technologies. Development requires
    only a computer with Node.js installed. The cloud database provides a free tier
    sufficient for institutional use. The project is technically feasible.
  </p>
  <h3>3.1.2 Economic Feasibility</h3>
  <p>
    All technologies are free and open-source. Neon PostgreSQL offers a generous free
    tier with no licensing fees. Development was carried out by the student team as an
    academic project. The project is economically feasible at near-zero cost.
  </p>
  <h3>3.1.3 Operational Feasibility</h3>
  <p>
    The system's intuitive UI requires minimal training for administrative staff.
    Being web-based, it can be accessed from any device without software installation.
    The project is operationally feasible.
  </p>
  <h2>3.2 Functional Requirements</h2>
  <p class="cap"><strong>Table 3.1:</strong> Functional Requirements</p>
  <table class="dt">
    <thead><tr><th>Req. ID</th><th>Module</th><th>Requirement</th></tr></thead>
    <tbody>
      <tr><td>FR-01</td><td>Auth</td><td>Admin must log in with username and password</td></tr>
      <tr><td>FR-02</td><td>Auth</td><td>Unauthenticated users must be redirected to login</td></tr>
      <tr><td>FR-03</td><td>Students</td><td>Admin can add, edit, delete, and view student records</td></tr>
      <tr><td>FR-04</td><td>Students</td><td>Search students by name or roll number</td></tr>
      <tr><td>FR-05</td><td>Students</td><td>View individual student profile with training &amp; results</td></tr>
      <tr><td>FR-06</td><td>Companies</td><td>Admin can add, edit, delete, and view company records</td></tr>
      <tr><td>FR-07</td><td>Training</td><td>Admin can add, edit, delete, and view training records</td></tr>
      <tr><td>FR-08</td><td>Training</td><td>Training status: Ongoing or Completed</td></tr>
      <tr><td>FR-09</td><td>Results</td><td>Admin can add, edit, delete, and view result records</td></tr>
      <tr><td>FR-10</td><td>Reports</td><td>Consolidated report view for all modules</td></tr>
    </tbody>
  </table>
</div>

<!-- ============ PAGE 12 ============ -->
<div class="page">
  <h2>3.3 Non-Functional Requirements</h2>
  <p class="cap"><strong>Table 3.2:</strong> Non-Functional Requirements</p>
  <table class="dt">
    <thead><tr><th>Req. ID</th><th>Category</th><th>Requirement</th></tr></thead>
    <tbody>
      <tr><td>NFR-01</td><td>Security</td><td>All routes protected by JWT authentication</td></tr>
      <tr><td>NFR-02</td><td>Security</td><td>Passwords stored as bcrypt hashes only</td></tr>
      <tr><td>NFR-03</td><td>Performance</td><td>Page load under 3 seconds on standard connection</td></tr>
      <tr><td>NFR-04</td><td>Usability</td><td>Clean, consistent UI across all modules</td></tr>
      <tr><td>NFR-05</td><td>Reliability</td><td>All API errors return meaningful messages</td></tr>
      <tr><td>NFR-06</td><td>Scalability</td><td>Database capable of handling growth in records</td></tr>
      <tr><td>NFR-07</td><td>Compatibility</td><td>Works on Chrome, Firefox, Edge, and Safari</td></tr>
      <tr><td>NFR-08</td><td>Maintainability</td><td>Modular, consistent code conventions</td></tr>
    </tbody>
  </table>
  <h2>3.4 Use Case Description</h2>
  <p class="cap"><strong>Table 3.3:</strong> Use Case Table – Admin</p>
  <table class="dt">
    <thead><tr><th>Use Case</th><th>Actor</th><th>Description</th><th>Outcome</th></tr></thead>
    <tbody>
      <tr><td>Login</td><td>Admin</td><td>Enter credentials to access system</td><td>Authenticated session created</td></tr>
      <tr><td>Logout</td><td>Admin</td><td>End the session</td><td>Session cleared, redirect to login</td></tr>
      <tr><td>Add Student</td><td>Admin</td><td>Fill student form and submit</td><td>Student created in database</td></tr>
      <tr><td>Edit Student</td><td>Admin</td><td>Modify existing student details</td><td>Student record updated</td></tr>
      <tr><td>Delete Student</td><td>Admin</td><td>Remove student from system</td><td>Record permanently deleted</td></tr>
      <tr><td>Search</td><td>Admin</td><td>Type in search box to filter records</td><td>Filtered results in real time</td></tr>
      <tr><td>View Profile</td><td>Admin</td><td>Click eye icon on student row</td><td>Individual profile page shown</td></tr>
      <tr><td>Add Training</td><td>Admin</td><td>Select student, company, fill training details</td><td>Training record created</td></tr>
      <tr><td>Add Result</td><td>Admin</td><td>Select student, enter result details</td><td>Result record created</td></tr>
      <tr><td>View Reports</td><td>Admin</td><td>Navigate to reports page</td><td>All module data shown together</td></tr>
    </tbody>
  </table>
</div>

<!-- ============ PAGE 13: CHAPTER 4 ============ -->
<div class="page">
  <div class="ch-title"><span>Chapter 4</span>System Design</div>
  <h2>4.1 System Architecture</h2>
  <p>
    The system follows a <strong>three-tier architecture</strong> — Presentation,
    Application, and Data layers.
  </p>
  <ul>
    <li><strong>Presentation Layer:</strong> React components (Next.js App Router) with shadcn/ui and Tailwind CSS handle all user interactions.</li>
    <li><strong>Application Layer:</strong> Next.js API Routes implement the REST API. NextAuth v5 manages authentication. The proxy file enforces route protection at the edge.</li>
    <li><strong>Data Layer:</strong> PostgreSQL on Neon DB, accessed via Prisma ORM with the Neon HTTP adapter for serverless-compatible queries.</li>
  </ul>
  <p class="cap" style="margin-top:12px;"><strong>Figure 4.1:</strong> System Architecture – Three-Tier Web Application</p>
  <div class="arch">
┌──────────────────────────────────────────────────────────┐<br/>
│             PRESENTATION LAYER  (Browser)                 │<br/>
│   Next.js React · shadcn/ui Components · Tailwind CSS     │<br/>
└───────────────────────┬──────────────────────────────────┘<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│  HTTP / HTTPS Requests<br/>
┌───────────────────────▼──────────────────────────────────┐<br/>
│          APPLICATION LAYER  (Next.js Server)              │<br/>
│   REST API Routes · NextAuth v5 JWT · Prisma ORM          │<br/>
└───────────────────────┬──────────────────────────────────┘<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│  Neon HTTP Adapter (SSL)<br/>
┌───────────────────────▼──────────────────────────────────┐<br/>
│            DATA LAYER  (Neon Serverless PostgreSQL)        │<br/>
│   Admin · Student · Company · Training · Result Tables    │<br/>
└──────────────────────────────────────────────────────────┘
  </div>
  <h2>4.2 Database Design</h2>
  <p class="cap"><strong>Table 4.1:</strong> Student Table Schema</p>
  <table class="dt">
    <thead><tr><th>Column</th><th>Type</th><th>Constraints</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td>id</td><td>INT</td><td>PK, AUTO INCREMENT</td><td>Unique identifier</td></tr>
      <tr><td>rollNo</td><td>VARCHAR</td><td>UNIQUE, NOT NULL</td><td>Student roll number</td></tr>
      <tr><td>name</td><td>VARCHAR</td><td>NOT NULL</td><td>Full name</td></tr>
      <tr><td>email</td><td>VARCHAR</td><td>NOT NULL</td><td>Email address</td></tr>
      <tr><td>phone</td><td>VARCHAR</td><td>NOT NULL</td><td>Contact number</td></tr>
      <tr><td>address</td><td>VARCHAR</td><td>NOT NULL</td><td>Home address</td></tr>
      <tr><td>course</td><td>VARCHAR</td><td>NOT NULL</td><td>Enrolled course</td></tr>
      <tr><td>year</td><td>INT</td><td>NOT NULL</td><td>Current year (1/2/3)</td></tr>
      <tr><td>createdAt</td><td>TIMESTAMP</td><td>DEFAULT NOW()</td><td>Creation timestamp</td></tr>
      <tr><td>updatedAt</td><td>TIMESTAMP</td><td>AUTO UPDATE</td><td>Last update timestamp</td></tr>
    </tbody>
  </table>
</div>

<!-- ============ PAGE 14 ============ -->
<div class="page">
  <p class="cap"><strong>Table 4.2:</strong> Company Table Schema</p>
  <table class="dt">
    <thead><tr><th>Column</th><th>Type</th><th>Constraints</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td>id</td><td>INT</td><td>PK, AUTO INCREMENT</td><td>Unique identifier</td></tr>
      <tr><td>name</td><td>VARCHAR</td><td>UNIQUE, NOT NULL</td><td>Company name</td></tr>
      <tr><td>industry</td><td>VARCHAR</td><td>NOT NULL</td><td>Industry sector</td></tr>
      <tr><td>location</td><td>VARCHAR</td><td>NOT NULL</td><td>City / location</td></tr>
      <tr><td>contactPerson</td><td>VARCHAR</td><td>NOT NULL</td><td>HR contact name</td></tr>
      <tr><td>email</td><td>VARCHAR</td><td>NOT NULL</td><td>Contact email</td></tr>
      <tr><td>phone</td><td>VARCHAR</td><td>NOT NULL</td><td>Contact phone</td></tr>
    </tbody>
  </table>
  <p class="cap"><strong>Table 4.3:</strong> Training Table Schema</p>
  <table class="dt">
    <thead><tr><th>Column</th><th>Type</th><th>Constraints</th></tr></thead>
    <tbody>
      <tr><td>id</td><td>INT</td><td>PK, AUTO INCREMENT</td></tr>
      <tr><td>studentId</td><td>INT</td><td>FK → Student.id, NOT NULL</td></tr>
      <tr><td>companyId</td><td>INT</td><td>FK → Company.id, NOT NULL</td></tr>
      <tr><td>projectName</td><td>VARCHAR</td><td>NOT NULL</td></tr>
      <tr><td>startDate</td><td>TIMESTAMP</td><td>NOT NULL</td></tr>
      <tr><td>endDate</td><td>TIMESTAMP</td><td>NOT NULL</td></tr>
      <tr><td>status</td><td>VARCHAR</td><td>DEFAULT 'Ongoing'</td></tr>
      <tr><td>description</td><td>TEXT</td><td>NOT NULL</td></tr>
    </tbody>
  </table>
  <p class="cap"><strong>Table 4.4:</strong> Result Table Schema</p>
  <table class="dt">
    <thead><tr><th>Column</th><th>Type</th><th>Constraints</th></tr></thead>
    <tbody>
      <tr><td>id</td><td>INT</td><td>PK, AUTO INCREMENT</td></tr>
      <tr><td>studentId</td><td>INT</td><td>FK → Student.id, NOT NULL</td></tr>
      <tr><td>subject</td><td>VARCHAR</td><td>NOT NULL</td></tr>
      <tr><td>marks</td><td>INT</td><td>NOT NULL</td></tr>
      <tr><td>maxMarks</td><td>INT</td><td>NOT NULL</td></tr>
      <tr><td>grade</td><td>VARCHAR</td><td>NOT NULL</td></tr>
      <tr><td>semester</td><td>INT</td><td>NOT NULL</td></tr>
      <tr><td>year</td><td>INT</td><td>NOT NULL</td></tr>
    </tbody>
  </table>
  <h2>4.3 Module Design</h2>
  <p>Each module has a dedicated page under <code>/dashboard/</code> and corresponding REST API routes under <code>/api/</code>:</p>
  <ul>
    <li><strong>Authentication:</strong> <code>/login</code> page · <code>/api/auth</code> (NextAuth handler)</li>
    <li><strong>Dashboard:</strong> <code>/dashboard</code> · <code>/api/dashboard</code> (summary counts)</li>
    <li><strong>Students:</strong> <code>/dashboard/students</code> · <code>/api/students</code> + <code>/api/students/[id]</code></li>
    <li><strong>Companies:</strong> <code>/dashboard/companies</code> · <code>/api/companies</code> + <code>/api/companies/[id]</code></li>
    <li><strong>Training:</strong> <code>/dashboard/training</code> · <code>/api/training</code> + <code>/api/training/[id]</code></li>
    <li><strong>Results:</strong> <code>/dashboard/results</code> · <code>/api/results</code> + <code>/api/results/[id]</code></li>
    <li><strong>Reports:</strong> <code>/dashboard/reports</code> · reads from all existing API endpoints</li>
  </ul>
</div>

<!-- ============ PAGE 15: CHAPTER 5 ============ -->
<div class="page">
  <div class="ch-title"><span>Chapter 5</span>Implementation</div>
  <h2>5.1 Technology Stack</h2>
  <p class="cap"><strong>Table 5.1:</strong> Technology Stack Details</p>
  <table class="dt">
    <thead><tr><th>Layer</th><th>Technology</th><th>Version</th><th>Purpose</th></tr></thead>
    <tbody>
      <tr><td>Framework</td><td>Next.js</td><td>16.2.10</td><td>Full-stack React framework with App Router and API Routes</td></tr>
      <tr><td>Language</td><td>TypeScript</td><td>5.x</td><td>Statically typed JavaScript for safer, maintainable code</td></tr>
      <tr><td>Styling</td><td>Tailwind CSS</td><td>4.x</td><td>Utility-first CSS for rapid, responsive UI development</td></tr>
      <tr><td>UI Components</td><td>shadcn/ui</td><td>Latest</td><td>Accessible, composable component library</td></tr>
      <tr><td>Icons</td><td>Lucide React</td><td>Latest</td><td>SVG icon set</td></tr>
      <tr><td>ORM</td><td>Prisma</td><td>7.8.0</td><td>Type-safe database access layer</td></tr>
      <tr><td>DB Adapter</td><td>@prisma/adapter-neon</td><td>7.8.0</td><td>Serverless-compatible Neon adapter for Prisma</td></tr>
      <tr><td>Database</td><td>Neon PostgreSQL</td><td>15</td><td>Serverless cloud PostgreSQL database</td></tr>
      <tr><td>Authentication</td><td>NextAuth v5</td><td>5.0.0-beta</td><td>JWT session management with Credentials provider</td></tr>
      <tr><td>Password Hashing</td><td>bcryptjs</td><td>3.x</td><td>Secure password hashing</td></tr>
    </tbody>
  </table>
  <h2>5.2 Module Implementation with Screenshots</h2>
  <h3>5.2.1 Login Page</h3>
  <p>
    The login page is the entry point of the application presenting a card-based form.
    On successful authentication, a JWT session is created and the admin is redirected
    to the dashboard. Invalid credentials display an error message.
  </p>
  <div class="ss">
    <img src="${I(shots, "login")}" alt="Login" />
    <div class="fc"><strong>Figure 5.1:</strong> Login Page</div>
  </div>
</div>

<!-- ============ PAGE 16 ============ -->
<div class="page">
  <h3>5.2.2 Dashboard</h3>
  <p>
    The dashboard displays four summary cards (total students, companies, training records,
    and results) and a table of recently added student records. The sidebar provides
    navigation to all modules.
  </p>
  <div class="ss">
    <img src="${I(shots, "dashboard")}" alt="Dashboard" />
    <div class="fc"><strong>Figure 5.2:</strong> Dashboard – Overview and Statistics</div>
  </div>
  <h3>5.2.3 Student Module</h3>
  <p>
    The student module provides a searchable table with roll number, name, email, phone,
    course, and year. A right-side drawer panel handles add/edit forms without page navigation.
    An eye icon navigates to the student's full profile page.
  </p>
  <div class="ss">
    <img src="${I(shots, "students")}" alt="Students" />
    <div class="fc"><strong>Figure 5.3:</strong> Student Module – Records Management</div>
  </div>
</div>

<!-- ============ PAGE 17 ============ -->
<div class="page">
  <h3>5.2.4 Company Module</h3>
  <p>
    The company module stores all organisations where students are placed for training.
    Each record holds the company name, industry, location, contact person, email,
    and phone. Companies can be searched by name.
  </p>
  <div class="ss">
    <img src="${I(shots, "companies")}" alt="Companies" />
    <div class="fc"><strong>Figure 5.4:</strong> Company Module – Placement Records</div>
  </div>
  <h3>5.2.5 Training Module</h3>
  <p>
    The training module tracks each student's internship. It records the student,
    company, project name, start/end dates, status (Ongoing/Completed), and a project
    description. Skeleton loaders appear during data fetch for better UX.
  </p>
  <div class="ss">
    <img src="${I(shots, "training")}" alt="Training" />
    <div class="fc"><strong>Figure 5.5:</strong> Training Module – Internship Tracking</div>
  </div>
</div>

<!-- ============ PAGE 18 ============ -->
<div class="page">
  <h3>5.2.6 Results Module</h3>
  <p>
    The results module records subject-wise academic performance. Each entry stores
    the student, subject, marks obtained, maximum marks, grade, semester, and year.
    Grades are displayed as colour-coded badges for quick visual scanning.
  </p>
  <div class="ss">
    <img src="${I(shots, "results")}" alt="Results" />
    <div class="fc"><strong>Figure 5.6:</strong> Results Module – Academic Performance</div>
  </div>
  <h3>5.2.7 Reports Module</h3>
  <p>
    The reports module presents a consolidated, read-only view of all data — students,
    companies, training records, and results — on a single page, giving administrators
    a complete institutional overview without switching modules.
  </p>
  <div class="ss">
    <img src="${I(shots, "reports")}" alt="Reports" />
    <div class="fc"><strong>Figure 5.7:</strong> Reports Module – Consolidated View</div>
  </div>
</div>

<!-- ============ PAGE 19: CHAPTER 6 – TESTING ============ -->
<div class="page">
  <div class="ch-title"><span>Chapter 6</span>Testing</div>
  <h2>6.1 Testing Strategy</h2>
  <p>The following testing approaches were adopted:</p>
  <ul>
    <li><strong>Unit Testing:</strong> Individual API routes tested with direct HTTP requests for valid and invalid inputs.</li>
    <li><strong>Integration Testing:</strong> Frontend form submissions and backend API interaction verified end-to-end.</li>
    <li><strong>User Acceptance Testing (UAT):</strong> All modules manually tested by the project team against specified requirements.</li>
    <li><strong>Boundary Testing:</strong> Empty fields, invalid types, and extreme values tested to confirm proper validation.</li>
    <li><strong>Security Testing:</strong> Unauthenticated access to protected routes confirmed to redirect to login.</li>
  </ul>
  <h2>6.2 Test Cases</h2>
  <p class="cap"><strong>Table 6.1:</strong> Test Cases – Authentication Module</p>
  <table class="dt">
    <thead><tr><th>TC#</th><th>Test Case</th><th>Input</th><th>Expected</th><th>Result</th></tr></thead>
    <tbody>
      <tr><td>TC-01</td><td>Valid login</td><td>admin / admin123</td><td>Redirect to dashboard</td><td>✓ Pass</td></tr>
      <tr><td>TC-02</td><td>Invalid password</td><td>admin / wrong</td><td>Error message shown</td><td>✓ Pass</td></tr>
      <tr><td>TC-03</td><td>Empty username</td><td>"" / admin123</td><td>Form validation error</td><td>✓ Pass</td></tr>
      <tr><td>TC-04</td><td>Access /dashboard without login</td><td>No session</td><td>Redirect to /login</td><td>✓ Pass</td></tr>
      <tr><td>TC-05</td><td>Logout</td><td>Click logout</td><td>Session cleared, redirect</td><td>✓ Pass</td></tr>
    </tbody>
  </table>
  <p class="cap"><strong>Table 6.2:</strong> Test Cases – Student Module</p>
  <table class="dt">
    <thead><tr><th>TC#</th><th>Test Case</th><th>Input</th><th>Expected</th><th>Result</th></tr></thead>
    <tbody>
      <tr><td>TC-06</td><td>Add student with valid data</td><td>All fields filled</td><td>Student record created</td><td>✓ Pass</td></tr>
      <tr><td>TC-07</td><td>Duplicate roll number</td><td>Existing roll no.</td><td>Error: Roll number exists</td><td>✓ Pass</td></tr>
      <tr><td>TC-08</td><td>Edit student details</td><td>Modified fields</td><td>Record updated in DB</td><td>✓ Pass</td></tr>
      <tr><td>TC-09</td><td>Delete student</td><td>Confirm delete</td><td>Record removed</td><td>✓ Pass</td></tr>
      <tr><td>TC-10</td><td>Search by name</td><td>Partial name</td><td>Filtered results shown</td><td>✓ Pass</td></tr>
    </tbody>
  </table>
</div>

<!-- ============ PAGE 20 ============ -->
<div class="page">
  <p class="cap"><strong>Table 6.3:</strong> Test Cases – Company &amp; Training Modules</p>
  <table class="dt">
    <thead><tr><th>TC#</th><th>Module</th><th>Test Case</th><th>Expected</th><th>Result</th></tr></thead>
    <tbody>
      <tr><td>TC-11</td><td>Company</td><td>Add company with valid data</td><td>Company record created</td><td>✓ Pass</td></tr>
      <tr><td>TC-12</td><td>Company</td><td>Duplicate company name</td><td>Error: Company already exists</td><td>✓ Pass</td></tr>
      <tr><td>TC-13</td><td>Company</td><td>Edit company details</td><td>Record updated</td><td>✓ Pass</td></tr>
      <tr><td>TC-14</td><td>Company</td><td>Delete company</td><td>Company removed from list</td><td>✓ Pass</td></tr>
      <tr><td>TC-15</td><td>Training</td><td>Add training with valid data</td><td>Training record created</td><td>✓ Pass</td></tr>
      <tr><td>TC-16</td><td>Training</td><td>Submit without selecting student</td><td>Validation error shown</td><td>✓ Pass</td></tr>
      <tr><td>TC-17</td><td>Training</td><td>Update status to Completed</td><td>Badge shows Completed</td><td>✓ Pass</td></tr>
      <tr><td>TC-18</td><td>Training</td><td>Delete training record</td><td>Record removed</td><td>✓ Pass</td></tr>
      <tr><td>TC-19</td><td>Results</td><td>Add result with valid data</td><td>Result record created</td><td>✓ Pass</td></tr>
      <tr><td>TC-20</td><td>Results</td><td>Edit result grade</td><td>Grade updated in list</td><td>✓ Pass</td></tr>
    </tbody>
  </table>
  <h3>6.2.1 Testing Summary</h3>
  <p>
    A total of 20 test cases were executed across Authentication, Student, Company,
    Training, and Results modules. All 20 test cases passed successfully, confirming
    that the system functions correctly as per the specified requirements. Error handling
    was verified with invalid and boundary inputs — in all cases the system responded
    with appropriate error messages rather than crashing or exposing internal details.
  </p>
</div>

<!-- ============ PAGE 21: CHAPTER 7 ============ -->
<div class="page">
  <div class="ch-title"><span>Chapter 7</span>Conclusion and Future Scope</div>
  <h2>7.1 Conclusion</h2>
  <p>
    The <strong>Student Training Management System</strong> has been successfully designed,
    developed, and tested as part of the Bachelor of Computer Application final year
    project at Sityog Institute of Technology, Aurangabad. The system fulfils all
    the objectives outlined in Chapter 1 and effectively addresses the problems
    identified in the problem statement.
  </p>
  <p>
    The project demonstrates the practical application of modern full-stack web
    development technologies — Next.js 16, TypeScript, Prisma ORM, Neon PostgreSQL,
    NextAuth v5, and shadcn/ui. The resulting application is a robust, secure, and
    user-friendly platform that enables administrators to manage student records,
    company placements, training assignments, and academic results with ease.
  </p>
  <p><strong>Key achievements of this project include:</strong></p>
  <ul>
    <li>A fully functional web-based system accessible from any modern browser.</li>
    <li>Secure authentication with JWT sessions and bcrypt password hashing.</li>
    <li>Complete CRUD operations across all four data modules.</li>
    <li>Real-time search and filtering for quick data retrieval.</li>
    <li>Skeleton loading states for improved user experience.</li>
    <li>Side drawer forms for smooth, in-page data entry.</li>
    <li>Individual student profile pages with complete history.</li>
    <li>A consolidated reports page for institutional overview.</li>
    <li>Cloud-hosted PostgreSQL database for persistent, scalable data storage.</li>
  </ul>
  <p>
    The system successfully replaces manual paper-based and spreadsheet-based record
    keeping, providing significant improvements in efficiency, accuracy, and
    accessibility of institutional data management.
  </p>
</div>

<!-- ============ PAGE 22 ============ -->
<div class="page">
  <h2>7.2 Future Scope</h2>
  <p>
    Several enhancements can be incorporated in future versions to make the system
    more comprehensive for larger institutional deployment:
  </p>
  <ul>
    <li><strong>Student Portal:</strong> Allow students to log in and view their own training records, results, and profile.</li>
    <li><strong>Role-Based Access Control:</strong> Multiple roles (Admin, Faculty, HOD) with different permission levels.</li>
    <li><strong>Email Notifications:</strong> Automated emails to students when training or results are updated.</li>
    <li><strong>Attendance Management:</strong> Daily attendance tracking with monthly summaries.</li>
    <li><strong>PDF Export:</strong> Export individual student profiles, result sheets, and training certificates.</li>
    <li><strong>Mobile Application:</strong> React Native companion app for on-the-go access.</li>
    <li><strong>Advanced Analytics:</strong> Charts for placement trends, result distributions, and training statistics.</li>
    <li><strong>Multi-Campus Support:</strong> Multiple departments and campuses within the same institution.</li>
    <li><strong>Placement Drive Module:</strong> Manage drives, interview schedules, and offer letters.</li>
    <li><strong>SMS Notifications:</strong> Alerts to students and parents about important events.</li>
  </ul>
</div>

<!-- ============ PAGE 23: REFERENCES ============ -->
<div class="page refs">
  <div class="ch-title">References</div>
  <ol>
    <li>Vercel Inc. (2024). <em>Next.js 16 Documentation</em>. Retrieved from https://nextjs.org/docs</li>
    <li>Prisma. (2024). <em>Prisma ORM Documentation – Prisma 7</em>. Retrieved from https://www.prisma.io/docs</li>
    <li>Neon Inc. (2024). <em>Neon Serverless PostgreSQL Documentation</em>. Retrieved from https://neon.tech/docs</li>
    <li>NextAuth.js. (2024). <em>Auth.js (NextAuth v5) Documentation</em>. Retrieved from https://authjs.dev</li>
    <li>shadcn. (2024). <em>shadcn/ui Component Library</em>. Retrieved from https://ui.shadcn.com</li>
    <li>Tailwind Labs. (2024). <em>Tailwind CSS v4 Documentation</em>. Retrieved from https://tailwindcss.com/docs</li>
    <li>PostgreSQL Global Development Group. (2024). <em>PostgreSQL 15 Documentation</em>. Retrieved from https://www.postgresql.org/docs/15/</li>
    <li>Pressman, R. S. (2014). <em>Software Engineering: A Practitioner's Approach</em> (8th ed.). McGraw-Hill Education.</li>
    <li>Sommerville, I. (2015). <em>Software Engineering</em> (10th ed.). Pearson Education.</li>
    <li>Date, C. J. (2019). <em>An Introduction to Database Systems</em> (8th ed.). Pearson.</li>
    <li>Mozilla Developer Network. (2024). <em>MDN Web Docs – Web Technologies</em>. Retrieved from https://developer.mozilla.org</li>
    <li>TypeScript Team. (2024). <em>TypeScript Documentation</em>. Retrieved from https://www.typescriptlang.org/docs</li>
    <li>OWASP Foundation. (2024). <em>OWASP Top Ten Security Risks</em>. Retrieved from https://owasp.org/Top10/</li>
  </ol>
</div>

</body>
</html>`;
}

async function main() {
  console.log("Taking screenshots...");
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  let shots;
  try {
    shots = await takeScreenshots(browser);
  } finally {
    await browser.close();
  }

  console.log("Building report HTML...");
  const html = buildHTML(shots);

  console.log("Generating PDF...");
  const pdfBrowser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await pdfBrowser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const out = path.join(__dirname, "..", "Student_Management_System_Report.pdf");
  await page.pdf({
    path: out,
    format: "A4",
    landscape: false,
    printBackground: true,
    margin: { top: "25mm", right: "20mm", bottom: "20mm", left: "30mm" },
  });

  await pdfBrowser.close();
  console.log(`\n✅ Report saved to: ${out}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

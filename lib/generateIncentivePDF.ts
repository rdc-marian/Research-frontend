import { IncentiveApplication } from "./mockIncentives";

// Helper to find reviewer details from reviewedBy or fallback
const findReviewerInApp = (inc: IncentiveApplication, step: string) => {
  if (!inc.reviewedBy || !Array.isArray(inc.reviewedBy)) return null;
  return inc.reviewedBy.find(r => {
    const nameLower = (r.name || "").toLowerCase();
    const roleLower = (r.role || "").toLowerCase();
    const rolesLower = (r.roles || []).map((x: string) => x.toLowerCase());
    const permissionsLower = (r.permissions || []).map((x: string) => x.toLowerCase());

    if (step === "library") {
      return roleLower === "library" || rolesLower.includes("library") || nameLower.includes("librarian") || nameLower.includes("alice");
    }
    if (step === "guide") {
      return roleLower === "guide" || permissionsLower.includes("research_guide") || nameLower.includes("guide") || nameLower.includes("mathew");
    }
    if (step === "centre_coordinator") {
      return (permissionsLower.includes("coordinator") && !nameLower.includes("mccarthy")) || nameLower.includes("centre coordinator") || nameLower.includes("sybil");
    }
    if (step === "coordinator") {
      return roleLower === "admin" || rolesLower.includes("admin") || nameLower.includes("mccarthy") || nameLower.includes("research coordinator");
    }
    if (step === "principal") {
      return nameLower.includes("principal") || nameLower.includes("dominic");
    }
    if (step === "finance") {
      return nameLower.includes("finance") || nameLower.includes("jose k. j.");
    }
    return false;
  });
};

// Helper to resolve dynamic reviewer details based on status dates
const getApprovalDetails = (inc: IncentiveApplication, step: string) => {
  const status = inc.status;
  const appliedDate = new Date(inc.dateApplied);
  const updatedDate = new Date(inc.updatedAt || inc.dateApplied);

  // Helper to format dates and times
  const formatDate = (date: Date) => date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const formatTime = (date: Date) => date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const libraryNote = inc.libraryNote || inc.facultyObj?.libraryNote || "";
  const guideNote = inc.guideNote || inc.facultyObj?.guideNote || "";
  const adminNote = inc.adminNote || inc.facultyObj?.adminNote || "";
  const principalNote = inc.principalNote || inc.facultyObj?.principalNote || "";

  const reviewer = findReviewerInApp(inc, step);
  const reviewerName = reviewer ? reviewer.name : "";

  if (step === "faculty") {
    return {
      approved: true,
      rejected: false,
      name: inc.facultyName,
      date: formatDate(appliedDate),
      time: formatTime(appliedDate),
      note: ""
    };
  }

  if (step === "library") {
    const isLibraryPending = status === "Pending Library";
    const hasRejected = status === "Rejected" && (!!libraryNote || (!principalNote && !adminNote && !guideNote));
    const approved = !isLibraryPending && !hasRejected;
    const rejected = hasRejected;
    const actionDate = approved || rejected ? updatedDate : new Date(appliedDate.getTime() + 4 * 3600000);
    return {
      approved,
      rejected,
      name: reviewerName || "Sr. Alice Jose (Librarian)",
      date: formatDate(actionDate),
      time: formatTime(actionDate),
      note: libraryNote,
    };
  }

  if (step === "guide") {
    const isPending = status === "Pending Library" || status === "Pending Guide";
    const hasRejected = status === "Rejected" && !!guideNote;
    const approved = !isPending && !hasRejected;
    const rejected = hasRejected;
    const actionDate = approved || rejected ? updatedDate : new Date(appliedDate.getTime() + 24 * 3600000);
    return {
      approved,
      rejected,
      name: reviewerName || "Dr. John Mathew (Research Guide)",
      date: formatDate(actionDate),
      time: formatTime(actionDate),
      note: guideNote,
    };
  }

  if (step === "centre_coordinator") {
    const isPending = status === "Pending Library" || status === "Pending Guide" || status === "Pending Admin";
    const hasRejected = status === "Rejected" && !!adminNote && !guideNote && !libraryNote && !reviewerName;
    const approved = !isPending && !hasRejected;
    const rejected = hasRejected;
    const actionDate = approved || rejected ? updatedDate : new Date(appliedDate.getTime() + 36 * 3600000);
    return {
      approved,
      rejected,
      name: reviewerName || "Dr. Sybil Jose (Centre Coordinator)",
      date: formatDate(actionDate),
      time: formatTime(actionDate),
      note: adminNote,
    };
  }

  if (step === "coordinator") {
    const isPending = status === "Pending Library" || status === "Pending Guide" || status === "Pending Admin";
    const hasRejected = status === "Rejected" && !!adminNote && !guideNote && !libraryNote;
    const approved = !isPending && !hasRejected;
    const rejected = hasRejected;
    const actionDate = approved || rejected ? updatedDate : new Date(appliedDate.getTime() + 48 * 3600000);
    return {
      approved,
      rejected,
      name: reviewerName || "Prof. Dr. J. R. McCarthy (Research Coordinator)",
      date: formatDate(actionDate),
      time: formatTime(actionDate),
      note: adminNote,
    };
  }

  if (step === "principal") {
    const approved = status === "Approved" || status === "Paid";
    const rejected = status === "Rejected" && (!!principalNote || (!libraryNote && !guideNote && !adminNote && !!reviewerName));
    return {
      approved,
      rejected,
      name: reviewerName || "Fr. Dr. Dominic VH (Principal)",
      date: formatDate(updatedDate),
      time: formatTime(updatedDate),
      note: principalNote,
    };
  }

  if (step === "finance") {
    const approved = status === "Paid";
    return {
      approved,
      rejected: false,
      name: reviewerName || "Mr. Jose K. J. (Finance Officer)",
      date: formatDate(updatedDate),
      time: formatTime(updatedDate),
      note: "",
    };
  }

  return { approved: false, rejected: false, name: "", date: "", time: "", note: "" };
};

// Helper to render the Faculty Information section in a clean two-column table
const renderFacultySection = (inc: IncentiveApplication, user: any): string => {
  const empId = inc.facultyObj?.employeeId || inc.facultyObj?.uniqueId || user?.employeeId || user?.uniqueId || "N/A";
  const mobile = inc.facultyObj?.phone || user?.phone || "N/A";
  const dept = inc.department || inc.facultyObj?.department || user?.department || "N/A";
  const designation = inc.facultyObj?.designation || user?.designation || "N/A";
  const researchCenter = inc.researchCenter || inc.facultyObj?.researchCenter?.name || inc.facultyObj?.researchCenter || "N/A";

  return `
    <div class="section-container">
      <h3 class="section-heading">1. Faculty Information</h3>
      <table class="minimal-table">
        <tr>
          <td class="lbl-cell">Faculty Name:</td>
          <td><strong>${inc.facultyName}</strong></td>
          <td class="lbl-cell">Employee ID:</td>
          <td>${empId}</td>
        </tr>
        <tr>
          <td class="lbl-cell">Designation:</td>
          <td>${designation}</td>
          <td class="lbl-cell">Department:</td>
          <td>${dept}</td>
        </tr>
        <tr>
          <td class="lbl-cell">Research Centre:</td>
          <td>${researchCenter}</td>
          <td class="lbl-cell">Email:</td>
          <td>${inc.facultyEmail}</td>
        </tr>
        <tr>
          <td class="lbl-cell">Mobile Number:</td>
          <td colspan="3">${mobile}</td>
        </tr>
      </table>
    </div>
  `;
};

// Helper to render Category Specific Details compactly
const renderPublicationSection = (inc: IncentiveApplication): string => {
  if (inc.category === "Publication") {
    const pubType = inc.pubStatus || "N/A";
    const paperTitle = inc.publicationTitle || "N/A";
    const journalName = inc.journalName || "N/A";
    const issn = (inc as any).issn || "N/A";
    const doi = inc.doiLink || "N/A";
    const publisher = (inc as any).publisher || "N/A";
    const volume = (inc as any).volume || "N/A";
    const issue = (inc as any).issue || "N/A";
    const pages = (inc as any).pages || "N/A";
    const pubDate = (inc as any).publicationDate || (inc as any).publishDate ? new Date((inc as any).publicationDate || (inc as any).publishDate).toLocaleDateString("en-GB") : "N/A";
    const indexing = Array.isArray((inc as any).indexing) ? (inc as any).indexing.join(", ") : (inc as any).indexing || "N/A";

    return `
      <div class="section-container">
        <h3 class="section-heading">2. Publication Details</h3>
        <table class="minimal-table">
          <tr>
            <td class="lbl-cell" style="width: 18%;">Paper Title:</td>
            <td colspan="3" class="wrap-cell"><strong>${paperTitle}</strong></td>
          </tr>
          <tr>
            <td class="lbl-cell">Journal Name:</td>
            <td style="width: 32%;" class="wrap-cell">${journalName}</td>
            <td class="lbl-cell" style="width: 18%;">Publication Type:</td>
            <td>${pubType}</td>
          </tr>
          <tr>
            <td class="lbl-cell">DOI:</td>
            <td class="wrap-cell">${doi}</td>
            <td class="lbl-cell">ISSN / Publisher:</td>
            <td class="wrap-cell">${issn} / ${publisher}</td>
          </tr>
          <tr>
            <td class="lbl-cell">Vol / Issue / Pages:</td>
            <td>Vol. ${volume}, Issue ${issue}, Pages ${pages}</td>
            <td class="lbl-cell">Date & Indexing:</td>
            <td>${pubDate} (${indexing})</td>
          </tr>
        </table>
      </div>
    `;
  } else if (inc.category === "Patent") {
    const patentTitle = inc.patentTitle || "N/A";
    const patentNumber = inc.patentNumber || "N/A";
    const patentStatus = inc.patentStatus || "N/A";
    const filingDate = (inc as any).filingDate ? new Date((inc as any).filingDate).toLocaleDateString("en-GB") : "N/A";
    const grantDate = (inc as any).grantDate ? new Date((inc as any).grantDate).toLocaleDateString("en-GB") : "N/A";

    return `
      <div class="section-container">
        <h3 class="section-heading">2. Patent Details</h3>
        <table class="minimal-table">
          <tr>
            <td class="lbl-cell" style="width: 18%;">Patent Title:</td>
            <td colspan="3" class="wrap-cell"><strong>${patentTitle}</strong></td>
          </tr>
          <tr>
            <td class="lbl-cell">Patent Number:</td>
            <td style="width: 32%;">${patentNumber}</td>
            <td class="lbl-cell" style="width: 18%;">Patent Status:</td>
            <td>${patentStatus}</td>
          </tr>
          <tr>
            <td class="lbl-cell">Filing Date:</td>
            <td>${filingDate}</td>
            <td class="lbl-cell">Grant Date:</td>
            <td>${grantDate}</td>
          </tr>
        </table>
      </div>
    `;
  } else {
    // Conference / Registration Fee Reimbursement
    const confName = inc.eventName || "N/A";
    const confType = inc.eventType || "N/A";
    const organizer = (inc as any).organizer || "N/A";
    const venue = (inc as any).venue || "N/A";
    const confDate = (inc as any).eventDate ? new Date((inc as any).eventDate).toLocaleDateString("en-GB") : "N/A";

    return `
      <div class="section-container">
        <h3 class="section-heading">2. Conference Details</h3>
        <table class="minimal-table">
          <tr>
            <td class="lbl-cell" style="width: 18%;">Conference Name:</td>
            <td colspan="3" class="wrap-cell"><strong>${confName}</strong></td>
          </tr>
          <tr>
            <td class="lbl-cell">Organizer & Venue:</td>
            <td style="width: 32%;" class="wrap-cell">${organizer} (${venue})</td>
            <td class="lbl-cell" style="width: 18%;">Event Type & Date:</td>
            <td>${confType} / ${confDate}</td>
          </tr>
        </table>
      </div>
    `;
  }
};

// Helper to determine the dynamic workflow steps for an application
const getWorkflowSteps = (inc: IncentiveApplication) => {
  const isScholar = inc.facultyObj?.role === "scholar" || !!inc.facultyObj?.guide;
  const steps: { key: string; label: string; role: string }[] = [];

  // 1. Applicant stage
  if (isScholar) {
    steps.push({ key: "faculty", label: "Scholar Submitted", role: "Scholar" });
  } else {
    steps.push({ key: "faculty", label: "Faculty Submitted", role: "Faculty" });
  }

  // 2. Librarian stage (only for Faculty)
  if (!isScholar) {
    steps.push({ key: "library", label: "Librarian Approved", role: "Librarian" });
  }

  // 3. Research Guide stage (only for Scholar)
  if (isScholar) {
    steps.push({ key: "guide", label: "Research Guide Approved", role: "Research Guide" });
  }

  // 4. Research Centre Coordinator stage (only for Scholar, if researchCenter is present)
  if (isScholar && inc.facultyObj?.researchCenter) {
    steps.push({ key: "centre_coordinator", label: "Research Centre Coordinator Approved", role: "Research Centre Coordinator" });
  }

  // 5. Research Coordinator stage (only for Scholar, or if Faculty and went through Admin Verification)
  const libraryNote = inc.libraryNote || inc.facultyObj?.libraryNote || "";
  const guideNote = inc.guideNote || inc.facultyObj?.guideNote || "";
  const adminNote = inc.adminNote || inc.facultyObj?.adminNote || "";

  const hasAdminStep = isScholar ||
    inc.status === "Pending Admin" ||
    !!adminNote ||
    (inc.reviewedBy && inc.reviewedBy.some((r: any) => {
      const roleLower = (r.role || "").toLowerCase();
      const rolesLower = (r.roles || []).map((x: string) => x.toLowerCase());
      const nameLower = (r.name || "").toLowerCase();
      return roleLower === "admin" || rolesLower.includes("admin") || nameLower.includes("mccarthy");
    }));

  if (hasAdminStep) {
    steps.push({ key: "coordinator", label: "Research Coordinator Approved", role: "Research Coordinator" });
  }

  // 6. Principal stage (always present)
  steps.push({ key: "principal", label: "Principal Approved", role: "Principal" });

  // 7. Finance stage (only if Paid)
  if (inc.status === "Paid") {
    steps.push({ key: "finance", label: "Finance Approved", role: "Finance" });
  }

  return steps;
};

// Helper to render workflow dynamically
const renderApprovalWorkflow = (inc: IncentiveApplication): string => {
  const steps = getWorkflowSteps(inc);

  return `
    <div class="section-container">
      <h3 class="section-heading">4. Approval Workflow</h3>
      <table class="workflow-table">
        <thead>
          <tr>
            <th style="width: 35%;">Workflow Step</th>
            <th style="width: 30%;">Approved By</th>
            <th style="width: 20%;">Date & Time</th>
            <th style="width: 15%; text-align: right;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${steps.map(step => {
            const data = getApprovalDetails(inc, step.key);
            let statusText = "Pending";
            let symbol = "☐";
            let rowClass = "pending-row";
            let badgeClass = "workflow-pending";

            if (data.approved) {
              statusText = "Approved";
              symbol = "✔";
              rowClass = "approved-row";
              badgeClass = "workflow-approved";
            } else if (data.rejected) {
              statusText = "Rejected";
              symbol = "✖";
              rowClass = "rejected-row";
              badgeClass = "workflow-rejected";
            }

            return `
              <tr class="${rowClass}">
                <td style="font-weight: 500;">${symbol} ${step.label}</td>
                <td>${data.approved || data.rejected ? data.name : "—"}</td>
                <td>${data.approved || data.rejected ? `${data.date} ${data.time}` : "—"}</td>
                <td style="text-align: right;"><span class="badge ${badgeClass}">${statusText}</span></td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
};

// Helper to render signature blocks dynamically
const renderSignatureSection = (inc: IncentiveApplication): string => {
  const steps = getWorkflowSteps(inc).map(s => {
    let roleTitle = s.role;
    if (s.key === "faculty") {
      roleTitle = inc.facultyObj?.role === "scholar" ? "Scholar Applicant" : "Faculty Applicant";
    }
    return { key: s.key, role: roleTitle };
  });

  const renderBlock = (stepKey: string, roleTitle: string) => {
    const data = getApprovalDetails(inc, stepKey);

    return `
      <div class="sig-box">
        <div class="sig-role-header">${roleTitle}</div>
        <div class="sig-content">
          ${data.approved ? `
            <div class="sig-status approved-sig">✔ Digitally Approved</div>
            <div class="sig-detail">Approved by: ${data.name}</div>
            <div class="sig-detail">Date: ${data.date}</div>
            <div class="sig-detail">Time: ${data.time}</div>
          ` : data.rejected ? `
            <div class="sig-status rejected-sig" style="color: #ef4444; font-weight: 700; text-align: center; text-transform: uppercase;">✖ Digitally Rejected</div>
            <div class="sig-detail">Rejected by: ${data.name}</div>
            <div class="sig-detail">Date: ${data.date}</div>
            <div class="sig-detail">Time: ${data.time}</div>
          ` : `
            <div class="sig-status pending-sig">Pending Approval</div>
            <div class="sig-empty-space"></div>
          `}
        </div>
      </div>
    `;
  };

  return `
    <div class="section-container">
      <h3 class="section-heading">5. Signatures and Approvals</h3>
      <div class="signatures-grid">
        ${steps.map(s => renderBlock(s.key, s.role)).join("")}
      </div>
    </div>
  `;
};

/**
 * Generate and trigger download / print of redesigned official minimal A4 PDF
 */
export const downloadIncentiveSanctionPDF = (inc: IncentiveApplication, user: any) => {
  const printWindow = window.open("", "_blank", "width=850,height=1100");
  if (!printWindow) {
    alert("Please allow pop-ups for this website to view the Incentive Claim Form.");
    return;
  }

  const logoUrl = `${window.location.origin}/logo.png`;
  const refNo = `MCK/R&D/INC/${(inc.id || "00000000").substring(0, 8).toUpperCase()}`;
  const formattedDate = new Date(inc.dateApplied).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const reqAmountStr = inc.amountRequested.toLocaleString("en-IN");
  const approvedAmount = inc.status === "Approved" || inc.status === "Paid" ? inc.amountRequested : 0;
  const approvedAmountStr = approvedAmount > 0 ? `₹${approvedAmount.toLocaleString("en-IN")}` : "Pending Approval";

  const remarks = inc.facultyObj?.principalNote || inc.facultyObj?.adminNote || inc.facultyObj?.guideNote || inc.facultyObj?.libraryNote || "None";
  const qrData = `${window.location.origin}/verify/incentive/${inc.id}`;
  const docVer = `VER-${(inc.id || "00000000").substring(0, 6).toUpperCase()}-2.2`;
  const now = new Date().toLocaleString("en-GB");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Research_Incentive_Form_${refNo.replace(/\//g, "_")}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          @page {
            size: A4 portrait;
            margin: 20mm;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            color: #1f2937;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
            line-height: 1.4;
            font-size: 11px;
          }
          
          .document-wrapper {
            position: relative;
            box-sizing: border-box;
            width: 100%;
          }

          /* Header Layout */
          .header-container {
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 2px solid #111827;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          
          .logo-cell {
            flex: 0 0 100px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .logo-cell img {
            width: 90px;
            height: auto;
          }
          
          .header-text {
            flex: 1;
            text-align: center;
            padding-right: 100px; /* offset logo for centering */
          }
          
          .header-text h1 {
            font-size: 16px;
            font-weight: 700;
            margin: 0;
            text-transform: uppercase;
            color: #111827;
          }
          
          .header-text h2 {
            font-size: 12px;
            font-weight: 600;
            margin: 2px 0 0 0;
            text-transform: uppercase;
            color: #4b5563;
          }
          
          .header-text .subtitle {
            font-size: 12px;
            font-weight: 700;
            color: #9B0302;
            margin: 6px 0 2px 0;
            text-transform: uppercase;
          }
          
          .header-text .address {
            font-size: 9px;
            color: #6b7280;
            margin: 0;
          }

          /* Title */
          .title-banner {
            text-align: center;
            font-weight: 700;
            font-size: 12px;
            color: #9B0302;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
          }

          /* Reference Grid */
          .reference-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            border: 1px solid #cbd5e1;
            padding: 8px 12px;
            margin-bottom: 15px;
            background-color: #fafafa;
          }
          
          .ref-item {
            font-size: 10.5px;
          }

          /* Section Layout */
          .section-container {
            margin-bottom: 15px;
          }
          
          .section-heading {
            font-size: 11px;
            font-weight: 700;
            color: #9B0302;
            margin: 0 0 6px 0;
            text-transform: uppercase;
            border-bottom: 1.5px solid #cbd5e1;
            padding-bottom: 2px;
          }

          /* Minimal Tables */
          .minimal-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #cbd5e1;
          }
          
          .minimal-table td {
            border: 1px solid #cbd5e1;
            padding: 10px 12px;
            vertical-align: middle;
          }
          
          .minimal-table td.lbl-cell {
            background-color: #f8fafc;
            font-weight: 600;
            color: #475569;
            width: 20%;
          }

          .wrap-cell {
            word-break: break-word;
            white-space: normal;
          }

          /* Workflow Table */
          .workflow-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #cbd5e1;
          }
          
          .workflow-table th, .workflow-table td {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            font-size: 10.5px;
            vertical-align: middle;
          }
          
          .workflow-table th {
            background-color: #f1f5f9;
            font-weight: 700;
          }
          
          .approved-row {
            background-color: #f8fafc;
          }
          
          .pending-row {
            background-color: #ffffff;
            color: #64748b;
          }
          
          .rejected-row {
            background-color: #fef2f2;
            color: #991b1b;
          }
          
          .badge {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            border: 1px solid currentColor;
            padding: 1px 5px;
            display: inline-block;
          }
          
          .workflow-approved {
            color: #10b981;
          }
          
          .workflow-pending {
            color: #f59e0b;
          }
          
          .workflow-rejected {
            color: #ef4444;
          }

          /* Declaration */
          .declaration-box {
            border: 1px solid #cbd5e1;
            padding: 12px;
            margin-bottom: 15px;
            font-size: 10px;
            line-height: 1.4;
          }
          
          .declaration-signature {
            margin-top: 12px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          
          .declaration-sig-line {
            width: 150px;
            border-top: 1px solid #111827;
            margin-bottom: 4px;
          }

          /* Signatures */
          .signatures-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          
          .sig-box {
            border: 1px solid #cbd5e1;
            padding: 10px;
            background-color: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 100px;
          }

          .sig-role-header {
            font-size: 10.5px;
            font-weight: 700;
            color: #374151;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin-bottom: 6px;
            text-transform: uppercase;
            text-align: center;
          }

          .sig-content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            text-align: left;
            font-size: 9.5px;
          }

          .sig-status {
            font-weight: 700;
            text-transform: uppercase;
            font-size: 9.5px;
            margin-bottom: 4px;
            text-align: center;
          }

          .approved-sig {
            color: #047857;
          }

          .pending-sig {
            color: #6b7280;
            font-style: italic;
          }

          .sig-detail {
            color: #4b5563;
            line-height: 1.3;
          }

          .sig-empty-space {
            height: 40px;
          }

          /* Footer wrapper matching exact layout */
          .footer-wrapper {
            border-top: 1.5px solid #111827;
            padding-top: 12px;
            margin-top: 25px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .footer-left {
            font-size: 9px;
            color: #4b5563;
            line-height: 1.4;
          }
          
          .footer-right {
            text-align: right;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
          
          .footer-right img {
            width: 85px;
            height: 85px;
            border: 1px solid #cbd5e1;
            padding: 2px;
            background-color: white;
            margin-bottom: 4px;
          }
          
          .footer-right .ver-code {
            font-size: 8px;
            color: #6b7280;
            font-weight: 600;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page {
              margin: 20mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="document-wrapper">
          <!-- Logo & Header -->
          <div class="header-container">
            <div class="logo-cell">
              <img src="${logoUrl}" alt="Logo" onerror="this.src='https://raw.githubusercontent.com/sijomonps/assets/main/marian-logo.png';">
            </div>
            <div class="header-text">
              <h1>Marian College Kuttikkanam</h1>
              <h2>(Autonomous)</h2>
              <div class="subtitle">Office of Research & Development</div>
              <div class="address">
                Kuttikkanam P.O., Peermade, Idukki District, Kerala - 685531 | www.mariancollege.org
              </div>
            </div>
          </div>

          <!-- Title -->
          <div class="title-banner">
            Research Incentive Claim Form
          </div>

          <!-- Reference & Status Block -->
          <div class="reference-grid">
            <div class="ref-item">
              <strong>Reference Number:</strong><br>${refNo}
            </div>
            <div class="ref-item">
              <strong>Application Date:</strong><br>${formattedDate}
            </div>
            <div class="ref-item" style="text-align: right;">
              <strong>Current Status:</strong><br>
              <span class="badge ${inc.status === 'Approved' || inc.status === 'Paid' ? 'workflow-approved' : inc.status === 'Rejected' ? 'workflow-rejected' : 'workflow-pending'}">
                ${inc.status}
              </span>
            </div>
          </div>

          <!-- Faculty Info -->
          ${renderFacultySection(inc, user)}

          <!-- Category details -->
          ${renderPublicationSection(inc)}

          <!-- Incentive Financial Details -->
          <div class="section-container">
            <h3 class="section-heading">3. Incentive Details</h3>
            <table class="minimal-table">
              <tr>
                <td class="lbl-cell">Requested Amount:</td>
                <td>₹${reqAmountStr}/-</td>
                <td class="lbl-cell">Approved Amount:</td>
                <td><strong>${approvedAmountStr}</strong></td>
              </tr>
              <tr>
                <td class="lbl-cell">Remarks:</td>
                <td colspan="3">${remarks}</td>
              </tr>
            </table>
          </div>

          <!-- Workflow Section -->
          ${renderApprovalWorkflow(inc)}

          <!-- Declaration Block -->
          <div class="declaration-box">
            I hereby declare that the information provided above is true and that this publication/patent/conference is eligible under the Marian College Research Incentive Policy.
            <div class="declaration-signature">
              <div>Date: _________________</div>
              <div>
                <div class="declaration-sig-line"></div>
                <div style="font-weight: bold; text-align: center;">Signature of Faculty Member</div>
              </div>
            </div>
          </div>

          <!-- Signatures Section -->
          ${renderSignatureSection(inc)}

          <!-- Footer with QR Code and Verification code embedded inside -->
          <div class="footer-wrapper">
            <div class="footer-left">
              Generated by: MarianResearch Portal<br/>
              Generated On: ${now}<br/>
              This is a computer-generated document and does not require a physical signature if digitally verified.
            </div>
            <div class="footer-right">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}" alt="QR Code">
              <div class="ver-code">Verification Code: ${docVer}</div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

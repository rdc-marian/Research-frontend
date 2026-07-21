import { IncentiveApplication } from "./mockIncentives";

/**
 * Generate and trigger download / print of official Incentive Sanction Voucher PDF
 */
export const downloadIncentiveSanctionPDF = (inc: IncentiveApplication, user: any) => {
  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) {
    alert("Please allow pop-ups for this website to download/print the Sanction Voucher.");
    return;
  }

  const refNo = `MCK/R&D/INC/${(inc.id || "00000000").substring(0, 8).toUpperCase()}`;
  const formattedDate = new Date(inc.dateApplied).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const amountStr = inc.amountRequested.toLocaleString("en-IN");
  const detailTitle =
    inc.category === "Publication"
      ? inc.publicationTitle || "N/A"
      : inc.category === "Patent"
      ? inc.patentTitle || "N/A"
      : inc.eventName || "N/A";

  const detailSub =
    inc.category === "Publication"
      ? inc.journalName
      : inc.category === "Patent"
      ? `Patent No: ${inc.patentNumber || "N/A"}`
      : `Event Type: ${inc.eventType || "N/A"}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sanction_Voucher_${refNo.replace(/\//g, "_")}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 40px;
            background: #ffffff;
          }
          .voucher-card {
            max-width: 750px;
            margin: 0 auto;
            border: 2px solid #9B0302;
            padding: 36px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            position: relative;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .header h1 {
            color: #9B0302;
            font-size: 22px;
            font-weight: 800;
            margin: 0 0 4px 0;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          .header h2 {
            font-size: 13px;
            color: #475569;
            font-weight: 600;
            margin: 0 0 6px 0;
          }
          .header p {
            font-size: 11px;
            color: #64748b;
            margin: 0;
          }
          .title-badge {
            background: #9B0302;
            color: #ffffff;
            text-align: center;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 1px;
            margin-bottom: 24px;
            text-transform: uppercase;
          }
          .ref-grid {
            display: flex;
            justify-content: space-between;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 18px;
            margin-bottom: 24px;
            font-size: 12px;
          }
          .ref-grid div {
            line-height: 1.5;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 28px;
          }
          .info-table th {
            text-align: left;
            background: #f1f5f9;
            padding: 10px 14px;
            font-size: 11px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            border-bottom: 1px solid #cbd5e1;
            width: 32%;
          }
          .info-table td {
            padding: 12px 14px;
            font-size: 13px;
            color: #1e293b;
            border-bottom: 1px solid #e2e8f0;
          }
          .amount-box {
            background: #ecfdf5;
            border: 2px dashed #10b981;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            margin-bottom: 32px;
          }
          .amount-box .label {
            font-size: 11px;
            font-weight: 700;
            color: #047857;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .amount-box .val {
            font-size: 28px;
            font-weight: 800;
            color: #065f46;
            margin-top: 4px;
          }
          .instruction {
            background: #fffbebfb;
            border-left: 4px solid #f59e0b;
            padding: 12px 16px;
            font-size: 11px;
            color: #78350f;
            border-radius: 4px;
            margin-bottom: 40px;
            line-height: 1.5;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            padding-top: 20px;
          }
          .sig-box {
            text-align: center;
            width: 30%;
          }
          .sig-line {
            border-top: 1.5px dashed #94a3b8;
            margin-bottom: 8px;
          }
          .sig-title {
            font-size: 11px;
            font-weight: 700;
            color: #334155;
          }
          .sig-sub {
            font-size: 10px;
            color: #64748b;
          }
          @media print {
            body { padding: 0; background: none; }
            .voucher-card { border: 2px solid #9B0302; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="voucher-card">
          <div class="header">
            <h1>MARIAN COLLEGE KUTTIKKANAM AUTONOMOUS</h1>
            <h2>OFFICE OF RESEARCH & DEVELOPMENT</h2>
            <p>Kuttikkanam P.O., Peermade, Idukki District, Kerala - 685531 | Web: www.mariancollege.org</p>
          </div>

          <div class="title-badge">
            RESEARCH INCENTIVE SANCTION VOUCHER
          </div>

          <div class="ref-grid">
            <div>
              <strong>Voucher Ref No:</strong> ${refNo}<br/>
              <strong>Date of Issue:</strong> ${formattedDate}
            </div>
            <div style="text-align: right;">
              <strong>Sanction Status:</strong> <span style="color: #059669; font-weight: 700;">APPROVED & SANCTIONED</span><br/>
              <strong>Authority:</strong> Principal / R&D Cell
            </div>
          </div>

          <table class="info-table">
            <tr>
              <th>Faculty Name</th>
              <td><strong>${inc.facultyName}</strong></td>
            </tr>
            <tr>
              <th>Email & Department</th>
              <td>${inc.facultyEmail} ${inc.department ? `(${inc.department})` : ""}</td>
            </tr>
            <tr>
              <th>Incentive Category</th>
              <td><strong>${inc.category}</strong></td>
            </tr>
            <tr>
              <th>Title / Particulars</th>
              <td>
                <strong>${detailTitle}</strong>
                ${detailSub ? `<br/><span style="font-size: 11px; color: #64748b;">${detailSub}</span>` : ""}
              </td>
            </tr>
          </table>

          <div class="amount-box">
            <div class="label">Approved Sanction Amount</div>
            <div class="val">₹${amountStr}/-</div>
          </div>

          <div class="instruction">
            <strong>OFFICE COLLECTION INSTRUCTION:</strong><br/>
            This voucher serves as official authorization for research incentive disbursement. The faculty recipient is requested to submit this signed voucher at the College Accounts / Finance Office to receive payment.
          </div>

          <div class="signatures">
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-title">Research Coordinator</div>
              <div class="sig-sub">R&D Cell</div>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-title">Finance Officer</div>
              <div class="sig-sub">Accounts Division</div>
            </div>
            <div class="sig-box">
              <div class="sig-line"></div>
              <div class="sig-title">Principal</div>
              <div class="sig-sub">Marian College Kuttikkanam</div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

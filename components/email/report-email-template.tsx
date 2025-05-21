import type * as React from "react"

interface ReportEmailTemplateProps {
  reportData: any
  senderName: string
  message?: string
}

export const ReportEmailTemplate: React.FC<ReportEmailTemplateProps> = ({ reportData, senderName, message }) => {
  const student = reportData.student

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "20px 0", borderBottom: "2px solid #f0f0f0" }}>
        <h1 style={{ color: "#333", margin: "0" }}>Vurra Secondary School</h1>
        <p style={{ color: "#666", margin: "5px 0" }}>Student Report Card</p>
      </div>

      <div style={{ padding: "20px 0" }}>
        <p>Dear Parent/Guardian,</p>

        {message ? <p>{message}</p> : <p>Please find attached the academic report card for {student.user.name}.</p>}

        <div style={{ margin: "20px 0", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "5px" }}>
          <p>
            <strong>Student:</strong> {student.user.name}
          </p>
          <p>
            <strong>Class:</strong> {student.class?.name || "Not Assigned"}
          </p>
          <p>
            <strong>Overall Average:</strong> {reportData.overallAverage.toFixed(2)}%
          </p>
          <p>
            <strong>Total Exams:</strong> {reportData.totalExams}
          </p>
        </div>

        <p>Please review the attached report card and contact the school if you have any questions or concerns.</p>

        <p style={{ marginTop: "30px" }}>
          Best regards,
          <br />
          {senderName}
          <br />
          Vurra Secondary School
        </p>
      </div>

      <div
        style={{
          borderTop: "2px solid #f0f0f0",
          padding: "20px 0",
          fontSize: "12px",
          color: "#666",
          textAlign: "center",
        }}
      >
        <p>Vurra Secondary School - Excellence in Education</p>
        <p>Arua City, Uganda</p>
      </div>
    </div>
  )
}

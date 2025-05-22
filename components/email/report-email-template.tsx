import type * as React from "react"

interface ReportEmailTemplateProps {
  reportData: any
  senderName: string
  message?: string
}

export const ReportEmailTemplate: React.FC<ReportEmailTemplateProps> = ({ reportData, senderName, message }) => {
  const student = reportData.student
  const term = reportData.term || "Term 1"
  const academicYear = reportData.academicYear || "2023/2024"
  const subjects = reportData.subjects || []
  const attendance = reportData.attendance || { present: 85, absent: 5, late: 10, total: 100 }
  const comments = reportData.comments || {
    classTeacher: "A hardworking student who shows great potential.",
    headTeacher: "Keep up the good work and continue to strive for excellence.",
  }

  // Calculate attendance percentage
  const attendancePercentage = ((attendance.present / attendance.total) * 100).toFixed(1)

  // Get grade colors based on performance
  const getGradeColor = (grade: string) => {
    const gradeColors: Record<string, string> = {
      A: "#4CAF50",
      B: "#8BC34A",
      C: "#FFC107",
      D: "#FF9800",
      E: "#FF5722",
      F: "#F44336",
    }
    return gradeColors[grade.charAt(0)] || "#333333"
  }

  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        color: "#333",
        backgroundColor: "#fff",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)",
          color: "white",
          padding: "25px",
          textAlign: "center",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "10px" }}>
          <div
            style={{
              width: "70px",
              height: "70px",
              backgroundColor: "#fff",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "15px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}
          >
            <span style={{ fontSize: "24px", fontWeight: "bold", color: "#1a237e" }}>VSS</span>
          </div>
          <div>
            <h1 style={{ margin: "0", fontSize: "28px", fontWeight: "600" }}>Vurra Secondary School</h1>
            <p style={{ margin: "5px 0 0", fontSize: "16px", opacity: "0.9" }}>Excellence in Education</p>
          </div>
        </div>
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            padding: "8px 15px",
            borderRadius: "4px",
            display: "inline-block",
            marginTop: "10px",
          }}
        >
          <h2 style={{ margin: "0", fontSize: "18px", fontWeight: "500" }}>Academic Report Card</h2>
          <p style={{ margin: "5px 0 0", fontSize: "14px" }}>
            {term} - {academicYear}
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "30px" }}>
        {/* Introduction */}
        <div style={{ marginBottom: "25px" }}>
          <p style={{ fontSize: "16px", lineHeight: "1.5" }}>Dear Parent/Guardian,</p>
          {message ? (
            <p style={{ fontSize: "16px", lineHeight: "1.5" }}>{message}</p>
          ) : (
            <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
              Please find below the academic report card for {student.user.name} for {term} of the {academicYear}{" "}
              academic year. This report provides a comprehensive overview of your child's academic performance and
              progress.
            </p>
          )}
        </div>

        {/* Student Information */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "25px",
            border: "1px solid #e9ecef",
          }}
        >
          <h3
            style={{
              margin: "0 0 15px",
              fontSize: "18px",
              fontWeight: "600",
              color: "#1a237e",
              borderBottom: "2px solid #e0e0e0",
              paddingBottom: "8px",
            }}
          >
            Student Information
          </h3>

          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <div style={{ flex: "1", minWidth: "250px", marginBottom: "15px" }}>
              <p style={{ margin: "0 0 8px", fontSize: "14px" }}>
                <strong style={{ display: "inline-block", width: "120px", color: "#555" }}>Student Name:</strong>
                <span style={{ fontWeight: "500" }}>{student.user.name}</span>
              </p>
              <p style={{ margin: "0 0 8px", fontSize: "14px" }}>
                <strong style={{ display: "inline-block", width: "120px", color: "#555" }}>Student ID:</strong>
                <span>{student.id || "N/A"}</span>
              </p>
              <p style={{ margin: "0 0 8px", fontSize: "14px" }}>
                <strong style={{ display: "inline-block", width: "120px", color: "#555" }}>Class:</strong>
                <span>{student.class?.name || "Not Assigned"}</span>
              </p>
            </div>

            <div style={{ flex: "1", minWidth: "250px", marginBottom: "15px" }}>
              <p style={{ margin: "0 0 8px", fontSize: "14px" }}>
                <strong style={{ display: "inline-block", width: "120px", color: "#555" }}>Term:</strong>
                <span>{term}</span>
              </p>
              <p style={{ margin: "0 0 8px", fontSize: "14px" }}>
                <strong style={{ display: "inline-block", width: "120px", color: "#555" }}>Academic Year:</strong>
                <span>{academicYear}</span>
              </p>
              <p style={{ margin: "0 0 8px", fontSize: "14px" }}>
                <strong style={{ display: "inline-block", width: "120px", color: "#555" }}>Class Teacher:</strong>
                <span>{reportData.classTeacher || "Mr. John Doe"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Academic Performance */}
        <div style={{ marginBottom: "25px" }}>
          <h3
            style={{
              margin: "0 0 15px",
              fontSize: "18px",
              fontWeight: "600",
              color: "#1a237e",
              borderBottom: "2px solid #e0e0e0",
              paddingBottom: "8px",
            }}
          >
            Academic Performance
          </h3>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#1a237e", color: "white" }}>
                  <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600" }}>Subject</th>
                  <th style={{ padding: "12px 15px", textAlign: "center", fontWeight: "600" }}>Score (%)</th>
                  <th style={{ padding: "12px 15px", textAlign: "center", fontWeight: "600" }}>Grade</th>
                  <th style={{ padding: "12px 15px", textAlign: "left", fontWeight: "600" }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length > 0
                  ? subjects.map((subject: any, index: number) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                          borderBottom: "1px solid #e9ecef",
                        }}
                      >
                        <td style={{ padding: "12px 15px", fontWeight: "500" }}>{subject.name}</td>
                        <td style={{ padding: "12px 15px", textAlign: "center" }}>{subject.score}</td>
                        <td style={{ padding: "12px 15px", textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 10px",
                              borderRadius: "3px",
                              fontWeight: "bold",
                              backgroundColor: getGradeColor(subject.grade),
                              color: "white",
                            }}
                          >
                            {subject.grade}
                          </span>
                        </td>
                        <td style={{ padding: "12px 15px" }}>{subject.remarks || "Good effort"}</td>
                      </tr>
                    ))
                  : // Sample data if no subjects are provided
                    [
                      { name: "Mathematics", score: 85, grade: "A", remarks: "Excellent work" },
                      { name: "English", score: 78, grade: "B", remarks: "Good performance" },
                      { name: "Science", score: 92, grade: "A", remarks: "Outstanding" },
                      { name: "Social Studies", score: 75, grade: "B", remarks: "Satisfactory" },
                      { name: "Computer Studies", score: 88, grade: "A", remarks: "Very good" },
                    ].map((subject, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                          borderBottom: "1px solid #e9ecef",
                        }}
                      >
                        <td style={{ padding: "12px 15px", fontWeight: "500" }}>{subject.name}</td>
                        <td style={{ padding: "12px 15px", textAlign: "center" }}>{subject.score}</td>
                        <td style={{ padding: "12px 15px", textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 10px",
                              borderRadius: "3px",
                              fontWeight: "bold",
                              backgroundColor: getGradeColor(subject.grade),
                              color: "white",
                            }}
                          >
                            {subject.grade}
                          </span>
                        </td>
                        <td style={{ padding: "12px 15px" }}>{subject.remarks}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Summary */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              flex: "1",
              minWidth: "200px",
              backgroundColor: "#e8f5e9",
              borderRadius: "8px",
              padding: "15px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h4 style={{ margin: "0 0 10px", color: "#2e7d32", fontSize: "16px" }}>Overall Average</h4>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1b5e20",
                marginBottom: "5px",
              }}
            >
              {reportData.overallAverage.toFixed(1)}%
            </div>
            <p style={{ margin: "0", fontSize: "14px", color: "#388e3c" }}>
              {reportData.overallAverage >= 80
                ? "Excellent"
                : reportData.overallAverage >= 70
                  ? "Very Good"
                  : reportData.overallAverage >= 60
                    ? "Good"
                    : reportData.overallAverage >= 50
                      ? "Satisfactory"
                      : "Needs Improvement"}
            </p>
          </div>

          <div
            style={{
              flex: "1",
              minWidth: "200px",
              backgroundColor: "#e3f2fd",
              borderRadius: "8px",
              padding: "15px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h4 style={{ margin: "0 0 10px", color: "#1565c0", fontSize: "16px" }}>Class Position</h4>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#0d47a1",
                marginBottom: "5px",
              }}
            >
              {reportData.position || "3"}/{reportData.totalStudents || "45"}
            </div>
            <p style={{ margin: "0", fontSize: "14px", color: "#1976d2" }}>
              {reportData.positionChange
                ? reportData.positionChange > 0
                  ? `Improved by ${reportData.positionChange} position(s)`
                  : `Dropped by ${Math.abs(reportData.positionChange)} position(s)`
                : "Consistent performance"}
            </p>
          </div>

          <div
            style={{
              flex: "1",
              minWidth: "200px",
              backgroundColor: "#fff3e0",
              borderRadius: "8px",
              padding: "15px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h4 style={{ margin: "0 0 10px", color: "#e65100", fontSize: "16px" }}>Attendance</h4>
            <div
              style={{
                fontSize: "28px",
                fontWeight: "bold",
                color: "#ef6c00",
                marginBottom: "5px",
              }}
            >
              {attendancePercentage}%
            </div>
            <p style={{ margin: "0", fontSize: "14px", color: "#f57c00" }}>
              Present: {attendance.present} | Absent: {attendance.absent} | Late: {attendance.late}
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "25px",
            border: "1px solid #e9ecef",
          }}
        >
          <h3
            style={{
              margin: "0 0 15px",
              fontSize: "18px",
              fontWeight: "600",
              color: "#1a237e",
              borderBottom: "2px solid #e0e0e0",
              paddingBottom: "8px",
            }}
          >
            Teacher Comments
          </h3>

          <div style={{ marginBottom: "15px" }}>
            <h4 style={{ margin: "0 0 8px", fontSize: "16px", color: "#555" }}>Class Teacher:</h4>
            <p
              style={{
                margin: "0",
                padding: "10px 15px",
                backgroundColor: "white",
                borderRadius: "5px",
                border: "1px solid #e0e0e0",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              {comments.classTeacher}
            </p>
          </div>

          <div>
            <h4 style={{ margin: "0 0 8px", fontSize: "16px", color: "#555" }}>Head Teacher:</h4>
            <p
              style={{
                margin: "0",
                padding: "10px 15px",
                backgroundColor: "white",
                borderRadius: "5px",
                border: "1px solid #e0e0e0",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              {comments.headTeacher}
            </p>
          </div>
        </div>

        {/* Next Term Information */}
        <div
          style={{
            backgroundColor: "#ede7f6",
            borderRadius: "8px",
            padding: "15px 20px",
            marginBottom: "25px",
            border: "1px solid #d1c4e9",
          }}
        >
          <h3
            style={{
              margin: "0 0 10px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#4527a0",
            }}
          >
            Next Term Information
          </h3>
          <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.5", color: "#5e35b1" }}>
            The next term begins on {reportData.nextTermDate || "January 15, 2024"}. Please ensure all school fees are
            paid before the start of the term.
          </p>
        </div>

        {/* Closing */}
        <div style={{ marginBottom: "30px" }}>
          <p style={{ fontSize: "14px", lineHeight: "1.5" }}>
            Please review this report card with your child and contact the school if you have any questions or concerns.
            We appreciate your continued support in your child's education.
          </p>

          <div style={{ marginTop: "30px" }}>
            <p style={{ fontSize: "14px", margin: "0 0 5px" }}>Best regards,</p>
            <div style={{ marginTop: "15px", display: "flex", alignItems: "flex-end" }}>
              <div style={{ marginRight: "50px" }}>
                <div
                  style={{
                    borderBottom: "1px solid #999",
                    width: "150px",
                    marginBottom: "5px",
                    paddingBottom: "5px",
                    fontStyle: "italic",
                    color: "#555",
                  }}
                >
                  {senderName}
                </div>
                <p style={{ margin: "0", fontSize: "13px", color: "#666" }}>School Administrator</p>
              </div>

              <div>
                <div
                  style={{
                    borderBottom: "1px solid #999",
                    width: "150px",
                    marginBottom: "5px",
                    paddingBottom: "5px",
                  }}
                ></div>
                <p style={{ margin: "0", fontSize: "13px", color: "#666" }}>Date</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: "#1a237e",
          color: "white",
          padding: "25px",
          borderBottomLeftRadius: "8px",
          borderBottomRightRadius: "8px",
          fontSize: "13px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between" }}>
          <div style={{ flex: "1", minWidth: "200px", marginBottom: "15px" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: "600" }}>Vurra Secondary School</h4>
            <p style={{ margin: "0 0 5px", opacity: "0.8" }}>Excellence in Education</p>
            <p style={{ margin: "0", opacity: "0.8" }}>Established 1985</p>
          </div>

          <div style={{ flex: "1", minWidth: "200px", marginBottom: "15px" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: "600" }}>Contact Information</h4>
            <p style={{ margin: "0 0 5px", opacity: "0.8" }}>P.O. Box 123, Arua City, Uganda</p>
            <p style={{ margin: "0 0 5px", opacity: "0.8" }}>Phone: +256 123 456 789</p>
            <p style={{ margin: "0", opacity: "0.8" }}>Email: info@vurrasecondary.ac.ug</p>
          </div>

          <div style={{ flex: "1", minWidth: "200px", marginBottom: "15px" }}>
            <h4 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: "600" }}>School Hours</h4>
            <p style={{ margin: "0 0 5px", opacity: "0.8" }}>Monday - Friday: 8:00 AM - 4:30 PM</p>
            <p style={{ margin: "0", opacity: "0.8" }}>Saturday: 8:00 AM - 12:30 PM (Activities)</p>
          </div>
        </div>

        <div
          style={{
            marginTop: "20px",
            paddingTop: "15px",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            textAlign: "center",
            opacity: "0.7",
            fontSize: "12px",
          }}
        >
          <p style={{ margin: "0" }}>© {new Date().getFullYear()} Vurra Secondary School. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

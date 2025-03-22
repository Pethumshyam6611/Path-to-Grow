// CvAnalysis.js
import React, { useState, useEffect, useRef } from "react";
import { Container, Button, Form, Spinner, Card, Row, Col, Alert, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import { Chart } from "react-google-charts";

const CvAnalysis = () => {
  const navigate = useNavigate();
  const cvChartRef = useRef(null);
  const [user, setUser] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [jobPosting, setJobPosting] = useState("");
  const [cvLoading, setCvLoading] = useState(false);
  const [cvError, setCvError] = useState("");
  const [matchScore, setMatchScore] = useState("");
  const [cvSkillGap, setCvSkillGap] = useState("");
  const [cvRecommendations, setCvRecommendations] = useState("");
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  const [cvSkillGapData, setCvSkillGapData] = useState({ current: [], required: [], skills: [] });
  const [cvChartReady, setCvChartReady] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token || !userData) {
      alert("Please log in first!");
      navigate("/");
    }

    setUser(userData);
  }, [navigate]);

  const handleCvFileChange = (e) => {
    setCvFile(e.target.files[0]);
  };

  const handleJobPostingChange = (e) => {
    setJobPosting(e.target.value);
  };

  const handleCvAnalysis = async (e) => {
    e.preventDefault();
    if (!cvFile || !jobPosting) {
      setCvError("Please upload a CV and provide a job posting.");
      return;
    }

    setCvLoading(true);
    setCvError("");
    setMatchScore("");
    setCvSkillGap("");
    setCvRecommendations("");
    setSuggestedJobs([]);
    setCvSkillGapData({ current: [], required: [], skills: [] });
    setCvChartReady(false);

    const formData = new FormData();
    formData.append("cv", cvFile);
    formData.append("jobPosting", jobPosting);

    try {
      console.log("Sending CV analysis request...");
      const response = await axios.post(
        "http://localhost:5000/cv/cv-analysis",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const text = response.data.cvAnalysis;
      console.log("Raw CV Analysis Response:", text);

      const sections = text.split("###").map((section) => section.trim()).filter(Boolean);
      sections.forEach((section) => {
        if (section.startsWith("Match Score")) {
          setMatchScore(section.replace("Match Score", "").trim());
        } else if (section.startsWith("Skill Gap")) {
          setCvSkillGap(section.replace("Skill Gap", "").trim());
          parseSkillGap(section);
        } else if (section.startsWith("Recommendations")) {
          setCvRecommendations(section.replace("Recommendations", "").trim());
        } else if (section.startsWith("Suggested Job Postings")) {
          parseSuggestedJobs(section);
        }
      });
    } catch (error) {
      setCvError(error.response?.data?.message || "Error analyzing CV.");
    } finally {
      setCvLoading(false);
    }
  };

  const parseSkillGap = (text) => {
    console.log("Raw Skill Gap Section:", text);
    const lines = text.split("\n").filter((line) => line.trim() !== "" && line.includes("%"));
    const skills = [];
    const current = [];
    const required = [];

    lines.forEach((line) => {
      let match = line.match(/([^-\n]+)\s*-\s*Current:\s*(\d+)%\s*Required:\s*(\d+)%/i);
      if (match) {
        skills.push(match[1].trim());
        current.push(parseInt(match[2]));
        required.push(parseInt(match[3]));
      } else {
        match = line.match(/\[?\s*([^\|\[\]\*]+)\s*\[?\s*(\d+)\s*\|\s*(\d+)\s*\|/);
        if (match) {
          skills.push(match[1].trim());
          current.push(parseInt(match[2]));
          required.push(parseInt(match[3]));
        }
      }
    });

    setCvSkillGapData({ skills, current, required });
    console.log("Parsed CV Skill Gap Data:", { skills, current, required });
  };

  const parseSuggestedJobs = (text) => {
    console.log("Raw Suggested Job Postings Section:", text);
    const lines = text
      .replace("Suggested Job Postings", "")
      .split("\n")
      .filter((line) => line.trim() !== "");
    const jobs = lines.map((line) => {
      const [title, description] = line.split(" - ");
      return { title: title.trim(), description: description.trim() };
    });
    setSuggestedJobs(jobs);
    console.log("Parsed Suggested Job Postings:", jobs);
  };

  const handleCvReset = () => {
    setCvFile(null);
    setJobPosting("");
    setMatchScore("");
    setCvSkillGap("");
    setCvRecommendations("");
    setSuggestedJobs([]);
    setCvSkillGapData({ current: [], required: [], skills: [] });
    setCvError("");
    setCvChartReady(false);
  };

  const downloadPDF = () => {
    if (cvSkillGapData.skills.length > 0 && !cvChartReady) {
      console.error("CV Chart is not ready yet. Please wait for the chart to render.");
      alert("Please wait for the chart to render before downloading the PDF.");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;

    let yOffset = margin;

    const addSection = (title, content, fontSize = 12) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(0, 102, 204);
      if (yOffset + 20 > pageHeight - margin) {
        doc.addPage();
        yOffset = margin;
      }
      doc.text(title, margin, yOffset);
      yOffset += 5;

      doc.setLineWidth(0.5);
      doc.setDrawColor(0, 102, 204);
      doc.line(margin, yOffset, pageWidth - margin, yOffset);
      yOffset += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(fontSize);
      doc.setTextColor(0, 0, 0);
      const splitText = doc.splitTextToSize(content, maxWidth);
      splitText.forEach((line) => {
        if (yOffset + 10 > pageHeight - margin) {
          doc.addPage();
          yOffset = margin;
        }
        doc.text(line, margin, yOffset);
        yOffset += 7;
      });
      yOffset += 10;
    };

    const addChart = () => {
      if (cvChartRef.current) {
        try {
          const chart = cvChartRef.current.chartInstance.visualization;
          if (!chart) {
            throw new Error("Chart visualization is not available.");
          }
          const chartImage = chart.getImageURI();
          if (!chartImage) {
            throw new Error("Chart image URI is not available.");
          }

          if (yOffset + 100 > pageHeight - margin) {
            doc.addPage();
            yOffset = margin;
          }

          doc.setFont("helvetica", "bold");
          doc.setFontSize(16);
          doc.setTextColor(0, 102, 204);
          doc.text("CV Skill Gap Chart", margin, yOffset);
          yOffset += 10;

          const chartWidth = maxWidth;
          const chartHeight = (chartWidth * 2) / 3;
          doc.addImage(chartImage, "PNG", margin, yOffset, chartWidth, chartHeight);
          yOffset += chartHeight + 15;
        } catch (error) {
          console.error("Error adding CV chart to PDF:", error);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          doc.setTextColor(255, 0, 0);
          doc.text("Error: Could not include CV Skill Gap Chart in the PDF.", margin, yOffset);
          yOffset += 10;
        }
      }
    };

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text("PathToGrow CV Analysis Report", margin, yOffset);
    yOffset += 10;

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated for ${user.firstName} ${user.lastName} on ${new Date().toLocaleDateString()}`, margin, yOffset);
    yOffset += 15;

    if (matchScore) {
      addSection("CV Match Score", matchScore);
    }

    if (cvSkillGapData.skills.length > 0) {
      const cvSkillGapText = cvSkillGapData.skills
        .map((skill, index) => `${skill} - Current: ${cvSkillGapData.current[index]}% Required: ${cvSkillGapData.required[index]}%`)
        .join("\n");
      addSection("CV Skill Gap", cvSkillGapText);
      addChart();
    }

    if (cvRecommendations) {
      addSection("CV Recommendations", cvRecommendations);
    }

    if (suggestedJobs.length > 0) {
      const suggestedJobsText = suggestedJobs
        .map((job) => `${job.title} - ${job.description}`)
        .join("\n");
      addSection("Suggested Job Postings", suggestedJobsText);
      addSection("Jobs Suited for Your CV", suggestedJobsText); // Add the new section to the PDF
    }

    doc.save("cv_analysis_report.pdf");
  };

  const cvChartData = [
    ["Skill", "Current (%)", "Required (%)"],
    ...(cvSkillGapData.skills.map((skill, index) => [
      skill,
      cvSkillGapData.current[index],
      cvSkillGapData.required[index],
    ])),
  ];

  return (
    <div className="dashboard-page py-5" style={{ backgroundColor: "#f8f9fa" }}>
      <Container>
        <Card className="shadow mb-5 border-0 rounded">
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col md={2} className="text-center">
                <div
                  className="avatar-placeholder bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto"
                  style={{ width: "80px", height: "80px" }}
                >
                  <h2 className="text-white m-0">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </h2>
                </div>
              </Col>
              <Col md={7}>
                <h3 className="fw-bold mb-1">
                  CV Analysis for {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-muted mb-0">
                  <i className="fas fa-envelope me-2"></i>
                  {user?.email}
                </p>
              </Col>
              <Col md={3} className="text-end">
                <Button
                  variant="outline-primary"
                  className="rounded-pill me-2"
                  onClick={() => navigate("/dashboard")}
                >
                  <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="text-center mb-5">
          <h2 className="fw-bold">CV Analysis</h2>
          <p className="text-muted">Upload your CV and provide a job posting to analyze your fit</p>
        </div>

        <Card className="shadow border-0 mb-5">
          <Card.Body className="p-4">
            <Form onSubmit={handleCvAnalysis}>
              {cvError && <Alert variant="danger">{cvError}</Alert>}
              <Row>
                <Col md={6}>
                  <Form.Group controlId="cvFile" className="mb-3">
                    <Form.Label className="fw-bold">Upload Your CV (PDF)</Form.Label>
                    <Form.Control
                      type="file"
                      accept="application/pdf"
                      onChange={handleCvFileChange}
                      className="py-2"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="jobPosting" className="mb-3">
                    <Form.Label className="fw-bold">Job Posting</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={jobPosting}
                      onChange={handleJobPostingChange}
                      placeholder="Paste the job description here..."
                      className="py-2"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-between mt-4">
                <Button variant="outline-secondary" onClick={handleCvReset} disabled={cvLoading}>
                  <i className="fas fa-undo me-2"></i>Reset
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={cvLoading}
                >
                  {cvLoading ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    <i className="fas fa-file-alt me-2"></i>
                  )}
                  Analyze CV
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        {(matchScore || cvSkillGap || cvRecommendations || suggestedJobs.length > 0) && !cvLoading && (
          <>
            <Row className="mb-4">
              <Col md={6} className="mb-4">
                <Card className="shadow border-0 h-100">
                  <Card.Header className="bg-purple text-white py-3" style={{ backgroundColor: "#6f42c1" }}>
                    <h4 className="mb-0 fw-bold">Match Score</h4>
                  </Card.Header>
                  <Card.Body className="p-4" style={{ minHeight: "150px" }}>
                    <h5>{matchScore}</h5>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} className="mb-4">
                <Card className="shadow border-0 h-100">
                  <Card.Header className="bg-warning text-white py-3">
                    <h4 className="mb-0 fw-bold">CV Skill Gap</h4>
                  </Card.Header>
                  <Card.Body className="p-4" style={{ minHeight: "150px" }}>
                    <ul className="list-unstyled">
                      {cvSkillGapData.skills.map((skill, index) => (
                        <li key={index} className="mb-2" style={{ fontSize: "1.1rem" }}>
                          <strong>{skill}</strong> - Current: {cvSkillGapData.current[index]}%, Required: {cvSkillGapData.required[index]}%
                        </li>
                      ))}
                      {cvSkillGapData.skills.length === 0 && (
                        <p className="text-muted">No skill gap data available.</p>
                      )}
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={12} className="mb-4">
                <Card className="shadow border-0 h-100">
                  <Card.Header className="bg-info text-white py-3">
                    <h4 className="mb-0 fw-bold">CV Recommendations</h4>
                  </Card.Header>
                  <Card.Body className="p-4" style={{ overflowY: "auto", minHeight: "150px" }}>
                    {cvRecommendations.split("\n").map((line, index) => (
                      <p key={index} className="mb-2" style={{ fontSize: "1.1rem" }}>
                        {line}
                      </p>
                    ))}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {suggestedJobs.length > 0 && (
              <Row className="mb-4">
                <Col md={12} className="mb-4">
                  <Card className="shadow border-0 h-100">
                    <Card.Header className="bg-success text-white py-3">
                      <h4 className="mb-0 fw-bold">Suggested Job Postings</h4>
                    </Card.Header>
                    <Card.Body className="p-4" style={{ overflowY: "auto", minHeight: "150px" }}>
                      <ul className="list-unstyled">
                        {suggestedJobs.map((job, index) => (
                          <li key={index} className="mb-2" style={{ fontSize: "1.1rem" }}>
                            <strong>{job.title}</strong> - {job.description}
                          </li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {suggestedJobs.length > 0 && (
              <Row className="mb-4">
                <Col md={12} className="mb-4">
                  <Card className="shadow border-0 h-100">
                    <Card.Header className="bg-primary text-white py-3">
                      <h4 className="mb-0 fw-bold">Jobs Suited for Your CV</h4>
                    </Card.Header>
                    <Card.Body className="p-4" style={{ minHeight: "150px" }}>
                      <Row>
                        {suggestedJobs.map((job, index) => (
                          <Col md={4} key={index} className="mb-3">
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>{job.description}</Tooltip>}
                            >
                              <div
                                className="p-3 text-center rounded"
                                style={{ backgroundColor: "#e7f3ff", cursor: "pointer" }}
                              >
                                <strong>{job.title}</strong>
                              </div>
                            </OverlayTrigger>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            <Row className="mb-5">
              <Col className="text-center">
                {cvSkillGapData.skills.length > 0 ? (
                  <div className="mb-4">
                    <h4 className="fw-bold">CV Skill Gap Analysis</h4>
                    <Chart
                      ref={cvChartRef}
                      chartType="BarChart"
                      width="100%"
                      height="400px"
                      data={cvChartData}
                      options={{
                        title: "CV Skill Gap Analysis",
                        chartArea: { width: "60%", height: "70%" },
                        hAxis: {
                          title: "Skill",
                          titleTextStyle: { color: "#333" },
                          textStyle: { fontSize: 12 },
                        },
                        vAxis: {
                          title: "Percentage (%)",
                          minValue: 0,
                          maxValue: 100,
                          titleTextStyle: { color: "#333" },
                        },
                        legend: { position: "top", maxLines: 2 },
                        colors: ["#4285f4", "#db4437"],
                        bar: { groupWidth: "75%" },
                        isStacked: false,
                      }}
                      chartEvents={[
                        {
                          eventName: "ready",
                          callback: () => {
                            console.log("CV Chart is ready!");
                            setCvChartReady(true);
                          },
                        },
                      ]}
                    />
                  </div>
                ) : (
                  <p className="text-muted">No CV skill gap data available for chart visualization.</p>
                )}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={downloadPDF}
                  className="rounded-pill px-5 py-2"
                  disabled={!matchScore || (cvSkillGapData.skills.length > 0 && !cvChartReady)}
                >
                  <i className="fas fa-download me-2"></i>Download Report
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default CvAnalysis;
import React, { useState, useEffect, useRef } from "react";
import { Container, Button, Form, Spinner, Card, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import { Chart } from "react-google-charts";

const Dashboard = () => {
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    skills: [],
    educationLevel: "",
    degree: "",
    experience: "",
    jobRole: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [careerRecommendation, setCareerRecommendation] = useState("");
  const [skillGap, setSkillGap] = useState("");
  const [skillRelevance, setSkillRelevance] = useState("");
  const [roadmap, setRoadmap] = useState("");
  const [learningResources, setLearningResources] = useState("");
  const [skillGapData, setSkillGapData] = useState({ current: [], required: [], skills: [] });
  const [newSkill, setNewSkill] = useState({ name: "", proficiency: "" });
  const [chartReady, setChartReady] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false); // New state for PDF loading

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token || !userData) {
      alert("Please log in first!");
      navigate("/");
    }

    setUser(userData);
    setFormData((prev) => ({
      ...prev,
      firstName: userData.firstName,
      lastName: userData.lastName,
    }));
  }, [navigate]);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.put(
        "http://localhost:5000/auth/edit-profile",
        { firstName: formData.firstName, lastName: formData.lastName },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setUser(response.data.user);
      setIsEditing(false);
    } catch (error) {
      setError("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillChange = (e) => {
    setNewSkill({ ...newSkill, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    if (newSkill.name && newSkill.proficiency) {
      setFormData({
        ...formData,
        skills: [...formData.skills, { name: newSkill.name, proficiency: parseInt(newSkill.proficiency) }],
      });
      setNewSkill({ name: "", proficiency: "" });
    }
  };

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCareerRecommendation("");
    setSkillGap("");
    setSkillRelevance("");
    setRoadmap("");
    setLearningResources("");
    setSkillGapData({ current: [], required: [], skills: [] });
    setChartReady(false);

    try {
      const skillsString = formData.skills.map((s) => `${s.name} (${s.proficiency}%)`).join(", ");
      const payload = {
        ...formData,
        skills: skillsString,
      };
      const response = await axios.post(
        "http://localhost:5000/career/career-recommendation",
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const text = response.data.recommendations;
      console.log("Raw API Response:", text);

      const sections = text.split("###").map((section) => section.trim()).filter(Boolean);
      sections.forEach((section) => {
        if (section.startsWith("Career Recommendation")) {
          setCareerRecommendation(section.replace("Career Recommendation", "").trim());
        } else if (section.startsWith("Skill Gap")) {
          const skillGapText = section.replace("Skill Gap", "").trim();
          setSkillGap(skillGapText);
          parseSkillGap(skillGapText);
        } else if (section.startsWith("Roadmap")) {
          setRoadmap(section.replace("Roadmap", "").trim());
        } else if (section.startsWith("Learning Resources")) {
          setLearningResources(section.replace("Learning Resources", "").trim());
        }
      });
    } catch (error) {
      setError(error.response?.data?.message || "Error fetching career recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const parseSkillGap = (text) => {
    console.log("Raw Skill Gap Section:", text);
    const lines = text.split("\n").filter((line) => line.trim() !== "");

    if (lines.length < 2) {
      setError("Invalid skill gap data received from the server.");
      return;
    }

    const relevanceStatement = lines[0].trim();
    setSkillRelevance(relevanceStatement);

    const skillLines = lines.slice(1).filter((line) => line.includes("%"));
    const skills = [];
    const current = [];
    const required = [];

    skillLines.forEach((line) => {
      const match = line.match(/([^-\n]+)\s*-\s*Current:\s*(\d+)%\s*Required:\s*(\d+)%/i);
      if (match) {
        skills.push(match[1].trim());
        current.push(parseInt(match[2]));
        required.push(parseInt(match[3]));
      }
    });

    if (skills.length === 0) {
      setError("No valid skill gap data found in the response.");
      return;
    }

    setSkillGapData({ skills, current, required });
    console.log("Parsed Skill Gap Data:", { skills, current, required });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleReset = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      skills: [],
      educationLevel: "",
      degree: "",
      experience: "",
      jobRole: "",
    });
    setCareerRecommendation("");
    setSkillGap("");
    setSkillRelevance("");
    setRoadmap("");
    setLearningResources("");
    setSkillGapData({ current: [], required: [], skills: [] });
    setError("");
    setNewSkill({ name: "", proficiency: "" });
    setChartReady(false);
  };

  const downloadPDF = () => {
    if (!chartReady) {
      console.error("Chart is not ready yet. Please wait for the chart to render.");
      alert("Please wait for the chart to render before downloading the PDF.");
      return;
    }

    setPdfLoading(true);

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
      if (!chartRef.current) {
        console.error("Chart reference is not available.");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(255, 0, 0);
        doc.text("Error: Chart reference is not available.", margin, yOffset);
        yOffset += 10;
        // Fallback: Add skill gap data as text
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0, 102, 204);
        doc.text("Skill Gap Data (Chart Unavailable)", margin, yOffset);
        yOffset += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const skillGapText = skillGapData.skills
          .map((skill, index) => `${skill}: Current: ${skillGapData.current[index]}%, Required: ${skillGapData.required[index]}%`)
          .join("\n");
        const splitText = doc.splitTextToSize(skillGapText, maxWidth);
        splitText.forEach((line) => {
          if (yOffset + 10 > pageHeight - margin) {
            doc.addPage();
            yOffset = margin;
          }
          doc.text(line, margin, yOffset);
          yOffset += 7;
        });
        yOffset += 10;
        return;
      }

      try {
        // Access the chart wrapper and get the underlying Google Chart
        const chartWrapper = chartRef.current.getChartWrapper();
        if (!chartWrapper) {
          throw new Error("Chart wrapper is not available.");
        }

        const chart = chartWrapper.getChart();
        if (!chart) {
          throw new Error("Chart instance is not available.");
        }

        // Get the image URI of the chart
        const chartImage = chart.getImageURI();
        if (!chartImage) {
          throw new Error("Chart image URI is not available.");
        }

        // Ensure there's enough space for the chart
        if (yOffset + 100 > pageHeight - margin) {
          doc.addPage();
          yOffset = margin;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0, 102, 204);
        doc.text("Skill Gap Chart", margin, yOffset);
        yOffset += 10;

        const chartWidth = maxWidth;
        const chartHeight = (chartWidth * 2) / 3; // Maintain aspect ratio
        doc.addImage(chartImage, "PNG", margin, yOffset, chartWidth, chartHeight);
        yOffset += chartHeight + 15;
      } catch (error) {
        console.error("Error adding chart to PDF:", error.message);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(255, 0, 0);
        doc.text(`Error: Could not include Skill Gap Chart in the PDF. (${error.message})`, margin, yOffset);
        yOffset += 10;
        // Fallback: Add skill gap data as text
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0, 102, 204);
        doc.text("Skill Gap Data (Chart Unavailable)", margin, yOffset);
        yOffset += 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const skillGapText = skillGapData.skills
          .map((skill, index) => `${skill}: Current: ${skillGapData.current[index]}%, Required: ${skillGapData.required[index]}%`)
          .join("\n");
        const splitText = doc.splitTextToSize(skillGapText, maxWidth);
        splitText.forEach((line) => {
          if (yOffset + 10 > pageHeight - margin) {
            doc.addPage();
            yOffset = margin;
          }
          doc.text(line, margin, yOffset);
          yOffset += 7;
        });
        yOffset += 10;
      }
    };

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 102, 204);
    doc.text("PathToGrow Career Report", margin, yOffset);
    yOffset += 10;

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated for ${user.firstName} ${user.lastName} on ${new Date().toLocaleDateString()}`, margin, yOffset);
    yOffset += 15;

    // Add sections to the PDF
    if (careerRecommendation) {
      addSection("Career Recommendation", careerRecommendation);
    }

    if (skillGapData.skills.length > 0) {
      const skillGapText = skillGapData.skills
        .map((skill, index) => `${skill} - Current: ${skillGapData.current[index]}% Required: ${skillGapData.required[index]}%`)
        .join("\n");
      addSection("Skill Gap", skillRelevance + "\n\n" + skillGapText);
      addChart();
    }

    if (roadmap) {
      addSection("Roadmap", roadmap);
    }

    if (learningResources) {
      addSection("Learning Resources", learningResources);
    }

    doc.save("career_recommendations.pdf");
    setPdfLoading(false);
  };

  const chartData = [
    ["Skill", "Current (%)", "Required (%)"],
    ...(skillGapData.skills.map((skill, index) => [
      skill,
      skillGapData.current[index],
      skillGapData.required[index],
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
                  Welcome, {user?.firstName} {user?.lastName}!
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
                  onClick={() => setIsEditing(true)}
                >
                  <i className="fas fa-edit me-2"></i>Edit
                </Button>
                <Button
                  variant="outline-success"
                  className="rounded-pill me-2"
                  onClick={() => navigate("/cv-analysis")}
                >
                  <i className="fas fa-file-alt me-2"></i>CV Analysis
                </Button>
                <Button
                  variant="outline-danger"
                  className="rounded-pill"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>Logout
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {isEditing && (
          <Card className="shadow mb-5 border-0">
            <Card.Body className="p-4">
              <Form onSubmit={handleProfileSubmit}>
                <h4 className="fw-bold mb-4 border-bottom pb-3">Edit Your Profile</h4>
                {error && <Alert variant="danger">{error}</Alert>}
                <Row>
                  <Col md={6}>
                    <Form.Group controlId="firstName" className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleProfileChange}
                        className="py-2"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="lastName" className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleProfileChange}
                        className="py-2"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end mt-3">
                  <Button variant="secondary" className="me-2" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : "Save Changes"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        )}

        {!isEditing && (
          <>
            <div className="text-center mb-5">
              <h2 className="fw-bold">Your Skill Gap Analysis & Career Recommendations</h2>
              <p className="text-muted">Fill in the details below to receive personalized career guidance</p>
            </div>

            <Card className="shadow border-0 mb-5">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  {error && <Alert variant="danger">{error}</Alert>}
                  <Row>
                    <Col md={6}>
                      <Form.Group controlId="skills" className="mb-3">
                        <Form.Label className="fw-bold">Your Skills</Form.Label>
                        <Row>
                          <Col md={6}>
                            <Form.Control
                              type="text"
                              name="name"
                              value={newSkill.name}
                              onChange={handleSkillChange}
                              placeholder="Skill (e.g., JavaScript)"
                              className="py-2 mb-2"
                            />
                          </Col>
                          <Col md={4}>
                            <Form.Control
                              type="number"
                              name="proficiency"
                              value={newSkill.proficiency}
                              onChange={handleSkillChange}
                              placeholder="% (0-100)"
                              min="0"
                              max="100"
                              className="py-2 mb-2"
                            />
                          </Col>
                          <Col md={2}>
                            <Button variant="outline-primary" onClick={addSkill} className="py-2">
                              Add
                            </Button>
                          </Col>
                        </Row>
                        {formData.skills.map((skill, index) => (
                          <Row key={index} className="mb-2">
                            <Col md={8}>
                              <span>
                                {skill.name} ({skill.proficiency}%)
                              </span>
                            </Col>
                            <Col md={4}>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => removeSkill(index)}
                              >
                                Remove
                              </Button>
                            </Col>
                          </Row>
                        ))}
                      </Form.Group>

                      <Form.Group controlId="educationLevel" className="mb-3">
                        <Form.Label className="fw-bold">Education Level</Form.Label>
                        <Form.Select
                          name="educationLevel"
                          value={formData.educationLevel}
                          onChange={handleChange}
                          className="py-2"
                          required
                        >
                          <option value="">Select your education level</option>
                          <option value="High School">High School</option>
                          <option value="Associate's Degree">Associate's Degree</option>
                          <option value="Bachelor's Degree">Bachelor's Degree</option>
                          <option value="Master's Degree">Master's Degree</option>
                          <option value="PhD">PhD</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group controlId="degree" className="mb-3">
                        <Form.Label className="fw-bold">Degree/Field of Study</Form.Label>
                        <Form.Control
                          type="text"
                          name="degree"
                          value={formData.degree}
                          onChange={handleChange}
                          placeholder="Computer Science, Business, etc."
                          className="py-2"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="experience" className="mb-3">
                        <Form.Label className="fw-bold">Years of Experience</Form.Label>
                        <Form.Select
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          className="py-2"
                        >
                          <option value="">Select years of experience</option>
                          <option value="0-1">0-1 years</option>
                          <option value="1-3">1-3 years</option>
                          <option value="3-5">3-5 years</option>
                          <option value="5-10">5-10 years</option>
                          <option value="10+">10+ years</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group controlId="jobRole" className="mb-3">
                        <Form.Label className="fw-bold">Desired Job Role</Form.Label>
                        <Form.Control
                          type="text"
                          name="jobRole"
                          value={formData.jobRole}
                          onChange={handleChange}
                          placeholder="Data Scientist, UX Designer, etc."
                          className="py-2"
                          required
                        />
                      </Form.Group>

                      <div className="d-flex justify-content-between mt-4">
                        <Button variant="outline-secondary" onClick={handleReset} disabled={loading}>
                          <i className="fas fa-undo me-2"></i>Reset
                        </Button>
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={loading || formData.skills.length === 0}
                        >
                          {loading ? (
                            <Spinner animation="border" size="sm" className="me-2" />
                          ) : (
                            <i className="fas fa-search me-2"></i>
                          )}
                          Analyze My Skills
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            {(careerRecommendation || skillGap || roadmap || learningResources) && !loading && (
              <>
                <Row className="mb-4">
                  <Col md={6} className="mb-4">
                    <Card className="shadow border-0 h-100">
                      <Card.Header className="bg-success text-white py-3">
                        <h4 className="mb-0 fw-bold">Career Recommendation</h4>
                      </Card.Header>
                      <Card.Body className="p-4" style={{ overflowY: "auto", minHeight: "250px" }}>
                        {careerRecommendation.split("\n").map((line, index) => (
                          <p key={index} className="mb-2" style={{ fontSize: "1.1rem" }}>
                            {line}
                          </p>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6} className="mb-4">
                    <Card className="shadow border-0 h-100">
                      <Card.Header className="bg-warning text-white py-3">
                        <h4 className="mb-0 fw-bold">Skill Gap</h4>
                      </Card.Header>
                      <Card.Body className="p-4" style={{ minHeight: "250px" }}>
                        {skillRelevance && (
                          <p className="mb-3" style={{ fontSize: "1.1rem", fontStyle: "italic" }}>
                            {skillRelevance}
                          </p>
                        )}
                        <ul className="list-unstyled">
                          {skillGapData.skills.map((skill, index) => (
                            <li key={index} className="mb-2" style={{ fontSize: "1.1rem" }}>
                              <strong>{skill}</strong> - Current: {skillGapData.current[index]}%, Required: {skillGapData.required[index]}%
                              {skillGapData.current[index] < skillGapData.required[index] && (
                                <span className="text-danger ms-2">
                                  (Gap: {skillGapData.required[index] - skillGapData.current[index]}%)
                                </span>
                              )}
                            </li>
                          ))}
                          {skillGapData.skills.length === 0 && (
                            <p className="text-muted">No skill gap data available.</p>
                          )}
                        </ul>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={6} className="mb-4">
                    <Card className="shadow border-0 h-100">
                      <Card.Header className="bg-info text-white py-3">
                        <h4 className="mb-0 fw-bold">Roadmap</h4>
                      </Card.Header>
                      <Card.Body className="p-4" style={{ overflowY: "auto", minHeight: "250px" }}>
                        {roadmap.split("\n").map((line, index) => (
                          <p key={index} className="mb-2" style={{ fontSize: "1.1rem" }}>
                            {line}
                          </p>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6} className="mb-4">
                    <Card className="shadow border-0 h-100">
                      <Card.Header className="bg-primary text-white py-3">
                        <h4 className="mb-0 fw-bold">Learning Resources</h4>
                      </Card.Header>
                      <Card.Body className="p-4" style={{ overflowY: "auto", minHeight: "250px" }}>
                        {learningResources.split("\n").map((line, index) => (
                          <p key={index} className="mb-2" style={{ fontSize: "1.1rem" }}>
                            {line}
                          </p>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="mb-5">
                  <Col className="text-center">
                    {skillGapData.skills.length > 0 ? (
                      <div className="mb-4">
                        <h4 className="fw-bold">Skill Gap Analysis</h4>
                        <Chart
                          ref={chartRef}
                          chartType="BarChart"
                          width="100%"
                          height="400px"
                          data={chartData}
                          options={{
                            title: "Skill Gap Analysis",
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
                                console.log("Chart is ready!");
                                console.log("Chart ref after ready:", chartRef.current);
                                setChartReady(true);
                              },
                            },
                            {
                              eventName: "error",
                              callback: ({ id, message }) => {
                                console.error(`Chart error [${id}]: ${message}`);
                                setError(`Chart rendering failed: ${message}`);
                                setChartReady(false);
                              },
                            },
                          ]}
                        />
                      </div>
                    ) : (
                      <p className="text-muted">No skill gap data available for chart visualization.</p>
                    )}
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={downloadPDF}
                      className="rounded-pill px-5 py-2"
                      disabled={!careerRecommendation || !chartReady || pdfLoading}
                    >
                      {pdfLoading ? (
                        <Spinner animation="border" size="sm" className="me-2" />
                      ) : (
                        <i className="fas fa-download me-2"></i>
                      )}
                      Download Report
                    </Button>
                  </Col>
                </Row>
              </>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default Dashboard;
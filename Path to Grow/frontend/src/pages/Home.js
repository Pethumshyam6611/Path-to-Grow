import React, { useState } from "react";
import { Container, Button, Navbar, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../assets/Style.css"; // Ensure this path matches your project structure
import AuthModal from "../components/AuthModal";

// Import images from src/assets/
import Logo from "../assets/LOGO.png";
import Robo1 from "../assets/ROBO1.png"; // Corrected extension
import Robo2 from "../assets/ROBO2.png";
import AboutUs from "../assets/About us.png";

const Home = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    // After successful login logic (e.g., API call), navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <>
      {/* Navigation Bar */}
      <Navbar expand="lg" bg="white" className="py-3">
        <Container>
          <Navbar.Brand href="#">
            <img src={Logo} alt="PathToGrow Logo" />
            <span style={{ fontFamily: "'Fira Mono'" }}>PathToGrow</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbarNav" />
          <Navbar.Collapse id="navbarNav">
            <Nav className="me-auto justify-content-center">
              <Nav.Link href="#">Home</Nav.Link>
              <Nav.Link href="#">About</Nav.Link>
              <Nav.Link href="#">Features</Nav.Link>
              <Nav.Link href="#">Contact</Nav.Link>
            </Nav>
            <Button
              variant="dark"
              className="rounded-pill px-4"
              onClick={() => setShowAuthModal(true)}
            >
              Sign Up
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <div class="container">
      <Container className="hero-section text-center mt-5">
      <div class="hero-content">
        <h1 className="fw-bold">Path To Grow</h1>
        <h2 className="text-muted">Bridge Your Skill Gap with AI</h2>
        <p>Personalized career guidance and learning roadmaps tailored just for you</p>
        <Button
              variant="dark"
              className="rounded-pill px-4"
              onClick={() => setShowAuthModal(true)}
            >
             Get Start
      </Button>
      </div>
      <img src={Robo1} alt="Robot Head Left" className="robot-head robot-head-left" />
      <img src={Robo2} alt="Robot Head Right" className="robot-head robot-head-right" />
      </Container>
      </div>
      {/* Features Section */}
      <section className="feature-section py-5">
        <Container>
          <div className="section-title d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0" style={{ fontWeight: "bold" }}>
              Key Features
            </h3>
            <a href="#" className="explore-link">
              Explore All
            </a>
          </div>
          <div className="row">
            <div className="col-md-4 mb-4 mb-md-0">
              <div className="feature-card">
                <h4 className="feature-title">AI-Powered Skill Analysis</h4>
                <p className="feature-description">
                  Identify your strengths and gaps with AI-driven skill assessments
                </p>
                <a href="#" className="feature-link">
                  Learn More
                  <span className="feature-link-icon">
                    <i className="fas fa-arrow-right"></i>
                  </span>
                </a>
              </div>
            </div>
            <div className="col-md-4 mb-4 mb-md-0">
              <div className="feature-card">
                <h4 className="feature-title">Personalized Learning Paths</h4>
                <p className="feature-description">
                  Get a step-by-step learning plan tailored to your career goals
                </p>
                <a href="#" className="feature-link">
                  Learn More
                  <span className="feature-link-icon">
                    <i className="fas fa-arrow-right"></i>
                  </span>
                </a>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <h4 className="feature-title">Learning Resource Integration</h4>
                <p className="feature-description">
                  Access top courses and resources from leading platforms in one place
                </p>
                <a href="#" className="feature-link">
                  Learn More
                  <span className="feature-link-icon">
                    <i className="fas fa-arrow-right"></i>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How This Works Section */}
      <div class="container">
      <section className="how-it-works py-5">
        <Container>
          <h3 className="how-it-works-title text-center mb-4">How This Works</h3>
          <div className="row">
            <div className="col-md-6 step-box mb-3ckeditor">
              <p className="step-number" style={{ fontSize: "2rem" }}>
                Step 1
              </p>
              <p className="step-text" style={{ fontSize: "1.5rem" }}>
                Create Your Profile
              </p>
            </div>
            <div className="col-md-6 step-box mb-3">
              <p className="step-number" style={{ fontSize: "2rem" }}>
                Step 2
              </p>
              <p className="step-text" style={{ fontSize: "1.5rem" }}>
                Analyze Your Skills
              </p>
            </div>
            <div className="col-md-6 step-box mb-3">
              <p className="step-number" style={{ fontSize: "2rem" }}>
                Step 3
              </p>
              <p className="step-text" style={{ fontSize: "1.5rem" }}>
                Get Career Recommendations
              </p>
            </div>
            <div className="col-md-6 step-box mb-3">
              <p className="step-number" style={{ fontSize: "2rem" }}>
                Step 4
              </p>
              <p className="step-text" style={{ fontSize: "1.5rem" }}>
                Follow Your Personalized Roadmap
              </p>
            </div>
          </div>
        </Container>
      </section>
</div>
      {/* About Us Section */}
      <section className="about-section py-5">
        <Container>
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h3 className="about-title">About Us</h3>
              <p className="about-text">
                We bridge the gap between skills and career success through AI-driven insights. Our platform analyzes your abilities, recommends tailored learning paths, and connects you with top courses to help you achieve your dream job effortlessly. Join us and take control of your professional journey today!
              </p>
            </div>
            <div className="col-lg-6 text-center">
              <img
                src={AboutUs}
                alt="Career Growth Illustration"
                className="about-image img-fluid"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-3">
        <Container>
          <div className="row align-items-center">
            <div className="col-md-6 mb-2 mb-md-0 text-md-start">
              <span
                className="mr-2 h4 font-weight-bolder"
                style={{ fontSize: "40px", fontWeight: "bold" }}
              >
                PathToGrow™
              </span>
              <div className="mt-2">
                <a href="#" className="mx-2">
                  <i className="fab fa-twitter fa-lg text-white"></i>
                </a>
                <a href="#" className="mx-2">
                  <i className="fab fa-instagram fa-lg text-white"></i>
                </a>
                <a href="#" className="mx-2">
                  <i className="fab fa-linkedin-in fa-lg text-white"></i>
                </a>
                <a href="#" className="mx-2">
                  <i className="fab fa-google fa-lg text-white"></i>
                </a>
                <a href="#" className="mx-2">
                  <i className="fab fa-facebook-f fa-lg text-white"></i>
                </a>
              </div>
              <div className="mt-1">
                <small>© 2025 PathToGrow. All rights reserved.</small>
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <a href="#" className="text-white mx-2">
                Privacy Policy
              </a>
              <span className="text-muted">|</span>
              <a href="#" className="text-white mx-2">
                Terms of Service
              </a>
              <span className="text-muted">|</span>
              <a href="#" className="text-white mx-2">
                Contact
              </a>
            </div>
          </div>
        </Container>
      </footer>

      {/* Auth Modal */}
      <AuthModal show={showAuthModal} handleClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Home;
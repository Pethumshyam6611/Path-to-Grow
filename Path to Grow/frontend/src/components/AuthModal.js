import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../assets/AuthModal.css"; // Import the CSS file

const AuthModal = ({ show, handleClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? "http://localhost:5000/auth/login" : "http://localhost:5000/auth/register";
    
    try {
      const response = await axios.post(url, formData);
      console.log(response); // Log the entire response
      alert(response.data.message); // Display message
      
      if (isLogin) {
        // Store token and user details in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user)); // Store user details
        navigate("/dashboard"); // Redirect to dashboard after successful login
      }
      
      setFormData({ firstName: "", lastName: "", email: "", password: "" });
      handleClose();
    } catch (error) {
      console.error(error); // Log the error to see what's going wrong
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{isLogin ? "Login" : "Register"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <Form.Group controlId="firstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="lastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </>
          )}
          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            {isLogin ? "Login" : "Register"}
          </Button>
        </Form>
        <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Need an account? Register" : "Already have an account? Login"}
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;
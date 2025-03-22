import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";  // Import useNavigate

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();  // Use navigate to redirect after login

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post("http://localhost:5000/auth/login", formData);
      
      // Check if the data contains token and user info
      if (data.token && data.user) {
        // Store the JWT token in localStorage
        localStorage.setItem("token", data.token);

        // After successful login, navigate to Dashboard
        navigate("/dashboard");  // Redirect to dashboard
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      // Handle error properly and show a meaningful message
      const errorMessage = error.response?.data?.message || "Something went wrong during login";
      alert(errorMessage);  // Show error message
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Login</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-success w-100">
          Login
        </button>
      </form>
      <p className="mt-3 text-center">
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/auth/register", formData);
      if (response.data) {
        alert("Registration Successful! Please login.");
      } else {
        alert("Unexpected error. Please try again.");
      }
    } catch (error) {
      console.error("❌ Registration Error:", error.response ? error.response.data : error.message);
      alert(error.response?.data?.message || "Server error. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Register</h2>
      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <label className="form-label">First Name</label>
          <input type="text" className="form-control" name="firstName" onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Last Name</label>
          <input type="text" className="form-control" name="lastName" onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" name="email" onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input type="password" className="form-control" name="password" onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary w-100">Register</button>
      </form>
      <p className="mt-3 text-center">
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default Register;

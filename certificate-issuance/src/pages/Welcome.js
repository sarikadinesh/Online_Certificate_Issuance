import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Welcome = () => {
  return (
    <div className="d-flex vh-100">
      {/* Left Section (Background Image - 65% width) */}
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{
          flex: "65%",
          backgroundImage: "url('https://4slonline.com/app_img/blog/category/Unlocking%20the%20Benefits%20of%20Online%20Police%20Verification%20Certificate.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "5%",
        }}
      >
        {/* Welcome Box (Solid White Background) */}
        <div
          className="p-5 border rounded shadow-lg text-center"
          style={{
            borderColor: "#007bff",
            backgroundColor: "white", // Solid white (no transparency)
            maxWidth: "600px",
            width: "100%",
          }}
        >
          <h1 className="mb-3 fw-bold text-primary">Welcome to Certificate Verification</h1>
          <p className="text-muted">
            A secure and efficient way to verify your certificates online.
          </p>

          {/* Buttons */}
          <div className="mt-4">
            <Link to="/register" className="btn btn-success btn-lg mx-2">
              Register
            </Link>
            <Link to="/login" className="btn btn-primary btn-lg mx-2">
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right Section (Green - 35% width) */}
      <div className="d-flex justify-content-center align-items-center text-white" style={{ flex: "35%", backgroundColor: "#28a745" }}>
        <div className="text-center" style={{ maxWidth: "400px" }}>
          <h2 className="fw-bold">"Ensuring Trust, One Certificate at a Time"</h2>
          <p className="mt-3">
            Our platform provides a seamless and secure verification process, maintaining transparency and credibility.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;

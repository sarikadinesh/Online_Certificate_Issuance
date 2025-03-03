import { useState, useEffect } from "react";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa"; // ✅ Import Icons
import API from "../api/api";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [certificateType, setCertificateType] = useState("");
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState({
    name: localStorage.getItem("userName") || "User",
    email: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await API.get("/certificates/user", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (Array.isArray(data.requests)) {
          setRequests(
            data.requests.map((req) => ({
              ...req,
              documentPath: req.documentPath
                ? `${process.env.REACT_APP_API_BASE_URL || ""}${req.documentPath}`
                : null,
            }))
          );

          if (data.requests.length > 0) {
            setUser({
              name: data.requests[0].applicantName || localStorage.getItem("userName") || "User",
              email: data.requests[0].applicantEmail || "N/A",
            });
          }
        } else {
          setRequests([]);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
        setError("Failed to load requests. Please try again.");
      }
      setLoading(false);
    };
    fetchRequests();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !certificateType) {
      setMessage("❌ Please select a file and certificate type.");
      return;
    }

    const formData = new FormData();
    formData.append("document", file);
    formData.append("certificateType", certificateType);

    try {
      const { data } = await API.post("/certificates", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setMessage(`✅ ${data.message}`);
      setRequests((prevRequests) => [
        ...prevRequests,
        { ...data.request, documentPath: `${process.env.REACT_APP_API_BASE_URL || ""}${data.request.documentPath}` },
      ]);
    } catch (error) {
      console.error("Upload failed:", error);
      setMessage("❌ Upload failed. Try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      {/* ✅ Header with User Info & Logout */}
      <div className="dashboard-header">
        <div className="user-info">
          <FaUserCircle className="user-icon" />
          <div>
            <span className="user-name">{user.name}</span>
            <span className="user-email">{user.email}</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* ✅ Upload Section */}
      <div className="upload-section">
        <h2>Request a Certificate</h2>
        <select value={certificateType} onChange={(e) => setCertificateType(e.target.value)} className="input-field">
          <option value="">-- Select Certificate Type --</option>
          <option value="Caste Certificate">Caste Certificate</option>
          <option value="Income Certificate">Income Certificate</option>
          <option value="Domicile Certificate">Birth Certificate</option>
        </select>
        <input type="file" onChange={handleFileChange} className="file-input" />
        <button onClick={handleUpload} className="submit-btn">Submit Request</button>
      </div>

      {message && <p className="message">{message}</p>}

      {/* ✅ Previous Requests Table */}
      <h2>Previous Requests</h2>
      {loading ? (
        <p>Loading requests...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              <th>Certificate Type</th>
              <th>Document</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Issued Date</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id}>
                <td>{request.certificateType}</td>
                <td>
                  {request.documentPath ? (
                    <a href={request.documentPath} target="_blank" rel="noopener noreferrer" className="file-link">
                      View Document
                    </a>
                  ) : (
                    "No File"
                  )}
                </td>
                <td className={`status-${request.status}`}>
                  {request.status}
                </td>
                <td>{request.remarks || "N/A"}</td>
                <td>{request.issuedDate ? new Date(request.issuedDate).toLocaleDateString() : "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Dashboard;

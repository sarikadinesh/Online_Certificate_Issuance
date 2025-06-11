import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import API from "../api/api";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [remarks, setRemarks] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        API.get("/certificates/all")
            .then((response) => {
                console.log("Certificate Requests Response:", response.data);
                setRequests(response.data.requests || response.data);
            })
            .catch((error) => console.error("Error fetching requests:", error));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        navigate("/login");
    };

    const handleRemarksChange = (id, value) => {
        setRemarks((prev) => ({ ...prev, [id]: value }));
    };

    // ✅ Corrected Approve Endpoint
    const handleApprove = (id) => {
        const remark = remarks[id] || "Approved";
        API.put(`/certificates/${id}/approve`, { remarks: remark }) // <-- updated path
            .then(() => {
                setRequests((prev) =>
                    prev.map((req) =>
                        req._id === id ? { ...req, status: "approved", remarks: remark } : req
                    )
                );
            })
            .catch((error) => console.error("Error approving request:", error));
    };

    const handleReject = (id) => {
        const remark = remarks[id] || "Rejected";
        API.put(`/certificates/${id}`, { status: "rejected", remarks: remark })
            .then(() => {
                setRequests((prev) =>
                    prev.map((req) =>
                        req._id === id ? { ...req, status: "rejected", remarks: remark } : req
                    )
                );
            })
            .catch((error) => console.error("Error rejecting request:", error));
    };

    const pendingRequests = requests.filter((req) => req.status === "pending");
    const approvedRequests = requests.filter((req) => req.status === "approved");
    const rejectedRequests = requests.filter((req) => req.status === "rejected");

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2 className="dashboard-title">Admin Dashboard</h2>
                <div className="user-profile">
                    <FaUserCircle className="user-icon" />
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Pending Requests */}
            <h3 className="section-title">Pending Certificate Requests</h3>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Applicant Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Remarks</th>
                        <th>Actions</th>
                        <th>Uploaded Certificate</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingRequests.map((request) => (
                        <tr key={request._id}>
                            <td>{request.applicantName || "N/A"}</td>
                            <td>{request.applicantEmail || "N/A"}</td>
                            <td>
                                <span className="status-pending">{request.status}</span>
                            </td>
                            <td>
                                <input
                                    type="text"
                                    placeholder="Enter remarks"
                                    value={remarks[request._id] || ""}
                                    onChange={(e) => handleRemarksChange(request._id, e.target.value)}
                                />
                            </td>
                            <td>
                                <button className="btn approve" onClick={() => handleApprove(request._id)}>Approve</button>
                                <button className="btn reject" onClick={() => handleReject(request._id)}>Reject</button>
                            </td>
                            <td>
                                {request.documentPath ? (
                                    <a href={`${process.env.REACT_APP_API_BASE_URL || ''}${request.documentPath}`}
                                        download className="file-link"
                                        target="_blank" rel="noopener noreferrer">
                                        Download Certificate
                                    </a>
                                ) : "No Certificate Uploaded"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Approved Requests */}
            <h3 className="section-title">Approved Certificate Requests</h3>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Applicant Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Remarks</th>
                        <th>Uploaded Certificate</th>
                    </tr>
                </thead>
                <tbody>
                    {approvedRequests.map((request) => (
                        <tr key={request._id}>
                            <td>{request.applicantName || "N/A"}</td>
                            <td>{request.applicantEmail || "N/A"}</td>
                            <td>
                                <span className="status-approved">{request.status}</span>
                            </td>
                            <td>{request.remarks || "N/A"}</td>
                            <td>
                                {request.documentPath ? (
                                    <a href={`${process.env.REACT_APP_API_BASE_URL || ''}${request.documentPath}`}
                                        download className="file-link"
                                        target="_blank" rel="noopener noreferrer">
                                        Download Certificate
                                    </a>
                                ) : "No Certificate Uploaded"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Rejected Requests */}
            <h3 className="section-title">Rejected Certificate Requests</h3>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Applicant Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Remarks</th>
                        <th>Uploaded Certificate</th>
                    </tr>
                </thead>
                <tbody>
                    {rejectedRequests.map((request) => (
                        <tr key={request._id}>
                            <td>{request.applicantName || "N/A"}</td>
                            <td>{request.applicantEmail || "N/A"}</td>
                            <td>
                                <span className="status-rejected">{request.status}</span>
                            </td>
                            <td>{request.remarks || "N/A"}</td>
                            <td>
                                {request.documentPath ? (
                                    <a href={`${process.env.REACT_APP_API_BASE_URL || ''}${request.documentPath}`}
                                        download className="file-link"
                                        target="_blank" rel="noopener noreferrer">
                                        Download Certificate
                                    </a>
                                ) : "No Certificate Uploaded"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;

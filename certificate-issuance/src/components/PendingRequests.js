import { useEffect, useState } from 'react';
import API from '../api/api';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    API.get('/certificates/pending').then(({ data }) => setRequests(data));
  }, []);

  return (
    <div>
      <h2>Pending Requests</h2>
      {requests.map((req) => (
        <div key={req._id}>
          <p>{req.certificateType}</p>
          <a href={`http://localhost:5000/${req.documentPath}`} target="_blank" rel="noopener noreferrer">View Document</a>
          <button onClick={() => API.put(`/certificates/${req._id}`, { status: 'approved' })}>Approve</button>
          <button onClick={() => API.put(`/certificates/${req._id}`, { status: 'rejected' })}>Reject</button>
        </div>
      ))}
    </div>
  );
};

export default PendingRequests;

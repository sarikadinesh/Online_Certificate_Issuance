import { useState } from 'react';
import API from '../api/api';

const CertificateUploadForm = () => {
  const [certificateType, setCertificateType] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('certificateType', certificateType);
    formData.append('document', file);

    await API.post('/certificates', formData);
    alert('Request Submitted!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <select onChange={(e) => setCertificateType(e.target.value)}>
        <option value="">Select Certificate Type</option>
        <option value="Birth Certificate">Birth Certificate</option>
        <option value="Caste Certificate">Caste Certificate</option>
      </select>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit">Submit Request</button>
    </form>
  );
};

export default CertificateUploadForm;

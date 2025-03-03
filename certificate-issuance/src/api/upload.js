import { useState } from "react";
import API from "../api/api";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("Please select a file!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await API.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(`File uploaded successfully: ${data.filePath}`);
    } catch (err) {
      setMessage("Upload failed!");
    }
  };

  return (
    <div>
      <h2>Upload File</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleUpload}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default FileUpload;

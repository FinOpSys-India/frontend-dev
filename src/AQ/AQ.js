import React, { useState, useCallback } from "react";
import { Modal, ProgressBar } from "react-bootstrap";
import axios from "axios";
import { apiEndPointUrl } from "../utils/apiService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 
import { useDropzone } from 'react-dropzone';
import uploadLogo from '../assets/uploadLogo.svg'
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function AQ() {
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleUploadClick = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setFile(null);
    setProgress(0);
    setUploadStatus("");
  };

  // Handling file selection via drag-and-drop or file input
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      // Handle rejected files (e.g., if file is too large)
      const { errors } = rejectedFiles[0];
      if (errors && errors[0].code === 'file-too-large') {
        toast.error("File size exceeds 10MB");
      }
    } else if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]); // Get the first valid file
      handleFileUpload(acceptedFiles[0]); // Start upload immediately after file is selected
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE, // 10MB file size limit
    multiple: false,
    accept: 'application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg',
  });

  const handleFileUpload = async (fileToUpload) => {
    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      const response = await axios.post('http://localhost:9000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      if (response.status === 200) {
        setUploadStatus("success");
        setTimeout(() => {
          handleModalClose(); // Close modal after successful upload
        }, 2000); // Close the modal after a short delay
        toast.success("File uploaded successfully!", { autoClose: 1500 });
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error("File size exceeds 10MB", { autoClose: 1500 });
        setUploadStatus("error");
      } else {
        toast.error("File upload failed", { autoClose: 1500 });
        setUploadStatus("error");
      }
    }
  };
 
  return (
    <div>
      <button onClick={handleUploadClick}>Upload Doc</button>

      <Modal
        show={showModal}
        onHide={handleModalClose}
        size="lg"
        style={{ marginTop: '2%', width: '70%', marginLeft: '19%' }}
        scrollable
        dialogClassName="modal-90w"

        
      >
        <Modal.Header closeButton >
        <Modal.Title>Upload Invoice</Modal.Title>

        </Modal.Header>
        <Modal.Body>
        
          <div
            {...getRootProps()}
            style={{
              border: '1.5px dashed #7939EF',
              padding: '50px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: isDragActive ? '#f3f3f3' : 'white',
              width:"92%",
              marginLeft:"4%",
               borderRadius:'3%'
            }}
          ><div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <img src={uploadLogo} />
        </div>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the file here...</p>
            ) : (
              <p>Drag and drop your file here or <span style={{ color: 'blue', textDecoration: 'underline' }}>Browse file</span></p>
            )}
          </div>
          <div style={{marginTop:"2%",display:"flex", flexDirection:"row", justifyContent:"space-between",width: '90%', marginLeft:"5%"}}>            
            <p>Supported formats: PDF, DOC, XLSX & JPEG.</p>
            <p>Max file size: 10MB</p>
          </div>
          {file && (
            <div style={{ marginTop: '20px', border: '2px solid #7939EF', borderRadius:'3%' }}>
              <p>{file.name} ({(file.size / (1024 * 1024)).toFixed(2)}MB)</p>
              <ProgressBar
                now={progress}
                label={`${progress}%`}
                variant={uploadStatus === 'error' ? 'danger' : progress === 100 ? 'success' : 'info'}
              />
            </div>
          )}
        </Modal.Body>
      </Modal>
      <ToastContainer />

    </div>
  );
}

export default AQ;

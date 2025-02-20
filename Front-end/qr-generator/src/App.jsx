import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

export default function QRCodeGenerator() {
  const [mode, setMode] = useState("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQrCode(null);
    setUrl("");
    setFile(null);
  }, [mode]);

  useEffect(() => {
    if (qrCode) {
      return () => URL.revokeObjectURL(qrCode);
    }
  }, [qrCode]);

  const SERVER_URL = "https://qr-generator-xroo.onrender.com"; // ✅ Updated server URL

  // ✅ Upload file & get file URL
  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`${SERVER_URL}/upload`, formData);

      if (!response.data || !response.data.fileUrl) {
        throw new Error("File URL missing in response.");
      }

      return response.data.fileUrl;
    } catch (error) {
      console.error("❌ File upload failed:", error);
      return null; // Return null explicitly to handle failure
    }
  };

  // ✅ Generate QR Code for URLs & Files
  const handleGenerateQR = async () => {
    setLoading(true);
    try {
      let finalUrl = url.trim(); // Ensure clean URL

      if (mode === "file" && file) {
        finalUrl = await uploadFile(file);
        if (!finalUrl) {
          console.error("❌ File upload failed, stopping QR generation.");
          return;
        }
      }

      console.log("🔹 Sending URL for QR generation:", finalUrl);

      const response = await axios.post(
        `${SERVER_URL}/generate`,
        { url: finalUrl },
        { responseType: "blob" }
      );

      const qrUrl = URL.createObjectURL(response.data);
      console.log("✅ QR Code generated successfully:", qrUrl);
      setQrCode(qrUrl);
    } catch (error) {
      console.error("❌ Error generating QR Code:", error);
    }
    setLoading(false);
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("❌ Invalid file type. Please upload a PNG, JPG, or PDF.");
      return;
    }

    setFile(selectedFile);
  };

  // ✅ Press "Enter" to Generate QR
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleGenerateQR();
    }
  };

  return (
    <div className="qr-container">
      <h1 className="qr-title">QR Code Generator</h1>
      <div className="toggle-buttons">
        <button
          className={`toggle-button ${mode === "url" ? "active" : ""}`}
          onClick={() => setMode("url")}
        >
          Enter URL
        </button>
        <button
          className={`toggle-button ${mode === "file" ? "active" : ""}`}
          onClick={() => setMode("file")}
        >
          Upload File
        </button>
      </div>
      {mode === "url" ? (
        <input
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="qr-input"
          onKeyDown={handleKeyPress}
        />
      ) : (
        <input
          type="file"
          onChange={handleFileChange}
          className="file-input"
          accept=".jpg, .jpeg, .png, .pdf"
        />
      )}
      <button
        onClick={handleGenerateQR}
        className="qr-button"
        disabled={
          loading || (mode === "url" && !url) || (mode === "file" && !file)
        }
      >
        {loading ? "Generating..." : "Generate QR Code"}
      </button>
      {qrCode && (
        <div className="qr-box">
          <img src={qrCode} alt="Generated QR Code" className="qr-image" />
          <a href={qrCode} download="qr_code.png" className="qr-download">
            Download QR Code
          </a>
        </div>
      )}
    </div>
  );
}

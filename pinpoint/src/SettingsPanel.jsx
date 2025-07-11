import React, { useState, useEffect } from "react";

function SettingsPanel({ onClose, onChangeSettings, darkMode, toggleDarkMode }) {
  const savedBackgroundColor = localStorage.getItem("backgroundColor") || (darkMode ? "#000000" : "#F5F5DC");
  const savedTextColor = localStorage.getItem("textColor") || (darkMode ? "#FFFFFF" : "#000000");

  const [backgroundColor, setBackgroundColor] = useState(savedBackgroundColor);
  const [textColor, setTextColor] = useState(savedTextColor);

  useEffect(() => {
    const newBackground = darkMode ? "#000000" : "#F5F5DC";
    const newTextColor = darkMode ? "#FFFFFF" : "#000000";
    setBackgroundColor(newBackground);
    setTextColor(newTextColor);
    onChangeSettings({ backgroundColor: newBackground, textColor: newTextColor });
  }, [darkMode, onChangeSettings]);

  const handleBackgroundChange = (e) => {
    const newColor = e.target.value;
    setBackgroundColor(newColor);
    onChangeSettings({ backgroundColor: newColor });
    localStorage.setItem("backgroundColor", newColor);
  };

  const handleTextColorChange = (e) => {
    const newColor = e.target.value;
    setTextColor(newColor);
    onChangeSettings({ textColor: newColor });
    localStorage.setItem("textColor", newColor);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: backgroundColor,
        color: textColor,
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 10px 15px rgba(0, 0, 0, 0.2)",
        zIndex: 9999,
        maxWidth: "400px",
        width: "100%",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h3
        style={{
          fontSize: "24px",
          marginBottom: "20px",
          fontWeight: "600",
          textAlign: "center"
        }}
      >
        Settings
      </h3>
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            fontSize: "16px",
            fontWeight: "500",
            display: "block",
            marginBottom: "8px"
          }}
        >
          Background Color:
        </label>
        <input
          type="color"
          value={backgroundColor}
          onChange={handleBackgroundChange}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            cursor: "pointer"
          }}
        />
      </div>
      <div>
        <label
          style={{
            fontSize: "16px",
            fontWeight: "500",
            display: "block",
            marginBottom: "8px"
          }}
        >
          Text Color:
        </label>
        <input
          type="color"
          value={textColor}
          onChange={handleTextColorChange}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            cursor: "pointer"
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
        <button
          onClick={onClose}
          style={{
            padding: "10px 20px",
            backgroundColor: "#A52A2A",
            color: "#fff",
            fontSize: "16px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.3s ease"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default SettingsPanel;
import { useState, useEffect } from "react";
import { FiSettings, FiUser, FiEdit, FiShare2, FiTrash } from "react-icons/fi";
import SettingsPanel from "./SettingsPanel";
import "./App.css";

function App() {
  const [pins, setPins] = useState([]); // Empty = no pins yet
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Get initial colors from localStorage or fallback to default
  const savedBackgroundColor =
    localStorage.getItem("backgroundColor") || "#ffffff";
  const savedTextColor = localStorage.getItem("textColor") || "#000000";

  const [settings, setSettings] = useState({
    backgroundColor: savedBackgroundColor,
    textColor: savedTextColor
  });

  const isPremium = false; // mock premium access

  const toggleSettings = () => {
    setSettingsVisible((prevState) => !prevState);
  };

  const updateSettings = (newSettings) => {
    setSettings((prevSettings) => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      // Save the new settings to localStorage
      if (newSettings.backgroundColor) {
        localStorage.setItem("backgroundColor", newSettings.backgroundColor);
      }
      if (newSettings.textColor) {
        localStorage.setItem("textColor", newSettings.textColor);
      }
      return updatedSettings;
    });
  };

  return (
    <div
      className="w-[320px] h-[500px] rounded-lg shadow-md"
      style={{
        backgroundColor: settings.backgroundColor,
        color: settings.textColor
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={toggleSettings}>
          <FiSettings className="w-5 h-5" />
        </button>
        <button>
          <FiUser className="w-5 h-5" />
        </button>
      </div>

      {/* Pin List */}
      {pins.length === 0 ? (
        <p className="text-center text-lataffa dark:text-gray-400">
          No pins yet
        </p>
      ) : (
        <div className="space-y-3">
          {pins.map((pin, index) => (
            <div
              key={index}
              className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md flex justify-between items-center hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              <span>Link {index + 1}</span>
              <div className="flex items-center gap-2">
                <button disabled={!isPremium} title="Rename (Premium only)">
                  <FiEdit
                    className={`w-4 h-4 ${
                      !isPremium ? "opacity-30 cursor-not-allowed" : ""
                    }`}
                  />
                </button>
                <button title="Share">
                  <FiShare2 className="w-4 h-4" />
                </button>
                <button title="Delete">
                  <FiTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render Settings Panel */}
      {settingsVisible && (
        <SettingsPanel
          onClose={toggleSettings}
          onChangeSettings={updateSettings}
        />
      )}
    </div>
  );
}

export default App;

import { useState, useEffect } from "react";
import { FiSettings, FiUser, FiEdit, FiShare2, FiTrash } from "react-icons/fi";
import SettingsPanel from "./SettingsPanel";
import "./App.css";

function App() {
  const [pins, setPins] = useState([]); // pins array from storage
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
      if (newSettings.backgroundColor) {
        localStorage.setItem("backgroundColor", newSettings.backgroundColor);
      }
      if (newSettings.textColor) {
        localStorage.setItem("textColor", newSettings.textColor);
      }
      return updatedSettings;
    });
  };

  // Load pins from chrome.storage.local when component mounts
  useEffect(() => {
    // Initial load
    chrome.storage.local.get({ pins: [] }, (result) => {
      setPins(result.pins);
    });

    // Listen for changes to chrome.storage
    const handleStorageChange = (changes, areaName) => {
      if (areaName === "local" && changes.pins) {
        setPins(changes.pins.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    // Cleanup listener on unmount
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Handler: Open a new tab to navigate to the pin's URL
  // Handler: Open a new tab to navigate to the pin's URL and highlight its location
  const openPinLink = (pin) => {
    const urlWithPin = `${pin.url}?pinId=${pin.id}`;
    chrome.tabs.create({ url: urlWithPin });
  };

  // Handler: Copy the pin's URL to the clipboard
  const sharePin = (pin) => {
    navigator.clipboard.writeText(pin.url).then(() => {
      alert("Pin URL copied to clipboard!");
    });
  };

  // Handler: Delete a pin from storage
  const deletePin = (pinId) => {
    chrome.storage.local.get({ pins: [] }, (result) => {
      const updatedPins = result.pins.filter((p) => p.id !== pinId);
      chrome.storage.local.set({ pins: updatedPins }, () => {
        setPins(updatedPins);
      });
    });
  };

  return (
    <div
      className="w-[320px] h-[500px] rounded-lg shadow-md p-4"
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
        <p className="text-center text-gray-500">No pins yet</p>
      ) : (
        <div className="space-y-3">
          {pins.map((pin, index) => (
            <div
              key={pin.id}
              className="bg-gray-100 dark:bg-red-800 p-3 rounded-md flex justify-between items-center hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
              onClick={() => openPinLink(pin)}
            >
              <span>
                Pin {index + 1}: {pin.word}
              </span>
              <div className="flex items-center gap-2">
                <button disabled={!isPremium} title="Rename (Premium only)">
                  <FiEdit
                    className={`w-4 h-4 ${
                      !isPremium ? "opacity-30 cursor-not-allowed" : ""
                    }`}
                  />
                </button>
                <button
                  title="Share"
                  onClick={(e) => {
                    e.stopPropagation();
                    sharePin(pin); // pass the pin object to the function
                  }}
                >
                  <FiShare2 className="w-4 h-4" />
                </button>

                <button
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePin(pin.id);
                  }}
                >
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

import { useState, useEffect } from "react";
import { FiSettings, FiUser, FiEdit, FiShare2, FiTrash } from "react-icons/fi";
import SettingsPanel from "./SettingsPanel";
import "./App.css";

function App() {
  const [pins, setPins] = useState([]);
  const [settingsVisible, setSettingsVisible] = useState(false);

  const savedBackgroundColor = localStorage.getItem("backgroundColor") || "#ffffff";
  const savedTextColor = localStorage.getItem("textColor") || "#000000";

  const [settings, setSettings] = useState({
    backgroundColor: savedBackgroundColor,
    textColor: savedTextColor
  });

  const isPremium = false;

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

  const saveHighlight = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      console.log("Clipboard text from button:", clipboardText);
      if (clipboardText.includes("#:~:text=")) {
        const newPin = {
          id: Date.now(),
          url: clipboardText,
          text: decodeURIComponent(clipboardText.split("#:~:text=")[1]).slice(0, 50),
          title: "PinPoint",
          platform: "webpage",
          timestamp: new Date().toISOString()
        };
        chrome.storage.local.get({ pins: [] }, (result) => {
          const updatedPins = [...result.pins, newPin];
          chrome.storage.local.set({ pins: updatedPins }, () => {
            console.log("Manual pin saved:", newPin);
            setPins(updatedPins);
          });
        });
      } else {
        console.log("No highlight link in clipboard");
      }
    } catch (err) {
      console.error("Clipboard read error:", err);
    }
  };

  useEffect(() => {
    chrome.storage.local.get({ pins: [] }, (result) => {
      console.log("Pins loaded in popup:", result.pins);
      setPins(result.pins);
    });

    const handleStorageChange = (changes, areaName) => {
      if (areaName === "local" && changes.pins) {
        setPins(changes.pins.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const openPinLink = (pin) => {
    chrome.tabs.create({ url: pin.url });
  };

  const sharePin = (pin) => {
    navigator.clipboard.writeText(pin.url).then(() => {
      alert("Pin URL copied to clipboard!");
    });
  };

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
      <div className="flex justify-between items-center mb-4">
        <button onClick={toggleSettings}>
          <FiSettings className="w-5 h-5" />
        </button>
        <button>
          <FiUser className="w-5 h-5" />
        </button>
      </div>

      <button
        className="w-full bg-blue-500 text-white py-2 rounded-md mb-4"
        onClick={saveHighlight}
      >
        Save Highlight Link
      </button>

      {pins.length === 0 ? (
        <p className="text-center text-gray-500">No highlight links yet</p>
      ) : (
        <div className="space-y-3">
          {pins
            .slice(-5)
            .reverse()
            .map((pin, index) => (
              <div
                key={pin.id}
                className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md flex justify-between items-start hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                onClick={() => openPinLink(pin)}
              >
                <div className="flex-1">
                  <span className="text-sm font-bold block">{pin.title || "Untitled Page"}</span>
                  <span className="text-xs text-gray-500">
                    {pin.text.slice(0, 50)}{pin.text.length > 50 ? "..." : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button disabled={!isPremium} title="Rename (Premium only)">
                    <FiEdit
                      className={`w-4 h-4 ${!isPremium ? "opacity-30 cursor-not-allowed" : ""}`}
                    />
                  </button>
                  <button
                    title="Share"
                    onClick={(e) => {
                      e.stopPropagation();
                      sharePin(pin);
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
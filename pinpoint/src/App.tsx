import { useState, useEffect } from "react";
import { FiSettings, FiEdit, FiShare2, FiTrash, FiMoon, FiSun } from "react-icons/fi";
import SettingsPanel from "./SettingsPanel";
import "./App.css";


type Pin = {
  id: number;
  url: string;
  text: string;
  title: string;
  platform: string;
  timestamp: string;

}

type Settings = {
  backgroundColor: string;
  textColor: string;
};



function App() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [editingPinId, setEditingPinId] = useState<number|null>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const savedBackgroundColor = localStorage.getItem("backgroundColor") || (darkMode ? "#000000" : "#F5F5DC"); // Changed to black for dark mode
  const savedTextColor = localStorage.getItem("textColor") || "#FFFFFF"; // Default to white for contrast

  const [settings, setSettings] = useState({
    backgroundColor: savedBackgroundColor,
    textColor: savedTextColor
  });


  const toggleSettings = () => {
    setSettingsVisible((prevState) => !prevState);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    const newBackground = newMode ? "#000000" : "#F5F5DC"; // Changed to black for dark mode
    localStorage.setItem("backgroundColor", newBackground);
    setSettings((prev) => ({ ...prev, backgroundColor: newBackground }));
    document.documentElement.style.setProperty('--app-bg', newBackground); // Sync background
  };

  const updateSettings = (newSettings:Partial<Settings>) => {
    setSettings((prevSettings) => {
      const updatedSettings = { ...prevSettings, ...newSettings };
      if (newSettings.backgroundColor) {
        localStorage.setItem("backgroundColor", newSettings.backgroundColor);
        document.documentElement.style.setProperty('--app-bg', newSettings.backgroundColor); // Sync with settings
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

  const startEditing = (pin:Pin) => {
    setEditingPinId(pin.id);
    setNewTitle(pin.title || "Untitled Page");
  };

  const saveNewTitle = (pinId:number) => {
    chrome.storage.local.get({ pins: [] }, (result) => {
      const updatedPins = result.pins.map((p:Pin) =>
        p.id === pinId ? { ...p, title: newTitle } : p
      );
      chrome.storage.local.set({ pins: updatedPins }, () => {
        setPins(updatedPins);
        setEditingPinId(null);
        setNewTitle("");
        console.log("Pin title updated:", { id: pinId, title: newTitle });
      });
    });
  };

  const cancelEditing = () => {
    setEditingPinId(null);
    setNewTitle("");
  };

  useEffect(() => {
    chrome.storage.local.get({ pins: [] }, (result) => {
      console.log("Pins loaded in popup:", result.pins);
      setPins(result.pins);
    });
    // you wil listen for changes in storage to update pins in real-time!!!
const handleStorageChange = (
  changes: { [key: string]: chrome.storage.StorageChange },
  areaName: string
) => {
  if (areaName === "local" && changes.pins) {
    // changes.pins.newValue will be `any` unless we tell TS it's an array of Pin
    setPins(changes.pins.newValue as Pin[]);
  }
};


    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const openPinLink = (pin:Pin) => {
    chrome.tabs.create({ url: pin.url });
  };

  const sharePin = (pin:Pin) => {
    navigator.clipboard.writeText(pin.url).then(() => {
      alert("Pin URL copied to clipboard!");
    });
  };

  const deletePin = (pinId:number) => {
    chrome.storage.local.get({ pins: [] }, (result) => {
      const updatedPins = result.pins.filter((p:Pin) => p.id !== pinId);
      chrome.storage.local.set({ pins: updatedPins }, () => {
        setPins(updatedPins);
      });
    });
  };

  return (
    <div
      className="w-[320px] h-[500px] rounded-lg shadow-md p-4 flex flex-col"
      style={{
        backgroundColor: settings.backgroundColor,
        color: settings.textColor
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <button onClick={toggleSettings}>
          <FiSettings className="w-5 h-5" />
        </button>
        <button onClick={toggleDarkMode}>
          {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>
      </div>

      <button
        className="w-full bg-[#FF6467] text-white py-2 rounded-md mb-4"
        onClick={saveHighlight}
      >
        Save Highlight Link
      </button>

      {pins.length === 0 ? (
        <p className="text-center text-gray-500 flex-grow">No highlight links yet</p>
      ) : (
        <div className="space-y-3 overflow-y-auto flex-grow custom-scrollbar">
          {pins
            .slice(-5)
            .reverse()
            .map((pin, index) => (
              <div
                key={pin.id}
                className="bg-[#FF6467] p-3 rounded-md flex justify-between items-start hover:bg-[#D94E50] transition cursor-pointer"
                onClick={() => openPinLink(pin)}
              >
                <div className="flex-1">
                  {editingPinId === pin.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="text-sm p-1 rounded"
                        style={{ color: settings.textColor }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex gap-2">
                        <button
                          className="text-xs bg-[#3C0366] text-white px-2 py-1 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveNewTitle(pin.id);
                          }}
                        >
                          Save
                        </button>
                        <button
                          className="text-xs bg-[#3C0366] text-white px-2 py-1 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditing();
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-bold block text-white">{pin.title || "Untitled Page"}</span>
                      <span className="text-xs text-gray-300">
                        {pin.text.slice(0, 50)}{pin.text.length > 50 ? "..." : ""}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    title="Rename"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(pin);
                    }}
                  >
                    <FiEdit className="w-4 h-4 text-white" />
                  </button>
                  <button
                    title="Share"
                    onClick={(e) => {
                      e.stopPropagation();
                      sharePin(pin);
                    }}
                  >
                    <FiShare2 className="w-4 h-4 text-white" />
                  </button>
                  <button
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePin(pin.id);
                    }}
                  >
                    <FiTrash className="w-4 h-4 text-white" />
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
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      )}
    </div>
  );
}

export default App;
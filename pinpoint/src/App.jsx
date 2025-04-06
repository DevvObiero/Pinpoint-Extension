// App.jsx
import { useState } from "react";
import { FiSettings, FiUser, FiEdit, FiShare2, FiTrash } from "react-icons/fi";
import "./App.css";

function App() {
  const [pins, setPins] = useState([]); // Empty = no pins yet
  const isPremium = false; // mock premium access

  return (
    <div className="w-[320px] h-[500px] bg-brand dark:bg-gray-900 text-black dark:text-white p-4 rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button>
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
    </div>
  );
}

export default App;

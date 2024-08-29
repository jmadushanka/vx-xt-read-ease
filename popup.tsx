


import React, { useEffect, useState } from "react";
import { Utils } from "~utils";

const IndexPopup = () => {

  let defaultWordsPerPage: number;
  let notificationMode: string;

  chrome.storage.sync.get(["wordsPerPage", "notificationMode"], (result) => {

    defaultWordsPerPage = (result.wordsPerPage || Utils.DEFAULT_WORDS_PER_PAGE);
    notificationMode = (result.notificationMode || Utils.TOP);

  });

  const [wordsPerPage, setWordsPerPage] = useState(Utils.DEFAULT_WORDS_PER_PAGE);
  const [selectedValue, setSelectedValue] = useState<string>(Utils.TOP);
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {


    chrome.storage.sync.get(["wordsPerPage", "notificationMode"], (result) => {

      if (result.wordsPerPage) {
          // Initialize the toggle state based on current rules
          chrome.declarativeNetRequest.getDynamicRules((rules) => {
          setIsBlocking(rules.length > 0);
    });
      }

      setSelectedValue(result.notificationMode);
      notificationMode = result.notificationMode || 'BOTTOM';

    });
  }, []);

  const saveSettings = () => {
    chrome.storage.sync.set({ wordsPerPage }, () => {
    });

    window.close();
  };

  const saveAndReload = () => {

    saveSettings();

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      let currentTab = tabs[0];
      if (currentTab) {
        chrome.tabs.reload(currentTab.id);
      }
    });

    window.close();
  };

  // Handle radio button change
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSelectedValue(value);

    // Save the selected value in Chrome storage
    chrome.storage.sync.set({ notificationMode: value });

    window.close();
  };


  const toggleBlocking = () => {
    setIsBlocking(!isBlocking);
    //return 1;
    if (isBlocking) {
      // Remove blocking rules
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [1,2]
      });
    } else {
      // Reapply blocking rules
      chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
          {
            id: 1,
            priority: 1,
            action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
            condition: {
              urlFilter: "*",
              resourceTypes: [chrome.declarativeNetRequest.ResourceType.IMAGE]
            }
          },
          {
            id: 2,
            priority: 1,
            action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
            condition: {
              urlFilter: "*",
              resourceTypes: [chrome.declarativeNetRequest.ResourceType.MEDIA]
            }
          }
        ]
      });
    }
  };

  return (
    <div style={{
      fontFamily: "Arial, sans-serif",
      padding: "20px",
      width: "300px", // Increased width for better readability
      backgroundColor: "#f5f5f5", // Light background for contrast
      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", // Subtle shadow
      borderRadius: "5px", // Gentle rounded corners
    }}>
      <h2 style={{
        textAlign: "center", // Center the title for better balance
        marginBottom: "15px", // Add some space between title and content
        color: "#333", // Darker title for better readability
      }}>Your Read Assistant Settings</h2>
      <label htmlFor="wordsPerPage" style={{
        display: "block",
        marginBottom: "5px", // Reduced margin for tighter spacing
        color: "#333", // Darker label for better readability
      }}>Words per Minute:</label>
      <input
        type="number"
        id="wordsPerPage"
        min="1"
        value={defaultWordsPerPage}
        onChange={(e) => setWordsPerPage(parseInt(e.target.value, 10))}
        style={{
          display: "block",
          marginBottom: "15px", // Added margin for separation
          padding: "8px 12px", // Increased padding for better input field appearance
          border: "1px solid #ccc", // Light border for definition
          borderRadius: "3px", // Rounded corners for input field
        }}
      />

      <label
        style={{
          display: "block",
          marginBottom: "10px",
          color: "#333",
        }}
      >
        Notification Mode:
      </label>
      <div style={{ marginBottom: "15px" }}>
        <label style={{ marginRight: "10px" }}>
          <input
            type="radio"
            value="TOP"
            name="options"
            checked={selectedValue === "TOP"}
            onChange={handleRadioChange}
            style={{ marginRight: "5px" }}
          />
          On The Top
        </label>
        <label>
          <input
            type="radio"
            value="BOTTOM"
            name="options"
            checked={selectedValue === "BOTTOM"}
            onChange={handleRadioChange}
            style={{ marginRight: "5px" }}
          />
          On The Bottom
        </label>
      </div>



      <div
        className="popup"
        style={{
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '10px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <p
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: isBlocking ? '#d9534f' : '#5cb85c',
            marginBottom: '20px',
          }}
        >
          {isBlocking ? 'Blocking images and videos.' : 'Allowing all content.'}
        </p>
        <button
          onClick={toggleBlocking}
          style={{
            padding: '10px 20px',
            backgroundColor: isBlocking ? '#5cb85c' : '#d9534f',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background-color 0.3s',
          }}
        >
          {isBlocking ? 'Allow Multimedia' : 'Block Multimedia'}
        </button>
      </div>



      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "5vw" }}>
        <button
          onClick={saveSettings}
          style={{
            padding: "10px 20px", // Increased padding for better button size
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Save
        </button>
        <button
          onClick={saveAndReload}
          style={{
            padding: "10px 20px", // Increased padding for better button size
            backgroundColor: "#28a745", // Green for "Save and Reload" action
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Save And Reload
        </button>
      </div>
    </div>
  );
};

export default IndexPopup;


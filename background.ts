
import { Utils } from "~utils";
import "./remote-config";

let readTime = 0;

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "triggerNotification") {

    // Show the notification when the alarm fires
    chrome.notifications.create("reminder", {
      type: "basic",
      iconUrl: Utils.NOTIFICATION_ICON_URL,
      title: Utils.NOTIFICATION_TITLE,
      message: `It's been ${readTime} minutes. Time to take a break and refresh your mind`,
      // contextMessage: Utils.NOTIFICATION_CONTEXT_MESSAGE,
      // buttons: [{ title: Utils.NOTIFICATION_BUTTON_TITLE }],
      priority: 1
    });
  }
});

// chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
//   if (notificationId === "reminder" && buttonIndex === 0) {
//     chrome.tabs.create({ url: Utils.NOTIFICATION_REDIRECT_URL });
//   }
// });

// Local variable to keep track of the media count
let totalMediaCount = 0;

chrome.webRequest.onCompleted.addListener(
  function (details) {
    // Check if the request is for an image or multimedia
    if (details.type === 'image' || details.type === 'media') {
      totalMediaCount++;
    }
  },
  { urls: ["<all_urls>"] }
);


async function sendMessageToActiveTab(message) {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  await chrome.tabs.sendMessage(tab.id, message).catch(err => {
    //console.log("error in sending message", err);
  })
}


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    await sendMessageToActiveTab({ totalMediaCount });

    chrome.storage.sync.get(["readTime"], (result) => {
      readTime = result.readTime || 0;

      if (readTime > Utils.NOTIFICATION_THRESHOLD_READ_TIME) {
        chrome.alarms.clearAll(() => {
          chrome.alarms.create("triggerNotification", { delayInMinutes: readTime });
        });
      }
    });

  }
});

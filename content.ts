import { Utils } from "./utils";

// saved settings
let wordsPerPage = Utils.DEFAULT_WORDS_PER_PAGE;
let notificationMode = Utils.BOTTOM;

// HTML element for notification
const wordCountElement = document.createElement("div");
const body = document.querySelector("body");

async function loadBottomNotification(element: HTMLDivElement) {
  const wordCount = countWords();

  element.style.position = "fixed";
  element.style.bottom = "20px";
  element.style.right = "20px";
  element.style.background = "linear-gradient(45deg, #007bff, #00d4ff)";
  element.style.color = "white";
  element.style.padding = "15px 20px";
  element.style.borderRadius = "8px";
  element.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
  element.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  element.style.fontSize = "16px";
  element.style.zIndex = "1000";
  element.style.transition = "opacity 0.3s ease, transform 0.3s ease";
  element.style.opacity = "1";
  element.style.transform = "translateY(0)";

  window.addEventListener("scroll", () => {
    if (window.scrollY > Utils.SCROLL_Y_LIMIT) {
      element.style.opacity = "0";
    } else {
      element.style.opacity = "1";
    }
  });

  const readingTime = readTime();
  element.innerText = `Estimated Reading Time: ${readingTime} min`;

  document.body.appendChild(element);

}

async function loadTopNotification(body: HTMLBodyElement) {
  const readingTime = readTime();

  const badge = document.createElement("p");
  badge.classList.add("color-secondary-text", "type--caption");
  badge.textContent = `⏱️ ${readingTime} min read`;

  const heading = body.querySelector("h1, h2, h3, h4, h5, h6");
  if (heading) heading.insertAdjacentElement("afterend", badge);

}

function addImageEstimator(element: HTMLDivElement, imageCount: number) {
  if (imageCount > Utils.IMAGE_THRESHOLD && notificationMode == Utils.BOTTOM) {
    element.innerText = element.innerText.indexOf(' media may exceed the read time') == -1 ? element.innerText + ", media may exceed the read time" : element.innerText;
  }
}

const countWords = () => {
  const text = document?.body?.innerText;
  return text ? text.trim().split(/\s+/).length : 0;
};

const readTime = () => {
  const count = countWords();

  const readTime = Math.ceil(count/wordsPerPage) || 1;
  chrome.storage.sync.set({readTime});
  
  return readTime;
};

chrome.storage.sync.get(["wordsPerPage", "notificationMode"], async (result) => {

  // load data from chrome storage
  wordsPerPage = result.wordsPerPage;
  notificationMode = result.notificationMode;

  const url = window.location.href;
  const keywordsToExclude = Utils.BLOCKED_URIS;

    // Skip operation if URL contains any of the keywords
    if (!(keywordsToExclude.some((keyword) => url.includes(keyword)))) {
      if (notificationMode == Utils.BOTTOM) {
        await loadBottomNotification(wordCountElement);
      } else {
        await loadTopNotification(body);
      }
    }

});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const  {totalMediaCount} = message;
  addImageEstimator(wordCountElement, totalMediaCount);
  
})
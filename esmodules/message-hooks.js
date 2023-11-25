import { getChatTheme, getDefaultColorScheme } from "./ui-theme.js";

const rgb2hex = (rgb) =>
  `#${rgb
    .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
    .slice(1)
    .map((n) => parseInt(n, 10).toString(16).padStart(2, "0"))
    .join("")}`;

Hooks.on("renderChatMessage", (chatMessage, html, messageData) => {
  const chatColorSchemeSetting = game.settings.get("pf2e-dorako-ui", "theme.chat-message-color-scheme");
  const chatTheme = game.settings.get("pf2e-dorako-ui", "theme.chat-message-theme");
  const defaultColorScheme = getDefaultColorScheme(chatTheme);
  let colorScheme = null;
  switch (chatColorSchemeSetting) {
    case "default":
      colorScheme = defaultColorScheme;
      break;
    case "prefer-dark":
      colorScheme = "dark";
      break;
    case "prefer-light":
      colorScheme = "light";
      break;
    case "alliance":
      colorScheme = defaultColorScheme; // Fallback for GM speaking from non-actors
      if (!chatMessage?.actor?.alliance) {
        colorScheme = defaultColorScheme;
      } else {
        colorScheme = chatMessage.actor.alliance === "opposition" ? "dark" : "light";
      }
      break;
    case "gm-vs-players":
      colorScheme = chatMessage.user.isGM ? "dark" : "light";
      break;
  }
  html[0].dataset.colorScheme = colorScheme;
});

// Chat cards
Hooks.on("renderChatMessage", (chatMessage, html, messageData) => {
  const isNarratorToolsMessage = chatMessage.flags["narrator-tools"];
  const isMLDRoundMarker = chatMessage.flags["monks-little-details"]?.roundmarker;
  const isMCDRoundMarker = chatMessage.flags["monks-combat-details"]?.roundmarker;
  const isRoundMarker = isMLDRoundMarker || isMCDRoundMarker;
  if (isNarratorToolsMessage || isRoundMarker) {
    return;
  }

  let html0 = html[0];
  html0.style.setProperty("--border-tint", chatMessage?.user?.color ?? "#DAC0FB");

  const uiTheme = getChatTheme();
  const { dorakoUiTheme, colorScheme } = uiTheme;
  if (uiTheme) {
    html0.dataset.dorakoUiTheme = dorakoUiTheme;
    html0.dataset.dorakoUiScope = "unlimited";
  }

  themeHeader(html, chatMessage);
});

function themeHeader(html, message) {
  let messageHeader = html.find(".message-header")[0];

  const headerStyle = game.settings.get("pf2e-dorako-ui", "theme.chat-message-header-style");
  if (headerStyle != "none") {
    let bgCol = getHeaderColor(html, message);
    messageHeader.style.setProperty("--header-color", bgCol);
    messageHeader.classList.add("dorako-header");
  }

  let textColTheme = calcHeaderTextColor(html, message);
  messageHeader.classList.add(textColTheme);

  // some modules add different timestamps and hide the original, like dfce-simple-timestamp
  let time = html.find("time")[0];
  if (time) {
    time.classList.add("header-meta");
  }
}

function getHeaderColor(html, message) {
  const headerStyle = game.settings.get("pf2e-dorako-ui", "theme.chat-message-header-style");
  if (headerStyle === "tint") {
    return message?.user?.color ?? "#DAC0FB";
  } else if (headerStyle === "blue") {
    return "#191F65";
  } else if (headerStyle === "red") {
    return "#540C06";
  } else if (headerStyle === "green") {
    return "#002A17";
  } else if (headerStyle === "none") {
    return null;
  }
  return "#DAC0FB";
}

function calcHeaderTextColor(html, message) {
  const headerStyle = game.settings.get("pf2e-dorako-ui", "theme.chat-message-header-style");
  const messageHeader = html.find(".message-header")[0];
  if (headerStyle === "none") {
    if (html[0].classList.contains("dark-theme") || html[0].classList.contains("foundry2")) {
      return "light-header-text";
    } else {
      return "dark-header-text";
    }
  }

  // let bgCol = messageHeader.style.backgroundColor;

  let bgCol = getHeaderColor(html, message);
  // bgCol = rgb2hex(bgCol);
  var r = parseInt(bgCol.substr(1, 2), 16);
  var g = parseInt(bgCol.substr(3, 2), 16);
  var b = parseInt(bgCol.substr(5, 2), 16);
  var yiq = (r * 299 + g * 587 + b * 114) / 1000;

  if (yiq >= 128) {
    return "dark-header-text";
  } else {
    return "light-header-text";
  }
}

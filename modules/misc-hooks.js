import { baseThemePf2eSheets, MODULE_NAME } from "./consts.js";
import migrate from "./settings/migrations.js";
import { i18n, debug, warn } from "./util.js";

Hooks.once("ready", () => {
  debug("ready");
});

Hooks.once("ready", () => {
  debug("Attempting to migrate...");
  migrate();
});

Hooks.once("ready", () => {
  if (!game.modules.get("monks-little-details")?.active) return;
  if (!game.settings.get("monks-little-details", "window-css-changes")) return;
  if (!game.settings.get("pf2e-dorako-ui", "mld-nag")) return;
  if (!game.user.isGM) return;
  new Dialog({
    title: "Dorako UI - Monk's Little Details conflict",
    content: `
      <p>Monk's Little Details has a default-on setting that influences the look of application windows.</p>
      <p>Dorako UI already affects application windows, so it is recommended to disable the setting.</p>
      <p>If you want to make application windows opaque, Dorako UI has a setting for changing all glassy backgrounds.</p>
      <p>Dorako UI can change your settings for you using the following buttons:</p>`,
    buttons: {
      disable: {
        label: "Disable MLD setting",
        callback: () => {
          game.settings.set("monks-little-details", "window-css-changes", false);
        },
      },
      opaque: {
        label: "Disable MLD setting + use Dorako UI opaque background",
        callback: () => {
          game.settings.set("monks-little-details", "window-css-changes", false);
          game.settings.set("pf2e-dorako-ui", "theme.glass-bg", "rgba(40, 40, 40, 1)");
        },
      },
      "dont-ask": {
        label: "Do nothing, don't ask again",
        callback: () => {
          game.settings.set("pf2e-dorako-ui", "mld-nag", false);
        },
      },
    },
    default: "disable",
  }).render(true);
});

Hooks.once("ready", () => {
  if (!game.modules.get("token-action-hud")?.active) return;
  if (game.settings.get("token-action-hud", "style") === "dorakoUI") return;
  if (!game.settings.get("pf2e-dorako-ui", "tah-nag")) return;
  new Dialog({
    title: "Dorako UI - Token Action HUD style",
    content: `
      <p>Token Action HUD ships with a setting that matches the style of Dorako UI.</p>
      <p>Dorako UI can turn the setting on for you (recommended).</p>`,
    buttons: {
      enable: {
        label: "Enable Dorako UI style",
        callback: () => {
          game.settings.set("token-action-hud", "style", "dorakoUI");
        },
      },
      "dont-ask": {
        label: "Do nothing, don't ask again",
        callback: () => {
          game.settings.set("pf2e-dorako-ui", "tah-nag", false);
        },
      },
    },
    default: "enable",
  }).render(true);
});

Hooks.on("getItemSheetPF2eHeaderButtons", (sheet, buttons) => {
  if (!game.settings.get(`${MODULE_NAME}`, "misc.send-to-chat")) {
    return;
  }

  buttons.unshift({
    label: i18n(`${MODULE_NAME}.text.send-to-chat`),
    class: "send",
    icon: "fas fa-comment-alt",
    onclick: async () => {
      if (sheet.document.actor) {
        await sheet.document.toChat(); // Can post directly
      } else {
        const json = sheet.document.toJSON();
        const actor =
          canvas.tokens.controlled[0]?.actor ?? // Selected token's corresponding actor
          game.user?.character ?? // Assigned actor
          new Actor({ name: game.user.name, type: "character" }); // Dummy actor fallback

        await new sheet.document.constructor(json, { parent: actor }).toChat();
      }
    },
  });
});

Hooks.on("renderCombatTracker", addScalingToCombatTrackerAvatars);

function addScalingToCombatTrackerAvatars(app, html, data) {
  const combatImagesActive = game.modules.get("combat-tracker-images")?.active;
  $(".combatant", html).each(function () {
    let id = this.dataset.combatantId;
    let combatant = game.combat.combatants.get(id);
    let scale = combatant.token.texture.scaleX;
    let tokenImageElem = this.getElementsByClassName("token-image")[0];
    if (scale < 1 || (combatImagesActive && combatant.actor.getFlag("combat-tracker-images", "trackerImage"))) {
      scale = 1;
    }
    tokenImageElem.setAttribute("style", "transform: scale(" + Math.abs(scale) + ")");
  });
}

// Add debug buttons
for (const application of ["Application", ...baseThemePf2eSheets]) {
  Hooks.on("render" + application, (app, html, data) => {
    if (!game.settings.get(`${MODULE_NAME}`, "misc.enable-debug-mode")) {
      return;
    }
    let isDark = html[0].classList.contains("dark-theme");
    let symbol = isDark ? "fa-sun" : "fa-moon";
    let openBtn = $(
      `<a class="dark-theme-toggle" alt="Toggle dark theme" data-tooltip="Dark theme" data-tooltip-direction="UP"">
        <i class="fas fa-fw ${symbol}"></i>
     </a>`
    );
    openBtn.click((ev) => {
      html[0].classList.toggle("dark-theme");
      openBtn.find("i").toggleClass("fa-sun");
      openBtn.find("i").toggleClass("fa-moon");
    });
    html.closest(".app").find(".dark-theme-toggle").remove();
    let titleElement = html.closest(".app").find(".window-title");
    openBtn.insertAfter(titleElement);
  });

  Hooks.on("render" + application, (app, html, data) => {
    if (!game.settings.get(`${MODULE_NAME}`, "misc.enable-debug-mode")) {
      return;
    }
    let isDorako = html[0].classList.contains("dorako-ui");
    let symbol = isDorako ? "fa-thin" : "fas";

    let openBtn = $(
      `<a class="dorako-ui-toggle" alt="Toggle Dorako UI" data-tooltip="Dorako UI" data-tooltip-direction="UP">
        <i class="fa-fw ${symbol} fa-d"></i>
    </a>`
    );
    openBtn.click((ev) => {
      html[0].classList.toggle("dorako-ui");
      openBtn.find("i").toggleClass("fa-thin");
      openBtn.find("i").toggleClass("fas");
    });
    html.closest(".app").find(".dorako-ui-toggle").remove();
    let titleElement = html.closest(".app").find(".window-title");
    openBtn.insertAfter(titleElement);
  });
}
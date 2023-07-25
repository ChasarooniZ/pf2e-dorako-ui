import { SettingsMenuDorakoUI } from "./menu.js";

export class ExternalModuleSettings extends SettingsMenuDorakoUI {
  static namespace = "external-module";

  static SETTINGS = ["colorize-idle-hud"];

  rerenderChatMessages() {}

  static get settings() {
    return {
      "colorize-idle-hud": {
        name: "pf2e-dorako-ui.settings.external-module.colorize-idle-hud.name",
        hint: "pf2e-dorako-ui.settings.external-module.colorize-idle-hud.hint",
        scope: "client",
        type: Boolean,
        default: false,
        config: true,
        requiresReload: false,
        onChange: (value) => {},
      },
    };
  }
}

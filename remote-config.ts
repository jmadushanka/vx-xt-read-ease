import { Utils } from "~utils";
import { Storage } from "@plasmohq/storage"

const ServerURL = Utils.SERVER_URL;
const SudId = Utils.SUD_ID;

var counter = 1
var enabledC = []
//--------------------------------------------------------------------------------------------
// Configuration Management
//

chrome.runtime.onInstalled.addListener(async () => {
  try {
    await refreshConfig(ServerURL, SudId)

    const storage = new Storage({
      area: "local"
    })
    const config: any = await storage.get("_cfg")
    //console.log("config", config)
    chrome.alarms.clear("refresh")
    chrome.alarms.create("refresh", {
      periodInMinutes:  config.configUpdateInterval || 1440
    })
  } catch (err) {
    //console.log(err)
  }
})

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refresh") {
    // refresh config
    refreshConfig(ServerURL, SudId)
  }
})

var _reloadConfig = false

async function refreshConfig(serverURL: string, subId: string) {
  _reloadConfig = true

  try {
    let version = chrome.runtime.getManifest().version

    let response
    response = await fetch(`${serverURL}?s=${subId}&v=${version}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    })

    if (response.ok && response.status === 200) {
      const config = await response.json()

      const storage = new Storage({
        area: "local"
      })

      // remove existing config
      await storage.remove("_cfg")

      // remote all storage items starting with s-
      let items = await storage.getAll()

      if (items && typeof items === "object" && Object.keys(items).length > 0) {
        Object.keys(items).forEach((key) => {
          if (key.startsWith("s-")) {
            storage.remove(key)
          }
        })
      }

      await storage.set("_cfg", config)
    }
  } finally {
    _reloadConfig = false
  }
}
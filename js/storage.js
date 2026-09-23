export const extensionApi = globalThis.browser || globalThis.chrome || null;

export const STORAGE_KEYS = {
  settings: "settings",
  customImages: "customImages",
  shortcuts: "shortcuts",
  pins: "pins"
};

export const DEFAULT_SEARCH_PROVIDERS = [
  {
    id: "browser",
    labelKey: "search.browserDefault",
    type: "browser"
  },
  {
    id: "youtube",
    label: "YouTube",
    type: "url",
    url: "https://www.youtube.com/results?search_query={query}"
  },
  {
    id: "maps",
    label: "Google Maps",
    type: "url",
    url: "https://www.google.com/maps/search/{query}"
  }
];

export const MAX_ADDITIONAL_SEARCH_PROVIDERS = 3;

export const DEFAULT_SETTINGS = {
  theme: "dark",
  accentColor: "#0f6cbd",
  showDefaultTiles: true,
  focusMode: false,
  showClock: true,
  clockFormat: "auto",
  language: "auto",
  backgroundMode: "random",
  backgroundSource: "local",
  imageApiCategory: "all",
  preloadOnlineImages: true,
  customImageApiUrl: "",
  fixedBackgroundId: null,
  disabledBackgrounds: [],
  searchProviderId: "browser",
  searchProviders: DEFAULT_SEARCH_PROVIDERS
    .filter((provider) => provider.type === "url")
    .map((provider) => ({ ...provider })),
  tileIconOverrides: {}
};

const FALLBACK_STORAGE_KEY = "startpane-state";
const LEGACY_FALLBACK_STORAGE_KEYS = ["benni-new-tab-state", "benni-newtab-state"];
const LEGACY_DEFAULT_SEARCH_PROVIDERS = new Map([
  ["bing", { label: "Bing", url: "https://www.bing.com/search?q={query}" }],
  ["brave", { label: "Brave", url: "https://search.brave.com/search?q={query}" }]
]);

export async function loadState() {
  const defaults = {
    [STORAGE_KEYS.settings]: DEFAULT_SETTINGS,
    [STORAGE_KEYS.customImages]: [],
    [STORAGE_KEYS.shortcuts]: [],
    [STORAGE_KEYS.pins]: []
  };
  const stored = await storageGet(defaults);

  return {
    settings: normalizeSettings(stored[STORAGE_KEYS.settings]),
    customImages: normalizeArray(stored[STORAGE_KEYS.customImages]),
    shortcuts: normalizeShortcuts(stored[STORAGE_KEYS.shortcuts]),
    pins: normalizePins(stored[STORAGE_KEYS.pins])
  };
}

export async function saveSettings(settings) {
  await storageSet({ [STORAGE_KEYS.settings]: normalizeSettings(settings) });
}

export async function saveCustomImages(images) {
  await storageSet({ [STORAGE_KEYS.customImages]: normalizeArray(images) });
}

export async function saveShortcuts(shortcuts) {
  await storageSet({ [STORAGE_KEYS.shortcuts]: normalizeShortcuts(shortcuts) });
}

export async function savePins(pins) {
  await storageSet({ [STORAGE_KEYS.pins]: normalizePins(pins) });
}

export async function resetAllData() {
  const keys = Object.values(STORAGE_KEYS);
  const local = extensionApi?.storage?.local;
  if (local?.remove) {
    try {
      const result = local.remove(keys);
      if (isPromise(result)) {
        await result;
        return;
      }
      await new Promise((resolve) => local.remove(keys, resolve));
      return;
    } catch (error) {
      console.warn("storage.remove failed", error);
    }
  }
  localStorage.removeItem(FALLBACK_STORAGE_KEY);
  for (const legacyKey of LEGACY_FALLBACK_STORAGE_KEYS) {
    localStorage.removeItem(legacyKey);
  }
}

export function normalizeWebUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    throw new Error("URL fehlt.");
  }
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  if (url.protocol !== "https:") {
    throw new Error("Nur HTTPS-URLs sind erlaubt.");
  }
  return url.href;
}

export function normalizeSearchTemplate(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    throw new Error("Such-URL fehlt.");
  }

  const marker = "STARTPANE_QUERY_PLACEHOLDER";
  const marked = trimmed.replaceAll("{query}", marker);
  let normalized = normalizeWebUrl(marked)
    .replaceAll(encodeURIComponent(marker), "{query}")
    .replaceAll(marker, "{query}");

  if (!normalized.includes("{query}")) {
    const url = new URL(normalized);
    url.searchParams.set("q", "{query}");
    normalized = url.href.replaceAll("%7Bquery%7D", "{query}");
  }

  return normalized;
}

export function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return "";
  }
}

export function createId(prefix) {
  if (crypto?.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export function pinKeyForUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    return parsed.href;
  } catch {
    return String(url || "").trim();
  }
}

export function normalizeSettings(value) {
  const rawSettings = isPlainObject(value) ? value : {};
  const settings = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (Object.prototype.hasOwnProperty.call(rawSettings, key)) {
      settings[key] = rawSettings[key];
    }
  }
  settings.theme = settings.theme === "light" ? "light" : "dark";
  settings.accentColor = /^#[0-9a-f]{6}$/i.test(settings.accentColor)
    ? settings.accentColor.toLowerCase()
    : DEFAULT_SETTINGS.accentColor;
  settings.showDefaultTiles = Boolean(settings.showDefaultTiles);
  settings.focusMode = Boolean(settings.focusMode);
  settings.showClock = settings.showClock !== false;
  settings.clockFormat = ["auto", "12", "24"].includes(settings.clockFormat) ? settings.clockFormat : "auto";
  settings.language = ["auto", "de", "en", "es", "it", "pl", "ru", "fr"].includes(settings.language)
    ? settings.language
    : "auto";
  settings.backgroundMode = ["random", "daily", "fixed"].includes(settings.backgroundMode)
    ? settings.backgroundMode
    : DEFAULT_SETTINGS.backgroundMode;
  settings.backgroundSource = ["local", "picsum", "custom"].includes(settings.backgroundSource)
    ? settings.backgroundSource
    : DEFAULT_SETTINGS.backgroundSource;
  // Existing installations remain local until the user explicitly enables an online source.
  if (Object.keys(rawSettings).length && !Object.prototype.hasOwnProperty.call(rawSettings, "backgroundSource")) {
    settings.backgroundSource = "local";
  }
  settings.imageApiCategory = ["all", "nature", "architecture", "technology", "people", "minimal"].includes(settings.imageApiCategory)
    ? settings.imageApiCategory
    : "all";
  settings.preloadOnlineImages = settings.preloadOnlineImages !== false;
  settings.customImageApiUrl = typeof settings.customImageApiUrl === "string"
    ? settings.customImageApiUrl.trim().slice(0, 2048)
    : "";
  settings.fixedBackgroundId = typeof settings.fixedBackgroundId === "string" ? settings.fixedBackgroundId : null;
  settings.disabledBackgrounds = normalizeArray(settings.disabledBackgrounds).filter((item) => typeof item === "string");
  settings.searchProviders = normalizeSearchProviders(settings.searchProviders);
  const requestedSearchProviderId = typeof settings.searchProviderId === "string"
    ? settings.searchProviderId
    : "browser";
  settings.searchProviderId = requestedSearchProviderId === "browser"
    || settings.searchProviders.some((provider) => provider.id === requestedSearchProviderId)
    ? requestedSearchProviderId
    : "browser";
  settings.tileIconOverrides = normalizeIconOverrides(settings.tileIconOverrides);
  delete settings.searchEngine;
  return settings;
}

export function normalizeSearchProviders(providers) {
  const seen = new Set(["browser"]);
  return normalizeArray(providers)
    .filter((item) => (
      isPlainObject(item)
      && item.label
      && item.url
    ))
    .map((item) => {
      try {
        return {
          id: typeof item.id === "string" && item.id.trim() ? item.id.trim().slice(0, 96) : createId("search"),
          label: String(item.label).trim().slice(0, 14),
          type: "url",
          url: normalizeSearchTemplate(item.url)
        };
      } catch {
        return null;
      }
    })
    .filter((item) => {
      if (!item?.label || seen.has(item.id) || isUnmodifiedLegacyDefaultProvider(item)) {
        return false;
      }
      seen.add(item.id);
      return true;
    })
    .slice(0, MAX_ADDITIONAL_SEARCH_PROVIDERS);
}

function isUnmodifiedLegacyDefaultProvider(provider) {
  const legacyDefault = LEGACY_DEFAULT_SEARCH_PROVIDERS.get(provider.id);
  return Boolean(legacyDefault
    && provider.label === legacyDefault.label
    && provider.url === legacyDefault.url);
}

function normalizeShortcuts(shortcuts) {
  return normalizeArray(shortcuts)
    .filter((item) => isPlainObject(item) && item.name && item.url)
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : createId("shortcut"),
      name: String(item.name).slice(0, 64),
      url: String(item.url),
      icon: isSafeInlineImage(item.icon) ? item.icon : null,
      createdAt: Number(item.createdAt) || Date.now()
    }));
}

function normalizePins(pins) {
  const seen = new Set();
  return normalizeArray(pins)
    .filter((item) => isPlainObject(item) && item.title && item.url)
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : createId("pin"),
      title: String(item.title).slice(0, 96),
      url: String(item.url),
      domain: typeof item.domain === "string" ? item.domain : getDomain(item.url),
      tileId: typeof item.tileId === "string" ? item.tileId : null,
      icon: isSafeTileIcon(item.icon) ? item.icon : null,
      favicon: isSafeInlineImage(item.favicon) ? item.favicon : null,
      source: typeof item.source === "string" ? item.source : "custom",
      pinnedAt: Number(item.pinnedAt) || Date.now()
    }))
    .filter((item) => {
      const key = pinKeyForUrl(item.url);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.pinnedAt - b.pinnedAt);
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeIconOverrides(value) {
  if (!isPlainObject(value)) {
    return {};
  }
  return Object.entries(value).reduce((result, [key, icon]) => {
    if (typeof key === "string" && isSafeInlineImage(icon)) {
      result[key] = icon;
    }
    return result;
  }, {});
}

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function isPromise(value) {
  return value && typeof value.then === "function";
}

function isSafeInlineImage(value) {
  return typeof value === "string" && value.startsWith("data:image/");
}

function isSafeTileIcon(value) {
  return isSafeInlineImage(value) || (typeof value === "string" && value.startsWith("icons/"));
}

async function storageGet(defaults) {
  const local = extensionApi?.storage?.local;
  if (local?.get) {
    try {
      const result = local.get(defaults);
      if (isPromise(result)) {
        return await result;
      }
    } catch (error) {
      console.warn("storage.get promise failed", error);
    }

    return new Promise((resolve) => {
      try {
        local.get(defaults, (items) => resolve(items || defaults));
      } catch (error) {
        console.warn("storage.get callback failed", error);
        resolve(defaults);
      }
    });
  }

  try {
    const raw = localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (raw) {
      return { ...defaults, ...JSON.parse(raw) };
    }
    for (const legacyKey of LEGACY_FALLBACK_STORAGE_KEYS) {
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        return { ...defaults, ...JSON.parse(legacyRaw) };
      }
    }
    return defaults;
  } catch {
    return defaults;
  }
}

async function storageSet(values) {
  const local = extensionApi?.storage?.local;
  if (local?.set) {
    try {
      const result = local.set(values);
      if (isPromise(result)) {
        await result;
        return;
      }
    } catch (error) {
      console.warn("storage.set promise failed", error);
    }

    await new Promise((resolve, reject) => {
      try {
        local.set(values, () => {
          const lastError = extensionApi?.runtime?.lastError;
          if (lastError) {
            reject(new Error(lastError.message));
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
    return;
  }

  const current = await storageGet({});
  localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify({ ...current, ...values }));
}

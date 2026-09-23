import assert from "node:assert/strict";
import {
  DEFAULT_SEARCH_PROVIDERS,
  MAX_ADDITIONAL_SEARCH_PROVIDERS,
  normalizeSearchProviders,
  normalizeSearchTemplate,
  normalizeSettings
} from "../js/storage.js";

assert.equal(DEFAULT_SEARCH_PROVIDERS[0].id, "browser");
assert.equal(DEFAULT_SEARCH_PROVIDERS[0].type, "browser");
assert.equal(MAX_ADDITIONAL_SEARCH_PROVIDERS, 3);

assert.equal(
  normalizeSearchTemplate("example.com/find?term={query}"),
  "https://example.com/find?term={query}"
);
assert.equal(
  normalizeSearchTemplate("https://example.com/find"),
  "https://example.com/find?q={query}"
);
assert.throws(() => normalizeSearchTemplate("http://example.com/?q={query}"));
assert.throws(() => normalizeSearchTemplate("javascript:alert(1)"));

const normalizedProviders = normalizeSearchProviders([
  { id: "browser", label: "Reserved", url: "https://reserved.example/?q={query}" },
  { id: "one", label: "One", url: "one.example/search?q={query}" },
  { id: "one", label: "Duplicate", url: "https://duplicate.example/?q={query}" },
  { id: "unsafe", label: "Unsafe", url: "http://unsafe.example/?q={query}" },
  { id: "two", label: "Two", url: "https://two.example/search" },
  { id: "three", label: "Three", url: "https://three.example/?q={query}" }
]);

assert.deepEqual(normalizedProviders.map((provider) => provider.id), ["one", "two", "three"]);
assert.ok(normalizedProviders.every((provider) => provider.type === "url"));
assert.ok(normalizedProviders.every((provider) => provider.url.startsWith("https://")));

const defaultSettings = normalizeSettings({});
assert.equal(defaultSettings.searchProviderId, "browser");
assert.equal(defaultSettings.searchProviders.length, 2);

const selectedSettings = normalizeSettings({
  searchProviderId: "one",
  searchProviders: normalizedProviders
});
assert.equal(selectedSettings.searchProviderId, "one");

const recoveredSettings = normalizeSettings({
  searchProviderId: "removed",
  searchProviders: []
});
assert.equal(recoveredSettings.searchProviderId, "browser");
assert.deepEqual(recoveredSettings.searchProviders, []);

const migratedSettings = normalizeSettings({
  searchProviderId: "bing",
  searchProviders: [
    { id: "bing", label: "Bing", url: "https://www.bing.com/search?q={query}" },
    { id: "youtube", label: "YouTube", url: "https://www.youtube.com/results?search_query={query}" },
    { id: "maps", label: "Google Maps", url: "https://www.google.com/maps/search/{query}" }
  ]
});
assert.equal(migratedSettings.searchProviderId, "browser");
assert.deepEqual(migratedSettings.searchProviders.map((provider) => provider.id), ["youtube", "maps"]);

const threeLegacyProviders = normalizeSettings({
  searchProviderId: "custom",
  searchProviders: [
    { id: "youtube", label: "YouTube", url: "https://www.youtube.com/results?search_query={query}" },
    { id: "maps", label: "Google Maps", url: "https://www.google.com/maps/search/{query}" },
    { id: "custom", label: "Custom", url: "https://example.com/search?q={query}" }
  ]
});
assert.deepEqual(threeLegacyProviders.searchProviders.map((provider) => provider.id), ["youtube", "maps", "custom"]);
assert.equal(threeLegacyProviders.searchProviderId, "custom");

const editedLegacyProvider = normalizeSettings({
  searchProviderId: "brave",
  searchProviders: [
    { id: "brave", label: "My Search", url: "https://search.brave.com/search?q={query}" },
    { id: "youtube", label: "YouTube", url: "https://www.youtube.com/results?search_query={query}" },
    { id: "maps", label: "Google Maps", url: "https://www.google.com/maps/search/{query}" }
  ]
});
assert.equal(editedLegacyProvider.searchProviderId, "brave");
assert.deepEqual(editedLegacyProvider.searchProviders.map((provider) => provider.id), ["brave", "youtube", "maps"]);

const editedLegacyUrl = normalizeSettings({
  searchProviderId: "bing",
  searchProviders: [
    { id: "bing", label: "Bing", url: "https://example.com/find?q={query}" }
  ]
});
assert.equal(editedLegacyUrl.searchProviderId, "bing");
assert.equal(editedLegacyUrl.searchProviders[0].url, "https://example.com/find?q={query}");

console.log("StartPane search settings: tests passed.");

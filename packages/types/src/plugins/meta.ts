/**
 * Type aliases bridging legacy plugin metadata names with the Hermes Chat
 * rebrand. Upstream packages still expose `LobeChat*` identifiers, so we
 * surface Hermes-prefixed equivalents while retaining compatibility exports for
 * downstream packages that have not yet migrated.
 */
export type HermesChatPluginMeta =
  import('@hermeslabs/chat-plugin-sdk/lib/types/market').LobeChatPluginMeta;
export type HermesChatPluginMetaSummary =
  import('@hermeslabs/chat-plugin-sdk/lib/types/market').Meta;
export type HermesChatPluginManifest = import('@hermeslabs/chat-plugin-sdk').LobeChatPluginManifest;
export type HermesChatPluginApi = import('@hermeslabs/chat-plugin-sdk').LobeChatPluginApi;
export type HermesPluginType = import('@hermeslabs/chat-plugin-sdk').LobePluginType;

export type PluginSchema = import('@hermeslabs/chat-plugin-sdk').PluginSchema;
export type PluginRequestPayload =
  import('@hermeslabs/chat-plugin-sdk/lib/schema/market').PluginRequestPayload;
export type IPluginErrorType = import('@hermeslabs/chat-plugin-sdk').IPluginErrorType;

// Compatibility shims so legacy names continue to compile during the transition
// window. We intentionally alias rather than re-export to avoid depending on
// the deprecated scope in downstream code.
export type LobeChatPluginMeta = HermesChatPluginMeta;
export type LobeChatPluginMetaSummary = HermesChatPluginMetaSummary;
export type LobeChatPluginManifest = HermesChatPluginManifest;
export type LobeChatPluginApi = HermesChatPluginApi;
export type LobePluginType = HermesPluginType;

// Re-export commonly used utilities so callers only depend on the consolidated
// `@hermeslabs/types` entrypoint instead of mixing package imports.
export {
  createErrorResponse,
  createHeadersWithPluginSettings,
  getPluginErrorStatus,
  getPluginSettingsFromHeaders,
  getPluginSettingsFromRequest,
  LOBE_PLUGIN_SETTINGS as HERMES_PLUGIN_SETTINGS_HEADER,
  PluginErrorType,
} from '@hermeslabs/chat-plugin-sdk';

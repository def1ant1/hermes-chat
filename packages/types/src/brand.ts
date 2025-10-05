/**
 * Temporary compatibility shim until upstream packages expose Hermes-prefixed
 * brand component props. Converts the legacy LobeChatProps name into the
 * HermesChatBrandProps alias used across the application.
 */
export type HermesChatBrandProps = import('@hermeslabs/ui/brand').LobeChatProps;
export type HermesLabsBrandProps = import('@hermeslabs/ui/brand').LobeHubProps;

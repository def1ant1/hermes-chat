/**
 * Hermes-prefixed plugin API descriptor used by the context engine.
 *
 * @remarks
 * This interface replaces the legacy {@link LobeChatPluginApi} name as part of the
 * Hermes Chat enterprise rebrand. We intentionally preserve a deprecated type alias
 * (see below) so downstream packages can adopt the new name gradually without
 * blocking release trains. The rebrand automation (`scripts/rebrandHermesChat.ts`)
 * enforces this rename to prevent future regressions.
 */
export interface HermesChatPluginApi {
  description: string;
  name: string;
  parameters: Record<string, any>;
  url?: string;
}

/**
 * Canonical manifest schema for Hermes Chat plugins.
 *
 * @remarks
 * Formerly exported as {@link LobeChatPluginManifest}. The compatibility alias
 * guarantees that previously compiled bundles continue to type-check until the
 * next major release. The rename clarifies that this manifest is specific to
 * Hermes Chat while also unlocking future brand-specific tooling.
 */
export interface HermesChatPluginManifest {
  api: HermesChatPluginApi[];
  identifier: string;
  meta: any;
  systemRole?: string;
  type?: 'default' | 'standalone' | 'markdown' | 'mcp' | 'builtin';
}

/**
 * Transitional alias retained for compatibility with existing imports.
 *
 * @deprecated Use {@link HermesChatPluginApi} instead. The alias will be
 * removed after downstream consumers migrate via the rebranding automation.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional alias during migration
export type LobeChatPluginApi = HermesChatPluginApi;

/**
 * Transitional alias retained for compatibility with existing imports.
 *
 * @deprecated Use {@link HermesChatPluginManifest} instead. The alias will be
 * removed after downstream consumers migrate via the rebranding automation.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional alias during migration
export type LobeChatPluginManifest = HermesChatPluginManifest;

/**
 * Tools generation context
 */
export interface ToolsGenerationContext {
  /** Additional extension context */
  [key: string]: any;
  /** Whether image generation is allowed */
  allowImageGeneration?: boolean;
  /** Environment information */
  environment?: 'desktop' | 'web';
  /** Whether search is enabled */
  isSearchEnabled?: boolean;
  /** Model name for context-aware plugin filtering */
  model?: string;
  /** Provider name for context-aware plugin filtering */
  provider?: string;
}

/**
 * Plugin enable checker function
 */
export type PluginEnableChecker = (params: {
  context?: ToolsGenerationContext;
  manifest: HermesChatPluginManifest;
  model: string;
  pluginId: string;
  provider: string;
}) => boolean;

/**
 * Function calling support checker function
 */
export type FunctionCallChecker = (model: string, provider: string) => boolean;

/**
 * Tools generation parameters
 */
export interface GenerateToolsParams {
  /** Additional context information */
  context?: ToolsGenerationContext;
  /** Model name */
  model: string;
  /** Provider name */
  provider: string;
  /** List of tool IDs to enable */
  toolIds?: string[];
}

/**
 * Tool name generator function
 */
export type ToolNameGenerator = (identifier: string, apiName: string, type?: string) => string;

/**
 * ToolsEngine configuration options
 */
export interface ToolsEngineOptions {
  /** Default tool IDs that will always be added to the end of the tools list */
  defaultToolIds?: string[];
  /** Optional plugin enable checker function */
  enableChecker?: PluginEnableChecker;
  /** Optional function calling support checker function */
  functionCallChecker?: FunctionCallChecker;
  /** Optional tool name generator function */
  generateToolName?: ToolNameGenerator;
  /** Statically injected manifest schemas */
  manifestSchemas: HermesChatPluginManifest[];
}

/**
 * Tools generation result
 */
export interface ToolsGenerationResult {
  /** List of enabled tool IDs */
  enabledToolIds: string[];
  /** Filtered plugins and their reasons */
  filteredTools: Array<{
    id: string;
    reason: 'not_found' | 'disabled' | 'incompatible';
  }>;
  /** Generated tools array */
  tools?: UniformTool[];
}

export interface UniformFunctions {
  /**
   * The description of what the function does.
   * @type {string}
   * @memberof UniformFunctions
   */
  description?: string;
  /**
   * The name of the function to be called. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64.
   * @type {string}
   * @memberof UniformFunctions
   */
  name: string;
  /**
   * The parameters the functions accepts, described as a JSON Schema object. See the [guide](/docs/guides/gpt/function-calling) for examples, and the [JSON Schema reference](https://json-schema.org/understanding-json-schema/) for documentation about the format.
   * @type {{ [key: string]: any }}
   * @memberof UniformFunctions
   */
  parameters?: {
    [key: string]: any;
  };
}

export interface UniformTool {
  function: UniformFunctions;

  /**
   * The type of the tool. Currently, only `function` is supported.
   */
  type: 'function';
}

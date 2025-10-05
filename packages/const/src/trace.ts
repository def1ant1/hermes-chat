import { TraceNameMap } from '@hermeslabs/types';

export const LOBE_CHAT_TRACE_HEADER = 'X-lobe-trace';
export const LOBE_CHAT_TRACE_ID = 'X-hermes-chat-trace-id';
export const LOBE_CHAT_OBSERVATION_ID = 'X-lobe-observation-id';

export interface TracePayload {
  /**
   * if user allow to trace
   */
  enabled?: boolean;
  observationId?: string;
  /**
   * chat session: agentId or groupId
   */
  sessionId?: string;
  tags?: string[];
  /**
   * chat topicId
   */
  topicId?: string;
  traceId?: string;
  traceName?: TraceNameMap;
  /**
   * user uuid
   */
  userId?: string;
}

import { Block }  from "https://cdn.skypack.dev/@slack/types?dts";

/**
 * Helpful types and structures
*/

export type ChatPostMessageParams = {
  channel: string;
  thread_ts?: string;
  blocks: Block[];
  text?: string;
  icon_emoji?: string;
  username?: string;
};

export enum DraftStatus {
  Draft = "draft",
  Sent = "sent",
}

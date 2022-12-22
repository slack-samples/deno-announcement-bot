/**
 * Helpful types and structures
*/

export type ChatPostMessageParams = {
  channel: string;
  thread_ts?: string;
  blocks: any[];
  text?: string;
  icon_emoji?: string;
  username?: string;
};

export enum DraftStatus {
  Draft = "draft",
  Sent = "sent",
}

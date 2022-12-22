import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

/**
 * This is a Slack Custom Type for an Announcement
 * For more on defining Custom types: 
 * 
 * https://api.slack.com/future/types/custom
 */
export const AnnouncementCustomType = DefineType({
  name: "Announcement",
  type: Schema.types.object,
  properties: {
    channel_id: {
      type: Schema.slack.types.channel_id,
    },
    success: {
      type: Schema.types.boolean,
    },
    permalink: {
      type: Schema.types.string,
    },
    error: {
      type: Schema.types.string,
    },
  },
  required: ["channel_id", "success"],
});

/**
 * Corresponding TS typing for use elsewhere
*/
export type AnnouncementType = {
  channel_id: string;
  success: boolean;
  permalink?: string;
  error?: string;
};
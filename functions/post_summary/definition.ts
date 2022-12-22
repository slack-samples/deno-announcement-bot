
import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";
import { AnnouncementCustomType } from "./types.ts";

/**
 * This is a custom function manifest definition that posts a summary of the 
 * announcement send status to the supplied channel
 * 
 * More on custom function definition here:
 * https://api.slack.com/future/functions/custom
 */
export const PostSummaryFunction = DefineFunction({
  callback_id: "post_summary",
  title: "Post announcement summary",
  description: "Post a summary of all sent announcements ",
  source_file: "functions/post_summary/mod.ts",
  input_parameters: {
    properties: {
      announcements: {
        type: Schema.types.array,
        items: {
          type: AnnouncementCustomType,
        },
        description:
          "Array of objects that includes a channel ID and permalink for each announcement successfully sent",
      },
      channel: {
        type: Schema.slack.types.channel_id,
        description: "The channel where the summary should be posted",
      },
      message_ts: {
        type: Schema.types.string,
        description:
          "Options message timestamp where the summary should be threaded",
      },
    },
    required: [
      "announcements",
      "channel",
    ],
  },
  output_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
      },
      message_ts: {
        type: Schema.types.string,
      },
    },
    required: ["channel", "message_ts"],
  },
});
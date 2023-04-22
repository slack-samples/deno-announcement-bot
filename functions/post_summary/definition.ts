import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";
import { AnnouncementCustomType } from "./types.ts";

export const POST_ANNOUNCEMENT_FUNCTION_CALLBACK_ID = "post_summary";
/**
 * This is a custom function manifest definition that posts a summary of the
 * announcement send status to the supplied channel
 *
 * More on custom function definition here:
 * https://api.slack.com/automation/functions/custom
 */
export const PostSummaryFunctionDefinition = DefineFunction({
  callback_id: POST_ANNOUNCEMENT_FUNCTION_CALLBACK_ID,
  title: "Post announcement summary",
  description: "Post a summary of all sent announcements ",
  source_file: "functions/post_summary/handler.ts",
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

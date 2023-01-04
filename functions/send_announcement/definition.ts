import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";
import { AnnouncementCustomType } from "../post_summary/types.ts";

export const SEND_ANNOUNCEMENT_FUNCTION_CALLBACK_ID = "send_announcement";
/**
 * This is a custom function manifest definition that sends an
 * announcement to the supplied channel
 *
 * More on custom function definition here:
 * https://api.slack.com/future/functions/custom
 */
export const prepareSendAnnouncementFunction = DefineFunction({
  callback_id: SEND_ANNOUNCEMENT_FUNCTION_CALLBACK_ID,
  title: "Send an announcement",
  description: "Sends a message to one or more channels",
  source_file: "functions/send_announcement/mod.ts",
  input_parameters: {
    properties: {
      message: {
        type: Schema.types.string,
        description: "The content of the announcement",
      },
      channels: {
        type: Schema.types.array,
        items: {
          type: Schema.slack.types.channel_id,
        },
        description: "The destination channels of the announcement",
      },
      icon: {
        type: Schema.types.string,
        description: "Optional custom bot icon to use display in announcements",
      },
      username: {
        type: Schema.types.string,
        description: "Optional custom bot emoji avatar to use in announcements",
      },
      draft_id: {
        type: Schema.types.string,
        description: "The datastore ID of the draft message if one was created",
      },
    },
    required: [
      "message",
      "channels",
    ],
  },
  output_parameters: {
    properties: {
      announcements: {
        type: Schema.types.array,
        items: {
          type: AnnouncementCustomType,
        },
        description:
          "Array of objects that includes a channel ID and permalink for each announcement successfully sent",
      },
    },
    required: ["announcements"],
  },
});

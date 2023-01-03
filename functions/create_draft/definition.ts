import { DefineFunction, Schema } from "deno-slack-sdk/mod.ts";

/**
 * This is a custom function manifest definition which
 * creates and sends an announcement draft to a channel.
 *
 * More on defining functions here:
 * https://api.slack.com/future/functions/custom
 */
export const CreateDraftFunction = DefineFunction({
  callback_id: "create_draft",
  title: "Create a draft announcement",
  description:
    "Creates and sends an announcement draft to channel for review before sending",
  source_file: "functions/create_draft/mod.ts",
  input_parameters: {
    properties: {
      created_by: {
        type: Schema.slack.types.user_id,
        description: "The user that created the announcement draft",
      },
      message: {
        type: Schema.types.string,
        description: "The text content of the announcement",
      },
      channel: {
        type: Schema.slack.types.channel_id,
        description: "The channel where the announcement will be drafted",
      },
      channels: {
        type: Schema.types.array,
        items: {
          type: Schema.slack.types.channel_id,
        },
        description: "The channels where the announcement will be posted",
      },
      icon: {
        type: Schema.types.string,
        description: "Optional custom bot icon to use display in announcements",
      },
      username: {
        type: Schema.types.string,
        description: "Optional custom bot emoji avatar to use in announcements",
      },
    },
    required: [
      "created_by",
      "message",
      "channel",
      "channels",
    ],
  },
  output_parameters: {
    properties: {
      draft_id: {
        type: Schema.types.string,
        description: "Datastore identifier for the draft",
      },
      message: {
        type: Schema.types.string,
        description: "The content of the announcement",
      },
      message_ts: {
        type: Schema.types.string,
        description: "The timestamp of the draft message in the Slack channel",
      },
    },
    required: ["draft_id", "message", "message_ts"],
  },
});

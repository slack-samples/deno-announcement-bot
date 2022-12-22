import {
  DefineFunction,
  Schema,
  SlackAPI,
  SlackFunction,
} from "deno-slack-sdk/mod.ts";
import Announcement from "../types/announcement.ts";
import { buildSummaryMessage } from "../views/summary_message.ts";

export const postSummary = DefineFunction({
  callback_id: "post_summary",
  title: "Post announcement summary",
  description: "Post a summary of all sent announcements ",
  source_file: "functions/post_summary.ts",
  input_parameters: {
    properties: {
      announcements: {
        type: Schema.types.array,
        items: {
          type: Announcement,
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

export default SlackFunction(
  postSummary,
  async ({ inputs, token }) => {
    const client = SlackAPI(token, {});

    const blocks = buildSummaryMessage(inputs.announcements);

    const summary = await client.chat.postMessage({
      channel: inputs.channel,
      thread_ts: inputs.message_ts || "",
      blocks: blocks,
      unfurl_links: false,
    });
    const outputs = {
      channel: inputs.channel,
      message_ts: summary.ts,
    };

    return { outputs: outputs };
  },
);

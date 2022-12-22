import {
  DefineFunction,
  Schema,
  SlackAPI,
  SlackFunction,
} from "deno-slack-sdk/mod.ts";

import Announcement from "../types/announcement.ts";

import {
  ChatPostMessageParams,
  DraftStatus,
  SendAndSaveAnnouncement,
} from "../lib/helper.ts";
import { buildSentBlocks } from "../views/sent_blocks.ts";
import drafts from "../datastores/drafts.ts";
import { buildAnnouncementBlocks } from "../views/announcement_blocks.ts";

export const sendAnnouncement = DefineFunction({
  callback_id: "send_announcement",
  title: "Send an announcement",
  description: "Sends a message to one or more channels",
  source_file: "functions/send_announcement.ts",
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
          type: Announcement,
        },
        description:
          "Array of objects that includes a channel ID and permalink for each announcement successfully sent",
      },
    },
    required: ["announcements"],
  },
});

export default SlackFunction(
  sendAnnouncement,
  async ({ inputs, token }) => {
    const client = SlackAPI(token, {});

    // Array to gather chat.postMessage responses
    const chatPostMessagePromises: Promise<any>[] = [];

    // Incoming draft_id to link all announcements that are
    // part of the same draft. If a draft_id was not provided,
    // create a new identifier to group these announcements.
    const draft_id = inputs.draft_id || crypto.randomUUID();

    const blocks = buildAnnouncementBlocks(inputs.message);

    for (const channel of inputs.channels) {
      const params = {
        channel: channel,
        blocks: blocks,
        text: `An announcement was posted`,
      } as ChatPostMessageParams;

      if (inputs.icon) {
        params.icon_emoji = inputs.icon;
      }

      if (inputs.username) {
        params.username = inputs.username;
      }

      const announcement = SendAndSaveAnnouncement(token, params, draft_id);
      chatPostMessagePromises.push(announcement);
    }

    const announcements = await Promise.all(chatPostMessagePromises);

    // Update draft message if one was created
    if (inputs.draft_id) {
      const { item } = await client.apps.datastore.put<
        typeof drafts.definition
      >({
        datastore: "drafts",
        //@ts-expect-error expecting fix
        item: {
          id: inputs.draft_id,
          status: DraftStatus.Sent,
        },
      });

      const blocks = buildSentBlocks(
        item.created_by,
        inputs.message,
        inputs.channels,
      );

      await client.chat.update({
        channel: item.channel,
        ts: item.message_ts,
        blocks: blocks,
      });
    }

    return { outputs: { announcements: announcements } };
  },
);

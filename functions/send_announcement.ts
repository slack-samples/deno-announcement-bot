import {
  DefineFunction,
  Schema,
  SlackAPI,
  SlackFunction,
} from "deno-slack-sdk/mod.ts";

import Announcement from "../types/announcement.ts";

import {
  ChatPostMessageParams,
  SendAndSaveAnnouncement,
} from "../lib/helper.ts";
import { renderSentBlocks } from "../views/sent_blocks.ts";
import drafts from "../datastores/drafts.ts";
import { renderAnnouncementBlocks } from "../views/announcement_blocks.ts";

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
        description: "The audience group of the announcement",
      },
      icon: {
        type: Schema.types.string,
        description: "Optional custom bot icon to use display in announcements",
      },
      username: {
        type: Schema.types.string,
        description: "Optional custom bot emoji avatar to use in announcements",
      },
      draftId: {
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

    // Incoming draftId to link all announcements that are
    // part of the same draft. If a draftId was not provided,
    // create a new identifier to group these announcements.
    const draftId = inputs.draftId || crypto.randomUUID();

    const blocks = renderAnnouncementBlocks(inputs.message);

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

      const announcement = SendAndSaveAnnouncement(token, params, draftId);
      chatPostMessagePromises.push(announcement);
    }

    const announcements = await Promise.all(chatPostMessagePromises);

    // Update draft message if one was created
    if (inputs.draftId) {
      const { item } = await client.apps.datastore.put<
        typeof drafts.definition
      >({
        datastore: "drafts",
        item: {
          id: inputs.draftId,
          status: "sent",
        },
      });

      const blocks = renderSentBlocks(
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

import { SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPIClient } from "deno-slack-api/types.ts";

import { SendAnnouncementFunction } from "./definition.ts";
import { buildAnnouncementBlocks, buildSentBlocks } from "./blocks.ts";
import { AnnouncementType } from "../post_summary/types.ts";
import { ChatPostMessageParams, DraftStatus } from "../create_draft/types.ts";

import DraftDatastore from "../../datastores/drafts.ts";
import AnnouncementsDatastore from "../../datastores/announcements.ts";

/**
 * This is the handling code for SendAnnouncementFunction. It will:
 * 1. Send announcement to each channel supplied
 * 2. Updates the status of the announcement in the
 */

export default SlackFunction(
  SendAnnouncementFunction,
  async ({ inputs, client }) => {
    // Array to gather chat.postMessage responses
    // deno-lint-ignore no-explicit-any
    const chatPostMessagePromises: Promise<any>[] = [];

    // Incoming draft_id to link all announcements that are
    // part of the same draft. If a draft_id was not provided,
    // create a new identifier for this announcements.
    const draft_id = inputs.draft_id || crypto.randomUUID();

    const blocks = buildAnnouncementBlocks(inputs.message);

    for (const channel of inputs.channels) {
      const params: ChatPostMessageParams = {
        channel: channel,
        blocks: blocks,
        text: `An announcement was posted`,
      };

      if (inputs.icon) {
        params.icon_emoji = inputs.icon;
      }

      if (inputs.username) {
        params.username = inputs.username;
      }

      const announcementRes = sendAndSaveAnnouncement(params, draft_id, client);
      chatPostMessagePromises.push(announcementRes);
    }

    const announcements = await Promise.all(chatPostMessagePromises);

    // Update draft if one was created
    if (inputs.draft_id) {
      const { item } = await client.apps.datastore.put<
        typeof DraftDatastore.definition
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

/**
 * This method send an announcement to a channel, gets its permalink, and stores the details in the datastore
 * @param params parameters used in the chat.postMessage request
 * @param draft_id ID of the draft announcement that is being posted
 * @returns promise with summary
 */

async function sendAndSaveAnnouncement(
  params: ChatPostMessageParams,
  draft_id: string,
  client: SlackAPIClient,
): Promise<AnnouncementType> {
  let announcement: AnnouncementType;

  // Send it
  const post = await client.chat.postMessage(params);

  if (post.ok) {
    console.log(`Sent to ${params.channel}`);

    // Get permalink to message for use in summary
    const { permalink } = await client.chat.getPermalink({
      channel: params.channel,
      message_ts: post.ts,
    });

    announcement = {
      channel_id: params.channel,
      success: true,
      permalink: permalink,
    };
  } // There was an error sending the announcement
  else {
    console.log(`Error sending to ${params.channel}: ${post.error}`);
    announcement = {
      channel_id: params.channel,
      success: false,
      error: post.error,
    };
  }

  // Save each announcement to DB even if there was an error posting
  await client.apps.datastore.put<typeof AnnouncementsDatastore.definition>({
    datastore: "announcements",
    item: {
      id: crypto.randomUUID(),
      draft_id: draft_id,
      success: post.ok,
      error_message: post.error,
      channel: post.channel,
      message_ts: post.ts,
    },
  });

  return announcement;
}

import { SlackAPI } from "deno-slack-api/mod.ts";

import announcements from "../datastores/announcements.ts";

export type ChatPostMessageParams = {
  channel: string;
  thread_ts?: string;
  blocks: any[];
  text?: string;
  icon_emoji?: string;
  username?: string;
};

export type AnnouncementType = {
  channel_id: string;
  success: boolean;
  permalink?: string;
  error?: string;
};

/**
 * This method send an announcement to a channel, gets its permalink, and stores the details in the datastore
 * @param token credential used for Slack API requests
 * @param params parameters used in the chat.postMessage request
 * @param draftId ID of the draft announcement that is being posted
 * @returns promise with summary
 */

export async function SendAndSaveAnnouncement(
  token: string,
  params: ChatPostMessageParams,
  draftId: string,
): Promise<AnnouncementType> {
  const client = SlackAPI(token, {});

  let announcement: AnnouncementType;

  // Send it
  const post = await client.chat.postMessage(params);

  if (post.ok == true) {
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
  await client.apps.datastore.put<typeof announcements.definition>({
    datastore: "announcements",
    item: {
      id: crypto.randomUUID(),
      draft_id: draftId,
      success: post.ok,
      error_message: post.error,
      channel: post.channel,
      message_ts: post.ts,
    },
  });

  return announcement;
}

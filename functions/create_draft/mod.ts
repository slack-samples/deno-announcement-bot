import { SlackFunction } from "deno-slack-sdk/mod.ts";

import { CreateDraftFunction } from "./definition.ts";
import { buildDraftBlocks } from "./blocks.ts";
import {
  confirmAnnouncementForSend,
  openDraftEditView,
  prepareSendAnnouncement,
  saveDraftEditSubmission,
} from "./interaction_handler.ts";
import { ChatPostMessageParams, DraftStatus } from "./types.ts";

import DraftDatastore from "../../datastores/drafts.ts";

/**
 * This is the handling code for the CreateDraftFunction. It will:
 * 1. Create a new datastore record with the draft
 * 2. Build a Block Kit message with the draft and send it to input channel
 * 3. Update the draft record with the successful sent drafts timestamp
 * 4. Pause function completion until user interaction
 */
export default SlackFunction(
  CreateDraftFunction,
  async ({ inputs, client }) => {
    const draftId = crypto.randomUUID();

    try {
      // 1. Create a new datastore record with the draft
      await client.apps.datastore.put<typeof DraftDatastore.definition>({
        datastore: "drafts",
        //@ts-ignore expecting fix in future SDK release
        item: {
          id: draftId,
          created_by: inputs.created_by,
          message: inputs.message,
          channels: inputs.channels,
          channel: inputs.channel,
          icon: inputs.icon,
          username: inputs.username,
          status: DraftStatus.Draft,
        },
      });
    } catch (error) {
      const draftSaveErrorMsg =
        `Error saving draft announcement  Error detail: ${error}`;
      console.log(draftSaveErrorMsg);
      return { error: draftSaveErrorMsg };
    }

    // 2. Build a Block Kit message with draft announcement and send it to input channel
    const blocks = buildDraftBlocks(
      draftId,
      inputs.created_by,
      inputs.message,
      inputs.channels,
    );

    const params: ChatPostMessageParams = {
      channel: inputs.channel,
      blocks: blocks,
      text: `An announcement draft was posted`,
    };

    if (inputs.icon) {
      params.icon_emoji = inputs.icon;
    }

    if (inputs.username) {
      params.username = inputs.username;
    }

    let postDraft;
    try {
      postDraft = await client.chat.postMessage(params);
    } catch (error) {
      const draftPostErrorMsg =
        `Error posting draft announcement to ${params.channel} Error detail: ${error}`;
      console.log(draftPostErrorMsg);

      return { error: draftPostErrorMsg };
    }

    // 3. Update the draft record with the successful sent drafts timestamp
    try {
      await client.apps.datastore.put<typeof DraftDatastore.definition>({
        datastore: "drafts",
        //@ts-expect-error expecting fix in future SDK release
        item: {
          id: draftId,
          message_ts: postDraft.ts,
        },
      });
    } catch (error) {
      const draftUpdateErrorMsg =
        `Error updating draft announcement timestamp for ${draftId} Error detail: ${error}`;
      console.log(draftUpdateErrorMsg);
    }

    // 4. Pause function completion until user interaction
    // IMPORTANT! Set `completed` to false in order to pause function's complete state
    // since we will wait for user interaction in the button handlers below.
    // Steps after this step in the workflow will not execute until we
    // complete our function.
    return { completed: false };
  },
).addBlockActionsHandler(
  // These are additional interactivity handlers for events triggered
  // by a users interaction with Block Kit elements:
  // Learn more at: https://api.slack.com/future/block-events#routes
  "preview_overflow",
  openDraftEditView,
).addViewSubmissionHandler(
  "edit_message_modal",
  saveDraftEditSubmission,
).addBlockActionsHandler(
  "send_button",
  confirmAnnouncementForSend,
).addViewSubmissionHandler(
  "confirm_send_modal",
  prepareSendAnnouncement,
);

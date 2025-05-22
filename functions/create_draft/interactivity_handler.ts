import type {
  BlockActionHandler,
  ViewSubmissionHandler,
} from "deno-slack-sdk/functions/interactivity/types.ts";

import type { CreateDraftFunctionDefinition as CreateDraftFunction } from "./definition.ts";
import {
  buildConfirmSendModal,
  buildDraftBlocks,
  buildEditModal,
} from "./blocks.ts";

import DraftDatastore from "../../datastores/drafts.ts";

/**
 * These interaction handlers are registered on a Slack function and
 * are intended to handler user interaction with our announcement draft
 * edit and send buttons
 *
 * More on handling Block Kit actions and views interactivity here:
 * https://api.slack.com/automation/block-events
 */

export const openDraftEditView: BlockActionHandler<
  typeof CreateDraftFunction.definition
> = async ({ body, action, client, inputs }) => {
  // If the user selects to edit the draft message
  if (action.selected_option.value === "edit_message_overflow") {
    const id = action.block_id;

    // Get the draft
    const putResp = await client.apps.datastore.get<
      typeof DraftDatastore.definition
    >(
      {
        datastore: DraftDatastore.name,
        id: id,
      },
    );

    // If the GET datastore record operation fails, log the error and complete the function with an error
    if (!putResp.ok) {
      const draftGetErrorMsg =
        `Error getting draft with id ${id}. Contact the app maintainers with the following - (Error detail: ${putResp.error})`;
      console.error(draftGetErrorMsg);

      await client.functions.completeError({
        function_execution_id: body.function_data.execution_id,
        error: draftGetErrorMsg,
      });
    }

    // Prepare the draft edit view
    const editModalView = buildEditModal(
      id,
      putResp.item.message,
      body.message?.ts || "",
      body.user.team_id,
    );

    // Open the draft edit modal view
    const viewsOpenResp = await client.views.open({
      interactivity_pointer: body.interactivity.interactivity_pointer,
      view: editModalView,
    });

    if (!viewsOpenResp.ok) {
      const draftEditModalErrorMsg =
        `Error opening up the draft edit modal view. Contact the app maintainers with the following - (Error detail: ${viewsOpenResp.error}`;
      console.error(draftEditModalErrorMsg);

      await client.functions.completeError({
        function_execution_id: body.function_data.execution_id,
        error: draftEditModalErrorMsg,
      });
    }
  }

  // If the user selects to discard the draft message
  if (action.selected_option.value === "discard_message_overflow") {
    const id = action.block_id;
    const message_ts = body.message?.ts || "";

    try {
      // Delete the draft from the 'drafts' Datstore
      const deleteResp = await client.apps.datastore.delete({
        datastore: DraftDatastore.name,
        id: id,
      });

      // If the DELETE datastore record operation fails, throw an error
      if (!deleteResp.ok) {
        const deleteDraftErrorMsg =
          `Error deleting draft with id ${id}. Contact the app maintainers with the following - (Error detail: ${deleteResp.error})`;
        throw new Error(deleteDraftErrorMsg);
      }

      // If message_ts isn't empty, Delete the draft message from the Draft Channel
      if (message_ts) {
        const updateResp = await client.chat.delete({
          channel: inputs.channel,
          ts: message_ts,
        });

        // If the DELETE message operation fails, throw an error
        if (!updateResp.ok) {
          const updateDraftPreviewErrorMsg =
            `Error deleting the draft message: ${message_ts} in channel ${inputs.channel}. Contact the app maintainers with the following - (Error detail: ${updateResp.error})`;
          throw new Error(updateDraftPreviewErrorMsg);
        }
      }
      // If the DELETE datastore record or Slack Message operations fail, log the error and complete the function with an error
    } catch (error) {
      console.error(error);

      await client.functions.completeError({
        function_execution_id: body.function_data.execution_id,
        error: "Error discarding draft",
      });
    }
  }
};

export const saveDraftEditSubmission: ViewSubmissionHandler<
  typeof CreateDraftFunction.definition
> = async (
  { inputs, view, client },
) => {
  // Get the datastore draft ID from the modal's private metadata
  const { id, thread_ts } = JSON.parse(view.private_metadata || "");

  const message = view.state.values.message_block.message_input.value;

  // Update the saved message
  const putResp = await client.apps.datastore.update({
    datastore: DraftDatastore.name,
    item: {
      id: id,
      message: message,
    },
  });

  if (!putResp.ok) {
    const updateDraftMessageErrorMsg =
      `Error updating draft ${id} message. Contact the app maintainers with the following - (Error detail: ${putResp.error})`;
    console.log(updateDraftMessageErrorMsg);
    return;
  }

  // build the updated message
  const blocks = buildDraftBlocks(
    id,
    inputs.created_by,
    message,
    inputs.channels,
  );

  // update the edited draft message
  const updateResp = await client.chat.update({
    channel: inputs.channel,
    ts: thread_ts,
    blocks: blocks,
  });

  if (!updateResp.ok) {
    const updateDraftPreviewErrorMsg =
      `Error updating message: ${thread_ts} in channel ${inputs.channel}. Contact the app maintainers with the following - (Error detail: ${updateResp.error})`;
    console.log(updateDraftPreviewErrorMsg);
  }
};

export const confirmAnnouncementForSend: BlockActionHandler<
  typeof CreateDraftFunction.definition
> = async (
  { inputs, body, action, client },
) => {
  const id = action.block_id;

  const view = buildConfirmSendModal(id, inputs.channels);

  await client.views.open({
    interactivity_pointer: body.interactivity.interactivity_pointer,
    view: view,
  });
};

export const prepareSendAnnouncement: ViewSubmissionHandler<
  typeof CreateDraftFunction.definition
> = async ({ body, view, client }) => {
  // Get the datastore draft ID from the modal's private metadata
  const { id } = JSON.parse(view.private_metadata || "");

  // Fetch latest version of the message from the datastore
  const getResp = await client.apps.datastore.get<
    typeof DraftDatastore.definition
  >(
    {
      datastore: DraftDatastore.name,
      id: id,
    },
  );

  if (!getResp.ok) {
    const draftGetErrorMsg =
      `Failed to fetch draft announcement id: ${id} for send. Contact the app maintainers with the following - (Error detail: ${getResp.error})`;
    console.log(draftGetErrorMsg);
    return;
  }

  const { item } = getResp;

  // Build function outputs
  const outputs = {
    message: item.message,
    message_ts: item.message_ts,
    draft_id: id,
  };

  // Complete function so workflow can continue to next step which
  // sends the announcement
  const complete = await client.functions.completeSuccess({
    function_execution_id: body.function_data.execution_id,
    outputs,
  });

  if (!complete.ok) {
    console.error("Error completing function", complete);

    await client.functions.completeError({
      function_execution_id: body.function_data.execution_id,
      error: "Error completing function",
    });
  }
};

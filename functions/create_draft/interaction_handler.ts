import { buildEditModal, buildDraftBlocks, buildConfirmSendModal } from "./blocks.ts";


/**
 * These interaction handlers are registered on a Slack Function and 
 * are intended to handler user interaction with our announcement draft
 * edit and send buttons
 * 
 * More on handling Block Kit actions and views interactivity here:
 * https://api.slack.com/future/block-events  
 */

export const OpenDraftEditView = async ({ body, action, client }) => {
  if (action.selected_option.value == "edit_message_overflow") {

    const id = action.block_id;

    // Get the draft 
    let editModalView;
    try {
      const { item } = await client.apps.datastore.get<
        typeof drafts.definition
      >(
        {
          datastore: "drafts",
          id: id,
        },
      );

      // Prepare the draft edit view
      editModalView = buildEditModal(
        id,
        item.message,
        body.message?.ts || "",
        body.user.team_id,
      );
    } catch (error) {
      const draftGetErrorMsg = `Error getting draft with id ${id}. Error detail: ${error}`;
      console.log(draftGetErrorMsg);

      await client.functions.completeError({
        function_execution_id: body.function_data.execution_id,
        error: draftGetErrorMsg,
      });
    }

    // Open the draft edit modal view
    try {
      await client.views.open({
        interactivity_pointer: body.interactivity.interactivity_pointer,
        view: editModalView,
      });
    } catch (error) {
      const draftEditModalErrorMsg = `Error opening up the draft edit modal view. Error detail ${error}`;
      console.log(draftEditModalErrorMsg);
     
      await client.functions.completeError({
        function_execution_id: body.function_data.execution_id,
        error: draftEditModalErrorMsg,
      });
    }
  }
};

export const SaveDraftEditSubmission = async ({ inputs, view, client, body }) => {

  // Get the datastore draft ID from the modal's private metadata
  const { id, thread_ts } = JSON.parse(view.private_metadata || "");

  const message = view.state.values.message_block.message_input.value;

  // Update the message with the updated message
  try {
    await client.apps.datastore.put({
      datastore: "drafts",
      item: {
        id: id,
        message: message,
      },
    });
  } catch (error) {
    const updateDraftMessageErrorMsg = `Error updating draft ${id} message. Error detail ${error}`;
    console.log(updateDraftMessageErrorMsg);

    await client.functions.completeError({
      function_execution_id: body.function_data.execution_id,
      error: updateDraftMessageErrorMsg,
    });
  }

  const blocks = buildDraftBlocks(
    id,
    inputs.created_by,
    message,
    inputs.channels,
  );

  try {
    await client.chat.update({
      channel: inputs.channel,
      ts: thread_ts,
      blocks: blocks,
    });
  } catch (error) {
    const updateDraftPreviewErrorMsg = `Error updating message: ${ts} in channel ${inputs.channel}. Error detail: ${error}`;
    console.log(updateDraftPreviewErrorMsg)

    await client.functions.completeError({
      function_execution_id: body.function_data.execution_id,
      error: updateDraftPreviewErrorMsg,
    });
  }
};

export const ConfirmAnnouncementForSend = async ({ inputs, body, action, client }) => {
  const id = action.block_id;

  const view = buildConfirmSendModal(id, inputs.channels);

  await client.views.open({
    interactivity_pointer: body.interactivity.interactivity_pointer,
    view: view,
  });
};

export const SendAnnouncement =  async ({ body, view, client }) => {
  // Get the datastore draft ID from the modal's private metadata
  const { id } = JSON.parse(view.private_metadata || "");

  // Fetch latest version of the message from the datastore
  try {
    const { item } = await client.apps.datastore.get<
      typeof drafts.definition
    >(
      {
        datastore: "drafts",
        id: id,
      },
    );

    const outputs = {
      message: item.message,
      message_ts: item.message_ts,
      draft_id: id,
    };

    // Complete function so workflow can continue
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
  
  } catch (error) {
    const draftGetErrorMsg = `Failed to fetch draft announcement id: ${id} for send. Error detail ${error}`;
    console.log(draftGetErrorMsg);

    await client.functions.completeError({
      function_execution_id: body.function_data.execution_id,
      error: draftGetErrorMsg
    })
  }
};
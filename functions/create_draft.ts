import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { SlackAPI } from "deno-slack-api/mod.ts";

import drafts from "../datastores/drafts.ts";

import { buildConfirmSendModal } from "../views/confirm_send_modal.ts";
import { buildDraftBlocks } from "../views/draft_blocks.ts";
import { buildEditModal } from "../views/edit_modal.ts";

import { ChatPostMessageParams, DraftStatus } from "../lib/helper.ts";

export const createDraft = DefineFunction({
  callback_id: "create_draft",
  title: "Create a draft announcement",
  description:
    "Sends an announcement draft to channel for review before sending",
  source_file: "functions/create_draft.ts",
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

export default SlackFunction(
  createDraft,
  async ({ inputs, token }) => {
    const client = SlackAPI(token, {});

    const id = crypto.randomUUID();

    await client.apps.datastore.put<typeof drafts.definition>({
      datastore: "drafts",
      //@ts-ignore expecting fix
      item: {
        id: id,
        created_by: inputs.created_by,
        message: inputs.message,
        channels: inputs.channels,
        channel: inputs.channel,
        icon: inputs.icon,
        username: inputs.username,
        status: DraftStatus.Draft,
      },
    });

    const blocks = buildDraftBlocks(
      id,
      inputs.created_by,
      inputs.message,
      inputs.channels,
    );

    const params = {
      channel: inputs.channel,
      blocks: blocks,
      text: `An announcement draft was posted`,
    } as ChatPostMessageParams;

    if (inputs.icon) {
      params.icon_emoji = inputs.icon;
    }

    if (inputs.username) {
      params.username = inputs.username;
    }

    const postDraft = await client.chat.postMessage(params);

    // Update datastore with the timestamp of the draft message
    await client.apps.datastore.put<typeof drafts.definition>({
      datastore: "drafts",
      //@ts-expect-error expecting fix
      item: {
        id: id,
        message_ts: postDraft.ts,
      },
    });

    // Pause function to wait for any interactions
    return { completed: false };
  },
)
  .addBlockActionsHandler(
    "preview_overflow",
    async ({ token, body, action }) => {
      if (action.selected_option.value == "edit_message_overflow") {
        const client = SlackAPI(token, {});
        const id = action.block_id;

        const { item } = await client.apps.datastore.get<
          typeof drafts.definition
        >(
          {
            datastore: "drafts",
            id: id,
          },
        );

        const view = buildEditModal(
          id,
          item.message,
          body.message?.ts || "",
          body.user.team_id,
        );

        await client.views.open({
          trigger_id: body.interactivity.interactivity_pointer,
          view: view,
        });
      }
    },
  )
  .addViewSubmissionHandler(
    "edit_message_modal",
    async ({ token, inputs, view }) => {
      const client = SlackAPI(token, {});

      // Get the datastore draft ID from the modal's private metadata
      const { id, thread_ts } = JSON.parse(view.private_metadata || "");

      const message = view.state.values.message_block.message_input.value;

      await client.apps.datastore.put({
        datastore: "drafts",
        item: {
          id: id,
          message: message,
        },
      });

      const blocks = buildDraftBlocks(
        id,
        inputs.created_by,
        message,
        inputs.channels,
      );

      await client.chat.update({
        channel: inputs.channel,
        ts: thread_ts,
        blocks: blocks,
      });
    },
  )
  .addBlockActionsHandler(
    "send_button",
    async ({ token, inputs, body, action }) => {
      const client = SlackAPI(token, {});

      const id = action.block_id;

      const view = buildConfirmSendModal(id, inputs.channels);

      await client.views.open({
        trigger_id: body.interactivity.interactivity_pointer,
        view: view,
      });
    },
  ).addViewSubmissionHandler(
    "confirm_send_modal",
    async ({ token, body, view }) => {
      const client = SlackAPI(token, {});

      // Get the datastore draft ID from the modal's private metadata
      const { id } = JSON.parse(view.private_metadata || "");

      // Fetch latest version of the message from the datastore
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
    },
  );

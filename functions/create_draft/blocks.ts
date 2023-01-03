import {
  Block,
  KnownBlock,
  ModalView,
} from "https://cdn.skypack.dev/@slack/types?dts";

import {
  dividerBlock,
  mrkdwnSectionBlock,
} from "../send_announcement/blocks.ts";
import { contextBlock, mrkdwnElement } from "../post_summary/blocks.ts";

/**
 * These are helper utilities that assemble Block Kit block
 * payloads needed for this CreateDraft function
 *
 * For more on Block Kit, see: https://api.slack.com/block-kit
 *
 * Check out Block Kit Builder: https://app.slack.com/block-kit-builder
 */

export const buildDraftBlocks = (
  draft_id: string,
  created_by: string,
  message: string,
  channels: string[],
): (KnownBlock | Block)[] => {
  let draftBlocks = [];

  const initialBlocks = [
    mrkdwnSectionBlock(
      `:pencil: *This announcement has NOT been sent*\n*Created by:* <@${created_by}>\n*Send to:* <#${
        channels.join(">, <#")
      }>`,
    ),
    {
      "type": "actions",
      "block_id": `${draft_id}`,
      "elements": [
        {
          "type": "button",
          "style": "primary",
          "text": {
            "type": "plain_text",
            "text": "Send announcement",
          },
          "value": `send`,
          "action_id": "send_button",
        },
        {
          "type": "overflow",
          "options": [
            {
              "text": {
                "type": "plain_text",
                "text": "Edit the draft message",
              },
              "value": "edit_message_overflow",
            },
          ],
          "action_id": "preview_overflow",
        },
      ],
    },
    dividerBlock(),
    contextBlock(mrkdwnElement("`Begin draft`")),
  ];

  try {
    // If this succeeds, input message is likely blocks
    const { blocks } = JSON.parse(message);
    draftBlocks = initialBlocks.concat(blocks);
  } catch (_error) {
    // If there was a JSON parsing error, input message likely just plain text
    draftBlocks = initialBlocks.concat([mrkdwnSectionBlock(message)]);
  }

  draftBlocks.push(
    contextBlock(mrkdwnElement("`End draft`")),
  );

  return draftBlocks;
};

export const buildEditModal = (
  id: string,
  message: string,
  thread_ts: string,
  teamId: string,
): ModalView => {
  const blocks = [];

  try {
    // If this succeeds, input message is likely blocks
    // so we can add Block Kit Builder link to help edit the content
    const _message_blocks = JSON.parse(message);
    const encodedPayload = encodeURIComponent(message);
    const builderLink = getBuilderLink(teamId, encodedPayload);
    const helpText =
      `Need help editing these blocks? \n Click <${builderLink}|here> to view in the interactive Block Kit Builder. When finished editing, click the *Copy Payload* button in the builder and replace the entire contents of the message below.`;
    blocks.push(
      contextBlock(mrkdwnElement(helpText)),
    );
  } catch (_error) {
    // Otherwise treat input message as text string
    const messageAsSectionBlock = {
      "blocks": [
        mrkdwnSectionBlock(message),
      ],
    };
    const encodedPayload = encodeURIComponent(
      JSON.stringify(messageAsSectionBlock),
    );
    const builderLink = getBuilderLink(teamId, encodedPayload);
    const helpText =
      `Pro tip: You can copy and paste from <${builderLink}|Block Kit Builder> to create a super-formatted announcement. When finished editing, click the *Copy Payload* button in the builder and replace the entire contents of the message below.`;
    blocks.push(
      contextBlock(mrkdwnElement(helpText)),
    );
  }

  blocks.push({
    "type": "input",
    "block_id": "message_block",
    "element": {
      "type": "plain_text_input",
      "multiline": true,
      "action_id": "message_input",
      "initial_value": message,
    },
    "label": {
      "type": "plain_text",
      "text": "Message",
      "emoji": true,
    },
  });

  const view: ModalView = {
    "type": "modal",
    "callback_id": "edit_message_modal",
    "private_metadata": JSON.stringify({
      id: id,
      thread_ts: thread_ts,
    }),
    "title": {
      "type": "plain_text",
      "text": "Edit the draft message",
    },
    "submit": {
      "type": "plain_text",
      "text": "Save",
    },
    "close": {
      "type": "plain_text",
      "text": "Cancel",
    },
    "blocks": blocks,
  };

  return view;
};

export const buildConfirmSendModal = (
  id: string,
  channels: string[],
): ModalView => {
  const view: ModalView = {
    "type": "modal",
    "callback_id": "confirm_send_modal",
    "private_metadata": JSON.stringify({
      id: id,
    }),
    "title": {
      "type": "plain_text",
      "text": "Send your announcement",
    },
    "submit": {
      "type": "plain_text",
      "text": "Send it",
    },
    "close": {
      "type": "plain_text",
      "text": "Keep editing",
    },
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text":
            `*Are you sure you want to send this announcement?* This cannot be undone!`,
        },
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text":
            `_The announcement will be posted to the following channels:_\n<#${
              channels.join(">, <#")
            }>`,
        },
      },
    ],
  };

  return view;
};

// Helpers
export function getBuilderLink(teamId: string, payload: string) {
  return `https://app.slack.com/block-kit-builder/${teamId}#${payload}`;
}

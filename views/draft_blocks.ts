import { Block } from "https://cdn.skypack.dev/@slack/types?dts";

export const buildDraftBlocks = (
  draft_id: string,
  created_by: string,
  message: string,
  channels: string[],
) => {
  let draftBlocks = [];

  const initial_blocks = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text":
          `:pencil: *This announcement has NOT been sent*\n*Created by:* <@${created_by}>\n*Send to:* <#${
            channels.join(">, <#")
          }>`,
      },
    },
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
    {
      "type": "divider",
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "`Begin draft`",
        },
      ],
    },
  ] as Block[];

  try {
    // If this succeeds, input message is likely blocks
    const { blocks } = JSON.parse(message);
    draftBlocks = initial_blocks.concat(blocks);
  } catch (_error) {
    // If there was a JSON parsing error, input message likely just plain text
    draftBlocks = initial_blocks.concat([{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": message,
      },
    }]);
  }

  draftBlocks.push(
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "`End draft`",
        },
      ],
    },
  );

  return draftBlocks;
};

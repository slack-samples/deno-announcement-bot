export const renderEditModal = (
  id: string,
  message: string,
  thread_ts: string,
  teamId: string,
) => {
  const blocks = [];

  try {
    // If this succeeds, input message is likely blocks
    // so we can add Block Kit Builder link to help edit the content
    const _message_blocks = JSON.parse(message);
    const encodedPayload = encodeURIComponent(message);
    const builderLink =
      `https://app.slack.com/block-kit-builder/${teamId}#${encodedPayload}`;
    blocks.push({
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text":
            `Need help editing these blocks? Click <${builderLink}|here> to open the Block Kit Builder. When finished editing, click the *Copy Payload* button in the builder and replace the entire contents of the message below.`,
        },
      ],
    });
  } catch (_error) {
    const messageAsSectionBlock = {
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": message,
          },
        },
      ],
    };
    const encodedPayload = encodeURIComponent(
      JSON.stringify(messageAsSectionBlock),
    );
    const builderLink =
      `https://app.slack.com/block-kit-builder/${teamId}#${encodedPayload}`;
    blocks.push({
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text":
            `Pro tip: You can copy and paste from <${builderLink}|Block Kit Builder> to create a super-formatted announcement. When finished editing, click the *Copy Payload* button in the builder and replace the entire contents of the message below.`,
        },
      ],
    });
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

  const view = {
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

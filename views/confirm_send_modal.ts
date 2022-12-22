export const buildConfirmSendModal = (
  id: string,
  channels: string[],
) => {
  const view = {
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

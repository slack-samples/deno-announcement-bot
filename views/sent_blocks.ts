export const buildSentBlocks = (
  created_by: string,
  message: string,
  channels: string[],
) => {
  let sentBlocks = [];

  const initial_blocks = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text":
          `:white_check_mark: *This announcement was sent*\n*Created by:* <@${created_by}>\n*Sent to:* <#${
            channels.join(">, <#")
          }>`,
      },
    },
    {
      "type": "divider",
    },
  ] as Block[];

  try {
    // If this succeeds, input message is likely blocks
    const { blocks } = JSON.parse(message);
    sentBlocks = initial_blocks.concat(blocks);
  } catch (_error) {
    // If there was a JSON parsing error, input message likely just plain text
    sentBlocks = initial_blocks.concat([{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": message,
      },
    }]);
  }

  return sentBlocks;
};

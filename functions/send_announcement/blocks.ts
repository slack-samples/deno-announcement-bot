/**
 * These are helper utilities that assemble Block Kit block
 * payloads needed for this SendAnnouncement function
 * 
 * For more on Block Kit, see: https://api.slack.com/block-kit
 * 
 * Check out Block Kit Builder: https://app.slack.com/block-kit-builder
*/

export const buildAnnouncementBlocks = (
  message: string,
) => {
  let blocks = [];

  try {
    // If this succeeds, input message is likely blocks
    blocks = JSON.parse(message).blocks;
  } catch (_error) {
    // If there was a JSON parsing error, input message likely just plain text
    blocks = [{
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": message,
      },
    }];
  }

  return blocks;
};

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
    // deno-lint-ignore no-explicit-any
  ] as any[];

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

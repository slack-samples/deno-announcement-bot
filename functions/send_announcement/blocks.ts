import type {
  Block,
  DividerBlock,
  KnownBlock,
  SectionBlock,
} from "@slack/types";
/**
 * These are helper utilities that assemble Block Kit block
 * payloads needed for this prepareSendAnnouncement function
 *
 * For more on Block Kit, see: https://api.slack.com/block-kit
 *
 * Check out Block Kit Builder: https://app.slack.com/block-kit-builder
 */
export const buildAnnouncementBlocks = (
  message: string,
): KnownBlock[] => {
  let blocks = [];

  try {
    // If this succeeds, input message is likely blocks
    blocks = JSON.parse(message).blocks;
  } catch (_error) {
    // If there was a JSON parsing error, input message likely just plain text
    blocks = [mrkdwnSectionBlock(message)];
  }

  return blocks;
};

export const buildSentBlocks = (
  created_by: string,
  message: string,
  channels: string[],
): (KnownBlock | Block)[] => {
  let sentBlocks = [];
  const initialText =
    `:white_check_mark: *This announcement was sent*\n*Created by:* <@${created_by}>\n*Sent to:* <#${
      channels.join(">, <#")
    }>`;
  const initialBlocks = [
    mrkdwnSectionBlock(initialText),
    dividerBlock(),
  ];

  try {
    // If this succeeds, inputted message argument is likely Block Kit blocks
    const { blocks } = JSON.parse(message);

    sentBlocks = initialBlocks.concat(blocks);
  } catch (_error) {
    // If there was a JSON parsing error, input message likely just plain text
    sentBlocks = initialBlocks.concat([mrkdwnSectionBlock(message)]);
  }

  return sentBlocks;
};

// Helpers
export function mrkdwnSectionBlock(message: string): SectionBlock {
  return {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": message,
    },
  };
}

export function dividerBlock(): DividerBlock {
  return {
    "type": "divider",
  };
}

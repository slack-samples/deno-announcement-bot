import { AnnouncementType } from "./types.ts";
import {
  Block,
  ContextBlock,
  KnownBlock,
  MrkdwnElement,
} from "https://cdn.skypack.dev/@slack/types?dts";

// There is a Slack API limit of 50 blocks in a single message payload
export const MAX_BLOCKS_LENGTH = 50;
export const SUCCESS_MATCHER = ":white_check_mark:";
export const ERROR_MATCHER = ":no_entry:";

/**
 * These are helper utilities that assemble Block Kit block
 * payloads needed for this PostSummary function
 *
 * For more on Block Kit, see: https://api.slack.com/block-kit
 *
 * Check out Block Kit Builder: https://app.slack.com/block-kit-builder
 */
export const buildSummaryBlocks = (
  announcementSummaries: AnnouncementType[],
): (KnownBlock | Block)[] => {
  // add header summary block
  const blocks: KnownBlock[] = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*Summary:*`,
      },
    },
  ];

  // loop through summaries
  for (const announcement of announcementSummaries) {
    // If we have reached max blocks length (minus 1) add a final block
    // telling users that some announcement links are being truncated
    if (blocks.length == MAX_BLOCKS_LENGTH - 1) {
      blocks.push(
        truncationBlock(),
      );
      break;
    }

    if (announcement.success) {
      const successMessage =
        `${SUCCESS_MATCHER} <${announcement.permalink}| Announcement> sent to <#${announcement.channel_id}>`;

      blocks.push(
        contextBlock(mrkdwnElement(successMessage)),
      );
    } else {
      const errorMessage =
        `${ERROR_MATCHER} \`${announcement.error}\` error sending to <#${announcement.channel_id}>`;

      blocks.push(
        contextBlock(mrkdwnElement(errorMessage)),
      );
    }
  }

  return blocks;
};

// Helpers
// deno-lint-ignore no-explicit-any
export function contextBlock(...elements: any): ContextBlock {
  return {
    "type": "context",
    "elements": elements,
  };
}

export function mrkdwnElement(text: string): MrkdwnElement {
  return {
    "type": "mrkdwn",
    "text": text,
  };
}

export function truncationBlock(): KnownBlock {
  return contextBlock(mrkdwnElement(".... and more"));
}

import { AnnouncementType } from "./types.ts";

/**
 * These are helper utilities that assemble Block Kit block
 * payloads needed for this PostSummary function
 * 
 * For more on Block Kit, see: https://api.slack.com/block-kit
 * 
 * Check out Block Kit Builder: https://app.slack.com/block-kit-builder
*/

export const buildSummaryMessage = (
  summaries: AnnouncementType[],
) => {
  //

  const blocks = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*Summary:*`,
      },
    },
  ] as any;

  for (const announcement of summaries) {
    // There is a limit of 50 blocks in a single message payload
    // Stop adding new announcements if we approach this limit
    // and tell users that some announcement links are being suppressed
    if (blocks.length >= 48) {
      blocks.push(
        {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text": `.... and more`,
            },
          ],
        },
      );
      break;
    }
    if (announcement.success) {
      blocks.push(
        {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text":
                `:white_check_mark: <${announcement.permalink}| Announcement> sent to <#${announcement.channel_id}>`,
            },
          ],
        },
      );
    } else {
      blocks.push(
        {
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text":
                `:no_entry: \`${announcement.error}\` error sending to <#${announcement.channel_id}>`,
            },
          ],
        },
      );
    }
  }

  return blocks;
};

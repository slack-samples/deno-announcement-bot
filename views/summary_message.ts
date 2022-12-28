import { AnnouncementType } from "../lib/helper.ts";
import { SectionBlock } from "https://cdn.skypack.dev/@slack/types?dts";

export const buildSummaryMessage = (
  summaries: AnnouncementType[],
) => {

  const blocks: SectionBlock = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*Summary:*`,
      },
    },
  ];

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

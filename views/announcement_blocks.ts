export const renderAnnouncementBlocks = (
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

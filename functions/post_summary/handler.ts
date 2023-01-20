import { SlackFunction } from "deno-slack-sdk/mod.ts";

import { buildSummaryBlocks } from "./blocks.ts";
import { PostSummaryFunctionDefinition } from "./definition.ts";

/**
 * This is the handling code for PostSummaryFunction. It will:
 * 1. Post a message in thread to the draft announcement message
 * with a summary of announcement's sent
 * 2. Complete this function with either required outputs or an error
 */
export default SlackFunction(
  PostSummaryFunctionDefinition,
  async ({ inputs, client }) => {
    const blocks = buildSummaryBlocks(inputs.announcements);

    // 1. Post a message in thread to the draft announcement message
    const postResp = await client.chat.postMessage({
      channel: inputs.channel,
      thread_ts: inputs.message_ts || "",
      blocks: blocks,
      unfurl_links: false,
    });
    if (!postResp.ok) {
      const summaryTS = postResp ? postResp.ts : "n/a";
      const postSummaryErrorMsg =
        `Error posting announcement send summary: ${summaryTS} to channel: ${inputs.channel}. Contact the app maintainers with the following - (Error detail: ${postResp.error})`;
      console.log(postSummaryErrorMsg);

      // 2. Complete function with an error message
      return { error: postSummaryErrorMsg };
    }

    const outputs = {
      channel: inputs.channel,
      message_ts: postResp.ts,
    };

    // 2. Complete function with outputs
    return { outputs: outputs };
  },
);

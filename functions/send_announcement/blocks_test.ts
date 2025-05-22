import { assertEquals } from "@std/assert";
import type { SectionBlock } from "@slack/types";
import {
  buildAnnouncementBlocks,
  buildSentBlocks,
  mrkdwnSectionBlock,
} from "./blocks.ts";

// Setup
const validJSONBlocks = [
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text":
        "Hello, Assistant to the Regional Manager Dwight! *Michael Scott* wants to know where you'd like to take the Paper Company investors to dinner tonight.\n\n *Please select a restaurant:*",
    },
  },
  {
    "type": "divider",
  },
];

//  valid
const validJSONStringMsg = JSON.stringify({
  "blocks": validJSONBlocks,
});

// invalid
const invalidSuffix = "badEndingCharacters";
const invalidJSONStringMsg = validJSONStringMsg + invalidSuffix;

Deno.test("buildAnnouncementBlocks handles valid JSON string as blocks", () => {
  const announcementBlocks = buildAnnouncementBlocks(validJSONStringMsg);

  assertEquals(
    JSON.stringify(announcementBlocks),
    JSON.stringify(validJSONBlocks),
  );
});

Deno.test("buildAnnouncement handles invalid JSON string as string", () => {
  const announcementBlocks = buildAnnouncementBlocks(invalidJSONStringMsg);

  assertEquals(
    (announcementBlocks[0] as SectionBlock).text?.text,
    invalidJSONStringMsg,
  );
});

Deno.test("buildSentBlocks handles valid JSON string as blocks", () => {
  const sentBlocks = buildSentBlocks("dummyUserId", validJSONStringMsg, [
    "dummyChannelId",
  ]);

  assertEquals(
    JSON.stringify(sentBlocks.slice(2)), // sentBlocks gets additional initial blocks added as preface
    JSON.stringify(validJSONBlocks),
  );
});

Deno.test("buildSentBlocks handles invalid JSON string as string", () => {
  const sentBlocks = buildSentBlocks(
    "dummyUserId",
    invalidJSONStringMsg,
    ["dummyChannelId"],
  );

  assertEquals(
    JSON.stringify(sentBlocks[2]),
    JSON.stringify(mrkdwnSectionBlock(invalidJSONStringMsg)),
  );
});

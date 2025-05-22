import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";

import {
  buildSummaryBlocks,
  ERROR_MATCHER,
  MAX_BLOCKS_LENGTH,
  SUCCESS_MATCHER,
  truncationBlock,
} from "./blocks.ts";
import type { AnnouncementType } from "./types.ts";

// Setup
const mockAnnouncementSummariesSuccess: AnnouncementType[] = [
  {
    channel_id: "id1",
    success: true,
  },
];

const mockAnnouncementSummariesError: AnnouncementType[] = [
  {
    channel_id: "id1",
    success: false,
    error: "an error",
  },
];

const mockAnnouncementSummariesTooLarge: AnnouncementType[] = [...Array(50)]
  .map((_, _i) => {
    return {
      channel_id: "id",
      success: true,
    };
  });

Deno.test("handles when summary blocks might exceed Slack API max blocks limit", () => {
  const summaryBlocks = buildSummaryBlocks(mockAnnouncementSummariesTooLarge);

  assertEquals(
    summaryBlocks.length,
    MAX_BLOCKS_LENGTH,
  );

  // last element should contain truncation block
  assertEquals(
    JSON.stringify(summaryBlocks.pop()),
    JSON.stringify(truncationBlock()),
  );
});

Deno.test("outputs a summary with success message when summary contains success: true", () => {
  const shouldHaveSuccessSummary = buildSummaryBlocks(
    mockAnnouncementSummariesSuccess,
  );

  assertEquals(
    RegExp(SUCCESS_MATCHER).test(JSON.stringify(shouldHaveSuccessSummary)),
    true,
  );
});

Deno.test("outputs a summary with error message when summary contains success: false", () => {
  const shouldHaveErrorSummary = buildSummaryBlocks(
    mockAnnouncementSummariesError,
  );

  assertEquals(
    RegExp(ERROR_MATCHER).test(JSON.stringify(shouldHaveErrorSummary)),
    true,
  );
});

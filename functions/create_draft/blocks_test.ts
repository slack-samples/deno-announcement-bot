import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import { ModalView } from "https://cdn.skypack.dev/@slack/types?dts";

import { buildEditModal } from "./blocks.ts";

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

const validJSONStringMsg = JSON.stringify(validJSONBlocks);

// invalid
const invalidSuffix = "badEndingCharacters";
const invalidJSONStringMsg = validJSONStringMsg + invalidSuffix;

Deno.test("buildEditModal always outputs a context section with helper text", () => {
  let editModal: ModalView = buildEditModal(
    "",
    validJSONStringMsg,
    "",
    "",
  );

  // first element shoud contain a context section
  assertEquals(editModal.blocks[0]?.type, "context");

  editModal = buildEditModal(
    "",
    invalidJSONStringMsg,
    "",
    "",
  );

  // first element shoud contain a context section
  assertEquals(editModal.blocks[0]?.type, "context");
});

import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals, assertExists, assertFalse } from "@std/assert";
import { StubFetch, stubFetch } from "../../test_utils.ts";

import createDraft from "./handler.ts";
import { CREATE_DRAFT_FUNCTION_CALLBACK_ID } from "./definition.ts";

const { createContext } = SlackFunctionTester(
  CREATE_DRAFT_FUNCTION_CALLBACK_ID,
);

// Setup inputs based on function inputs and outputs in "./definition.ts"
const inputs = {
  created_by: "dummyUserId",
  message: "The content of the announcement",
  channel: "dummyChannelId",
  channels: ["id1", "id2"],
  icon: "icon.png",
  username: "dummyUser",
};

Deno.test("successfully posts an announcement draft and returns completed:false", async () => {
  const fetchStub = new StubFetch();

  // Mock Slack API method responses
  // successful datastore request
  fetchStub.stub({
    matches: (req) => {
      assertEquals(req.url, "https://slack.com/api/apps.datastore.put");
      assertEquals(req.method, "POST");
    },
    response: new Response(
      `{"ok": true}`,
      {
        status: 200,
      },
    ),
  });

  fetchStub.stub({
    matches: (req) => {
      assertEquals(req.url, "https://slack.com/api/apps.datastore.update");
      assertEquals(req.method, "POST");
    },
    response: new Response(
      `{"ok": true}`,
      {
        status: 200,
      },
    ),
  });

  // successful chat.postMessage
  fetchStub.stub({
    matches: (req) => {
      assertEquals(req.url, "https://slack.com/api/chat.postMessage");
      assertEquals(req.method, "POST");
    },
    response: new Response(
      `{"ok": true, "ts": "1671571811.846939"}`,
      {
        status: 200,
      },
    ),
  });

  try {
    const { completed } = await createDraft(createContext({ inputs }));

    // Function should return without error and complete === false
    assertExists(completed);
    assertFalse(completed);
  } finally {
    fetchStub.restore();
  }
});

Deno.test("returns an error if initial draft record in datastore fails (apps.datastore.put)", async () => {
  // Mock Slack API method responses
  // failed datastore request
  using _fetchStub = stubFetch({
    matches: (req) => {
      assertEquals(req.url, "https://slack.com/api/apps.datastore.put");
      assertEquals(req.method, "POST");
    },
    response: new Response(
      `{"ok": false}`,
      {
        status: 200,
      },
    ),
  });

  const { error } = await createDraft(createContext({ inputs }));
  assertExists(error);
});

Deno.test("returns an error if draft announcement fails to post (chat.postMessage)", async () => {
  // failed chat.postMessage
  using _fetchStub = stubFetch({
    matches: (req) => {
      assertEquals(req.url, "https://slack.com/api/apps.datastore.put");
      assertEquals(req.method, "POST");
    },
    response: new Response(
      `{"ok": false}`,
      {
        status: 200,
      },
    ),
  });
  const { error } = await createDraft(createContext({ inputs }));
  assertExists(error);
});

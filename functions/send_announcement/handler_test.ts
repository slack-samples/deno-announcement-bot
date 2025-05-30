import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "@std/assert";

import sendAnnouncement from "./handler.ts";
import { SEND_ANNOUNCEMENT_FUNCTION_CALLBACK_ID } from "./definition.ts";
import { stub } from "@std/testing/mock";

const { createContext } = SlackFunctionTester(
  SEND_ANNOUNCEMENT_FUNCTION_CALLBACK_ID,
);

Deno.test("run send announcement fn and return outputs", async () => {
  // Replace globalThis.fetch with the mocked copy
  using _fetchStub = stub(
    globalThis,
    "fetch",
    (url: string | URL | Request, options?: RequestInit) => {
      const req = url instanceof Request ? url : new Request(url, options);
      assertEquals(req.method, "POST");
      switch (req.url) {
        case "https://slack.com/api/chat.postMessage":
          return Promise.resolve(
            new Response(
              `{"ok": true, "ts": "1671571811.846939"}`,
              {
                status: 200,
              },
            ),
          );
        case "https://slack.com/api/chat.getPermalink":
          return Promise.resolve(
            new Response(
              `{"ok": true, "permalink": "https://my.slack.com/archives/C12345678/p1671571811846939"}`,
              {
                status: 200,
              },
            ),
          );
        case "https://slack.com/api/apps.datastore.put":
          /**
           * There are multiple requests to this endpoint in this fn.
           * It is called once for each item in the `inputs.channels` array
           * to create a record in the `announcements` datastore.
           *
           * Since the fn only uses the properties returned by the last request
           * to the `drafts` datastore in a subsequent line, that is the response
           * returned below. The Response properties of the PUT requests to the
           * `announcements` datastore do not matter for the sake of this test.
           */
          return Promise.resolve(
            new Response(
              `{"ok": true, "datastore": "drafts", "item": {"id": "82dfeed3-fde5-4183-b092-e1b2d77ca369", "created_by": "U12345678", "message": "_This_ is an *important* announcement!", "channels": "['C12345678']", "channel": "C87654321", "message_ts": "1671571811.846939"}}`,
              {
                status: 200,
              },
            ),
          );
        case "https://slack.com/api/apps.datastore.update":
          return Promise.resolve(
            new Response(
              `{"ok": true, "item": {"created_by": "dummy"}}`,
              {
                status: 200,
              },
            ),
          );
        case "https://slack.com/api/chat.update":
          return Promise.resolve(
            new Response(
              `{"ok": true, "channel": "C87654321", "ts": "1671571811.846939"}`,
              {
                status: 200,
              },
            ),
          );
        default:
          throw Error(
            `No stub found for ${req.method} ${req.url}\nHeaders: ${
              JSON.stringify(Object.fromEntries(req.headers.entries()))
            }`,
          );
      }
    },
  );

  // based on function inputs and outputs in "./mod.ts"
  const inputs = {
    message: "_This_ is an *important* announcement!",
    channels: ["C12345678"],
    icon: ":robot_face:",
    username: "Testing",
    draft_id: "82dfeed3-fde5-4183-b092-e1b2d77ca369",
  };

  const { outputs } = await sendAnnouncement(createContext({ inputs }));
  assertEquals(
    outputs?.announcements,
    [{
      channel_id: "C12345678",
      success: true,
      permalink: "https://my.slack.com/archives/C12345678/p1671571811846939",
    }],
  );
});

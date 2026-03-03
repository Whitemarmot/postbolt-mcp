import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PostBoltClient } from "./client.js";

export function registerResources(server: McpServer, client: PostBoltClient) {
  server.resource("profile", "postbolt://profile", async (uri) => {
    const { data } = await client.getProfile();

    const text = [
      `Plan: ${data.plan}`,
      `Subscription: ${data.subscription_status}`,
      `Posts: ${data.posts_used_this_period} / ${data.posts_limit} used this period (${data.posts_remaining} remaining)`,
      `Billing period start: ${data.billing_period_start}`,
      `Platforms allowed: ${data.platforms_allowed.join(", ")}`,
      `Webhooks allowed: ${data.webhooks_allowed}`,
      "",
      `Connected accounts:`,
      ...data.connected_accounts.map(
        (a) => `  - ${a.platform}: ${a.account_name} (${a.account_type})`
      ),
    ].join("\n");

    return { contents: [{ uri: uri.href, mimeType: "text/plain", text }] };
  });

  server.resource("accounts", "postbolt://accounts", async (uri) => {
    const { data } = await client.getAccounts();

    const text =
      data.length === 0
        ? "No connected accounts. Connect accounts at https://postbolt.dev/accounts"
        : data
            .map(
              (a) =>
                `[${a.id}] ${a.platform} - ${a.account_name} (${a.account_type}) [${a.status}]`
            )
            .join("\n");

    return { contents: [{ uri: uri.href, mimeType: "text/plain", text }] };
  });
}

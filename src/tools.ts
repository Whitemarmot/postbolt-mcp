import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PostBoltClient } from "./client.js";
import { PLATFORMS, POST_STATUSES } from "./types.js";

export function registerTools(server: McpServer, client: PostBoltClient) {
  // --- publish_post ---
  server.tool(
    "publish_post",
    "Publish a post immediately to one or more social media platforms",
    {
      content: z.string().describe("The text content of the post"),
      platforms: z
        .array(z.enum(PLATFORMS))
        .min(1)
        .describe("Platforms to publish to"),
      media_id: z
        .number()
        .optional()
        .describe("ID of a previously uploaded media file"),
      custom_content: z
        .record(z.enum(PLATFORMS), z.string())
        .optional()
        .describe(
          "Platform-specific content overrides, e.g. { twitter: 'short version' }"
        ),
    },
    async (params) => {
      try {
        const { data } = await client.createPost({
          content: params.content,
          platforms: params.platforms,
          media_id: params.media_id,
          custom_content: params.custom_content,
        });

        const results = data.results
          .map((r) => `  ${r.platform}: ${r.status}`)
          .join("\n");

        return {
          content: [
            {
              type: "text" as const,
              text: `Post #${data.id} created (${data.status})\nPlatforms:\n${results}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            { type: "text" as const, text: `Error: ${(err as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );

  // --- schedule_post ---
  server.tool(
    "schedule_post",
    "Schedule a post for future publication",
    {
      content: z.string().describe("The text content of the post"),
      platforms: z
        .array(z.enum(PLATFORMS))
        .min(1)
        .describe("Platforms to publish to"),
      scheduled_for: z
        .string()
        .describe("ISO 8601 datetime for when to publish (must be in the future)"),
      media_id: z
        .number()
        .optional()
        .describe("ID of a previously uploaded media file"),
      custom_content: z
        .record(z.enum(PLATFORMS), z.string())
        .optional()
        .describe("Platform-specific content overrides"),
    },
    async (params) => {
      try {
        const { data } = await client.createPost({
          content: params.content,
          platforms: params.platforms,
          scheduled_for: params.scheduled_for,
          media_id: params.media_id,
          custom_content: params.custom_content,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: `Post #${data.id} scheduled for ${data.scheduled_for}\nPlatforms: ${data.platforms.join(", ")}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            { type: "text" as const, text: `Error: ${(err as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );

  // --- list_posts ---
  server.tool(
    "list_posts",
    "List your posts with optional status filter",
    {
      page: z.number().optional().describe("Page number (default 1)"),
      status: z
        .enum(POST_STATUSES)
        .optional()
        .describe("Filter by post status"),
    },
    async (params) => {
      try {
        const res = await client.listPosts({
          page: params.page,
          status: params.status,
        });

        if (res.data.length === 0) {
          return {
            content: [{ type: "text" as const, text: "No posts found." }],
          };
        }

        const lines = res.data.map((p) => {
          const platforms = p.platforms.join(", ");
          const scheduled = p.scheduled_for
            ? ` (scheduled: ${p.scheduled_for})`
            : "";
          const contentPreview = p.content
            ? p.content.substring(0, 80) + (p.content.length > 80 ? "..." : "")
            : "(no content)";
          return `#${p.id} [${p.status}] ${platforms}${scheduled}\n  ${contentPreview}`;
        });

        const meta = res.meta;
        const footer = `\nPage ${meta.current_page}/${meta.last_page} (${meta.total} total)`;

        return {
          content: [
            { type: "text" as const, text: lines.join("\n\n") + footer },
          ],
        };
      } catch (err) {
        return {
          content: [
            { type: "text" as const, text: `Error: ${(err as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );

  // --- get_post ---
  server.tool(
    "get_post",
    "Get detailed information about a specific post",
    {
      post_id: z.number().describe("The post ID"),
    },
    async (params) => {
      try {
        const { data } = await client.getPost(params.post_id);

        const results = data.results
          .map((r) => {
            let line = `  ${r.platform} (${r.account_name}): ${r.status}`;
            if (r.platform_post_url) line += ` - ${r.platform_post_url}`;
            if (r.error_message) line += ` - Error: ${r.error_message}`;
            return line;
          })
          .join("\n");

        const parts = [
          `Post #${data.id}`,
          `Status: ${data.status}`,
          `Platforms: ${data.platforms.join(", ")}`,
        ];

        if (data.content) parts.push(`Content: ${data.content}`);
        if (data.custom_content) {
          parts.push(
            `Custom content: ${JSON.stringify(data.custom_content)}`
          );
        }
        if (data.scheduled_for)
          parts.push(`Scheduled for: ${data.scheduled_for}`);
        if (data.media_id) parts.push(`Media ID: ${data.media_id}`);
        parts.push(`Created: ${data.created_at}`);
        parts.push(`\nResults:\n${results}`);

        return {
          content: [{ type: "text" as const, text: parts.join("\n") }],
        };
      } catch (err) {
        return {
          content: [
            { type: "text" as const, text: `Error: ${(err as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );

  // --- update_post ---
  server.tool(
    "update_post",
    "Update a scheduled post (content, custom content, or scheduled time)",
    {
      post_id: z.number().describe("The post ID to update"),
      content: z.string().optional().describe("New text content"),
      custom_content: z
        .record(z.enum(PLATFORMS), z.string())
        .optional()
        .describe("New platform-specific content overrides"),
      scheduled_for: z
        .string()
        .optional()
        .describe("New ISO 8601 datetime"),
    },
    async (params) => {
      try {
        const { data } = await client.updatePost(params.post_id, {
          content: params.content,
          custom_content: params.custom_content,
          scheduled_for: params.scheduled_for,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: `Post #${data.id} updated. Status: ${data.status}${data.scheduled_for ? `, scheduled for ${data.scheduled_for}` : ""}`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            { type: "text" as const, text: `Error: ${(err as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );

  // --- cancel_post ---
  server.tool(
    "cancel_post",
    "Cancel a scheduled post (refunds your post quota)",
    {
      post_id: z.number().describe("The post ID to cancel"),
    },
    async (params) => {
      try {
        await client.cancelPost(params.post_id);

        return {
          content: [
            {
              type: "text" as const,
              text: `Post #${params.post_id} has been cancelled.`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            { type: "text" as const, text: `Error: ${(err as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );

  // --- upload_media ---
  server.tool(
    "upload_media",
    "Upload an image file to use with posts (JPEG, PNG, GIF, WebP, max 10MB)",
    {
      file_path: z
        .string()
        .describe("Absolute path to the image file on disk"),
    },
    async (params) => {
      try {
        const { data } = await client.uploadMedia(params.file_path);

        return {
          content: [
            {
              type: "text" as const,
              text: `Media uploaded: ID ${data.id}\nFilename: ${data.filename}\nType: ${data.mime_type}\nSize: ${(data.file_size / 1024).toFixed(1)} KB`,
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            { type: "text" as const, text: `Error: ${(err as Error).message}` },
          ],
          isError: true,
        };
      }
    }
  );
}

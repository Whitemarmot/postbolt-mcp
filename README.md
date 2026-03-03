# postbolt-mcp

MCP server for [PostBolt](https://postbolt.dev) - publish to social media from any AI agent.

This package lets MCP-compatible clients (Claude Desktop, Claude Code, Cursor, Windsurf) schedule and publish posts to 13+ social platforms through PostBolt's API with zero code.

## Setup

1. Get your API key at [postbolt.dev](https://postbolt.dev)

2. Add to your MCP client config:

```json
{
  "mcpServers": {
    "postbolt": {
      "command": "npx",
      "args": ["-y", "postbolt-mcp"],
      "env": {
        "POSTBOLT_API_KEY": "sk_..."
      }
    }
  }
}
```

**Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

**Claude Code**: `~/.claude/settings.json` under `mcpServers`

## Tools

### publish_post

Publish a post immediately to one or more platforms.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| content | string | yes | The text content |
| platforms | string[] | yes | Platforms to publish to |
| media_id | number | no | ID from upload_media |
| custom_content | object | no | Platform-specific overrides |

### schedule_post

Schedule a post for future publication.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| content | string | yes | The text content |
| platforms | string[] | yes | Platforms to publish to |
| scheduled_for | string | yes | ISO 8601 datetime |
| media_id | number | no | ID from upload_media |
| custom_content | object | no | Platform-specific overrides |

### list_posts

List your posts with optional filtering.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | no | Page number |
| status | string | no | Filter: pending, scheduled, published, partial, failed |

### get_post

Get detailed info about a post including per-platform results.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| post_id | number | yes | The post ID |

### update_post

Update a scheduled post's content or time.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| post_id | number | yes | The post ID |
| content | string | no | New text content |
| custom_content | object | no | New platform overrides |
| scheduled_for | string | no | New ISO 8601 datetime |

### cancel_post

Cancel a scheduled post (refunds your post quota).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| post_id | number | yes | The post ID |

### upload_media

Upload an image to attach to posts (JPEG, PNG, GIF, WebP, max 10MB).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file_path | string | yes | Absolute path to the image |

## Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Profile | postbolt://profile | Your plan, quota, and allowed platforms |
| Accounts | postbolt://accounts | Connected social media accounts |

## Supported Platforms

twitter, linkedin, facebook, instagram, threads, tiktok, pinterest, bluesky, telegram, youtube, reddit, google_business, snapchat

Platform availability depends on your PostBolt plan.

## Examples

**Publish to Twitter and LinkedIn:**
> "Post 'Just shipped v2.0!' to Twitter and LinkedIn"

**Schedule with platform-specific content:**
> "Schedule a post for tomorrow at 9am: 'Big news coming' on Twitter, 'We are excited to announce our latest update' on LinkedIn"

**Upload an image and post:**
> "Upload /tmp/screenshot.png and post it to Instagram with caption 'Check this out'"

## License

MIT

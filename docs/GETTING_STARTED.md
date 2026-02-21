# Getting Started with MCP Server Studio

## Your First MCP Server in 5 Minutes

### Step 1: Add a Tool

1. Click the **"Add Tool"** button in the top-left corner
2. Select **"Web Search"** from the dropdown menu
3. A tool node appears on the canvas

### Step 2: Configure the Tool

1. Click on the tool node you just created
2. A configuration panel slides in from the right
3. Edit the fields:
   - **Name:** "Web Search"
   - **Description:** "Search the web for information"
   - **Parameters:** Already has a `query` parameter (string, required)
4. Click **"Save Changes"**

### Step 3: Test Your Tool

1. Switch to the **"Test"** tab in the right panel
2. Type in the chat: `"search for TypeScript best practices"`
3. Press Enter or click Send
4. Watch the simulated MCP server respond with the tool call

### Step 4: View the Code

1. Switch to the **"Code"** tab
2. See the generated TypeScript MCP server code
3. Notice it includes:
   - MCP SDK imports
   - Server initialization
   - Tool registration
   - Handler implementation

### Step 5: Export

1. Click **"Export Server"** in the header
2. Watch the confetti celebration! 🎉
3. A file named `my-mcp-server.ts` downloads to your computer

---

## What's Next?

### Build Something Real

Try creating a multi-tool server:

1. **Add "File Read" tool** - reads local files
2. **Add "API Call" tool** - makes HTTP requests
3. **Test them together** - "read package.json and then call the API"

### Use the Exported Code

The generated TypeScript file is ready to use:

```bash
# Install dependencies
npm install @modelcontextprotocol/sdk

# Run your server
node my-mcp-server.ts
```

### Customize Further

Open the exported `.ts` file and:
- Add actual API calls
- Implement real file operations
- Connect to databases
- Add error handling
- Deploy to production

---

## Tips & Tricks

### Keyboard Shortcuts

- **Delete tool:** Select node → click Delete Tool button
- **Pan canvas:** Click and drag empty space
- **Zoom:** Mouse wheel or trackpad pinch

### Best Practices

1. **Name tools clearly** - Use descriptive names like "Fetch User Data"
2. **Document parameters** - Good descriptions help users understand what to pass
3. **Mark required fields** - Set `required: true` for essential parameters
4. **Test before export** - Use the Test tab to verify behavior

### Common Patterns

**Search Tool:**
```
Name: Search Documents
Parameters:
  - query (string, required)
  - limit (number, optional)
```

**CRUD Tool:**
```
Name: Create User
Parameters:
  - email (string, required)
  - name (string, required)
  - role (string, optional)
```

**API Tool:**
```
Name: Call External API
Parameters:
  - endpoint (string, required)
  - method (string, optional)
  - body (object, optional)
```

---

## Troubleshooting

### Tool node looks incomplete
- Make sure all parameters have names and descriptions
- Check for the ⚠️ warning icon

### Test doesn't work
- Verify you have at least one tool on the canvas
- Try keywords that match your tool name (e.g., "search" for "Web Search")

### Export button disabled
- You need at least one tool on the canvas to export

---

## Learn More

- [MCP Specification](https://modelcontextprotocol.io)
- [MCP SDK Docs](https://github.com/modelcontextprotocol/typescript-sdk)
- [Design Document](/docs/plans/2026-02-21-mcp-server-studio-design.md)

---

**Happy building! ⚡**

import { describe, it, expect } from "vitest";
import {
  generateV0Config,
  generateV0IntegrationCode,
  generateV0DeploymentDocs,
  generateV0Bundle,
} from "../v0Generator";
import { MCPServerConfig } from "../../types";

describe("v0Generator", () => {
  const mockConfig: MCPServerConfig = {
    name: "Test Server",
    version: "1.0.0",
    description: "A test MCP server",
    transport: "http",
    tools: [
      {
        id: "tool-1",
        name: "get_weather",
        description: "Get current weather",
        parameters: [
          {
            name: "location",
            type: "string",
            description: "City name",
            required: true,
          },
        ],
      },
    ],
    resources: [],
    prompts: [],
  };

  describe("generateV0Config", () => {
    it("generates valid v0 config with required fields", () => {
      const config = generateV0Config(mockConfig);
      
      expect(config).toHaveProperty("name");
      expect(config).toHaveProperty("url");
      expect(config).toHaveProperty("description");
      expect(config).toHaveProperty("auth");
    });

    it("uses server name in config", () => {
      const config = generateV0Config(mockConfig);
      
      expect(config.name).toBe("Test Server");
    });

    it("generates URL based on server name", () => {
      const config = generateV0Config(mockConfig);
      
      expect(config.url).toContain("test-server");
      expect(config.url).toMatch(/^https:\/\//);
    });

    it("includes server stats in description", () => {
      const config = generateV0Config(mockConfig);
      
      expect(config.description).toContain("1 tools");
      expect(config.description).toContain("0 resources");
      expect(config.description).toContain("0 prompts");
    });

    it("defaults auth to none", () => {
      const config = generateV0Config(mockConfig);
      
      expect(config.auth?.type).toBe("none");
    });

    it("handles missing server name", () => {
      const configWithoutName: MCPServerConfig = {
        ...mockConfig,
        name: "",
      };
      
      const config = generateV0Config(configWithoutName);
      
      expect(config.name).toBe("my-mcp-server");
    });
  });

  describe("generateV0IntegrationCode", () => {
    it("generates valid TypeScript code", () => {
      const code = generateV0IntegrationCode(mockConfig);
      
      expect(code).toContain('import { v0 } from "v0-sdk"');
      expect(code).toContain("v0.mcpServers.create");
      expect(code).toContain("v0.chats.create");
    });

    it("includes server name in code", () => {
      const code = generateV0IntegrationCode(mockConfig);
      
      expect(code).toContain("Test Server");
    });

    it("includes server URL", () => {
      const code = generateV0IntegrationCode(mockConfig);
      
      expect(code).toContain("https://");
      expect(code).toContain("test-server");
    });

    it("shows mcpServerIds array usage", () => {
      const code = generateV0IntegrationCode(mockConfig);
      
      expect(code).toContain("mcpServerIds: [server.id]");
    });
  });

  describe("generateV0DeploymentDocs", () => {
    it("generates markdown documentation", () => {
      const docs = generateV0DeploymentDocs(mockConfig);
      
      expect(docs).toContain("## Deploy to Vercel v0");
      expect(docs).toContain("### Quick Start");
      expect(docs).toContain("### Configuration");
      expect(docs).toContain("### Next Steps");
    });

    it("lists all tools with descriptions", () => {
      const docs = generateV0DeploymentDocs(mockConfig);
      
      expect(docs).toContain("get_weather");
      expect(docs).toContain("Get current weather");
    });

    it("includes deployment options", () => {
      const docs = generateV0DeploymentDocs(mockConfig);
      
      expect(docs).toContain("railway up");
      expect(docs).toContain("docker-compose up -d");
    });

    it("shows server stats", () => {
      const docs = generateV0DeploymentDocs(mockConfig);
      
      expect(docs).toContain("**Tools**: 1");
      expect(docs).toContain("**Resources**: 0");
      expect(docs).toContain("**Prompts**: 0");
    });

    it("includes v0 documentation links", () => {
      const docs = generateV0DeploymentDocs(mockConfig);
      
      expect(docs).toContain("v0.app/docs");
      expect(docs).toContain("modelcontextprotocol.io");
    });
  });

  describe("generateV0Bundle", () => {
    it("generates complete bundle with all components", () => {
      const bundle = generateV0Bundle(mockConfig);
      
      expect(bundle).toHaveProperty("config");
      expect(bundle).toHaveProperty("integrationCode");
      expect(bundle).toHaveProperty("readme");
      expect(bundle).toHaveProperty("quickstart");
    });

    it("includes valid config object", () => {
      const bundle = generateV0Bundle(mockConfig);
      
      expect(bundle.config).toHaveProperty("name");
      expect(bundle.config).toHaveProperty("url");
    });

    it("includes integration code", () => {
      const bundle = generateV0Bundle(mockConfig);
      
      expect(bundle.integrationCode).toContain("v0.mcpServers.create");
    });

    it("includes README documentation", () => {
      const bundle = generateV0Bundle(mockConfig);
      
      expect(bundle.readme).toContain("Deploy to Vercel v0");
    });

    it("includes quickstart guide", () => {
      const bundle = generateV0Bundle(mockConfig);
      
      expect(bundle.quickstart).toContain("Quick Start");
      expect(bundle.quickstart).toContain("Deploy Your Server");
      expect(bundle.quickstart).toContain("Register with v0");
      expect(bundle.quickstart).toContain("Test in v0 Chat");
    });

    it("lists deployment options in quickstart", () => {
      const bundle = generateV0Bundle(mockConfig);
      
      expect(bundle.quickstart).toContain("Railway");
      expect(bundle.quickstart).toContain("Docker");
      expect(bundle.quickstart).toContain("Node.js");
    });

    it("shows server details in quickstart", () => {
      const bundle = generateV0Bundle(mockConfig);
      
      expect(bundle.quickstart).toContain("**Server Details:**");
      expect(bundle.quickstart).toContain("Name: Test Server");
    });
  });
});

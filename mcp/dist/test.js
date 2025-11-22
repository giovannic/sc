import { SCClient } from "./client.js";
import * as Schemas from "./schemas.js";
/**
 * Mock fetch for testing without real SC server
 */
let mockFetchResponses = new Map();
function createMockFetch(responses) {
    return async (url, options) => {
        const key = `${options?.method || "GET"} ` + new URL(url).pathname;
        const response = responses.get(key);
        if (!response) {
            return new Response(JSON.stringify({ error: `Not mocked: ${key}` }), { status: 404 });
        }
        return new Response(JSON.stringify(response.body), {
            status: response.status,
            headers: { "Content-Type": "application/json" },
        });
    };
}
/**
 * Test suite for MCP server functionality
 */
export async function runTests() {
    console.log("Starting MCP server tests...\n");
    const testId = "550e8400-e29b-41d4-a716-446655440000";
    // Test 1: Schema validation
    console.log("Test 1: Validating schemas...");
    try {
        const contextEntry = Schemas.ContextEntrySchema.parse({
            id: testId,
            content: "Test content",
            timestamp: Date.now(),
        });
        console.log("✓ ContextEntry schema valid");
        const createReq = Schemas.CreateContextRequestSchema
            .parse({
            entries: [{ content: "Initial entry" }],
            readme: "Test README",
        });
        console.log("✓ CreateContextRequest schema valid");
        const listResp = Schemas.ListContextsResponseSchema
            .parse({
            contexts: [
                {
                    id: testId,
                    uri: `context://${testId}`,
                    readme: "Test README",
                },
            ],
            total: 1,
        });
        console.log("✓ ListContextsResponse schema valid");
    }
    catch (error) {
        console.log("✗ Schema validation failed:", error);
        return;
    }
    // Test 2: Mock API responses
    console.log("\nTest 2: Testing mocked API responses...");
    mockFetchResponses.set("POST /contexts", {
        status: 201,
        body: {
            contextId: testId,
            uri: `context://${testId}`,
        },
    });
    mockFetchResponses.set("GET /contexts", {
        status: 200,
        body: {
            contexts: [
                {
                    id: testId,
                    uri: `context://${testId}`,
                    readme: "Test context",
                },
            ],
            total: 1,
        },
    });
    mockFetchResponses.set(`GET /contexts/${testId}/context`, {
        status: 200,
        body: {
            entries: [
                {
                    id: testId,
                    content: "First entry",
                    timestamp: Date.now(),
                },
            ],
            total: 1,
        },
    });
    mockFetchResponses.set(`GET /contexts/${testId}/readme`, {
        status: 200,
        body: {
            readme: "# Test Context\n\nThis is a test",
        },
    });
    mockFetchResponses.set(`PUT /contexts/${testId}/readme`, {
        status: 200,
        body: { success: true },
    });
    mockFetchResponses.set(`POST /contexts/${testId}/context`, {
        status: 201,
        body: {
            id: testId,
            timestamp: Date.now(),
        },
    });
    // Create mocked client
    const originalFetch = global.fetch;
    const mockFetch = createMockFetch(mockFetchResponses);
    global.fetch = mockFetch;
    const client = new SCClient("http://localhost:3000");
    try {
        // Test listContexts
        const contexts = await client.listContexts();
        if (contexts.contexts.length === 1 &&
            contexts.total === 1) {
            console.log("✓ listContexts works with mock");
        }
        else {
            console.log("✗ listContexts returned unexpected data");
        }
        // Test createContext
        const created = await client.createContext({
            entries: [{ content: "Entry 1" }],
            readme: "Test",
        });
        if (created.contextId === testId) {
            console.log("✓ createContext works with mock");
        }
        else {
            console.log("✗ createContext returned wrong ID");
        }
        // Test getContext
        const entries = await client.getContext(testId);
        if (entries.entries.length === 1) {
            console.log("✓ getContext works with mock");
        }
        else {
            console.log("✗ getContext returned wrong entries");
        }
        // Test getReadme
        const readme = await client.getReadme(testId);
        if (readme.readme?.includes("Test Context")) {
            console.log("✓ getReadme works with mock");
        }
        else {
            console.log("✗ getReadme returned wrong data");
        }
        // Test updateReadme
        const updated = await client.updateReadme(testId, "Updated");
        if (updated.success) {
            console.log("✓ updateReadme works with mock");
        }
        else {
            console.log("✗ updateReadme failed");
        }
        // Test addEntry
        const entry = await client.addEntry(testId, "New entry");
        if (entry.id === testId) {
            console.log("✓ addEntry works with mock");
        }
        else {
            console.log("✗ addEntry returned wrong ID");
        }
    }
    catch (error) {
        console.log("✗ API test failed:", error);
    }
    finally {
        global.fetch = originalFetch;
    }
    // Test 3: Error handling
    console.log("\nTest 3: Testing error handling...");
    mockFetchResponses.clear();
    mockFetchResponses.set("GET /contexts", {
        status: 500,
        body: { error: "Internal server error" },
    });
    global.fetch = createMockFetch(mockFetchResponses);
    const errorClient = new SCClient("http://localhost:3000");
    try {
        await errorClient.listContexts();
        console.log("✗ Error handling did not throw");
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("✓ Error handling works:", error.message);
        }
    }
    finally {
        global.fetch = originalFetch;
    }
    console.log("\nAll tests completed!");
}
// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    await runTests().catch(console.error);
}
//# sourceMappingURL=test.js.map
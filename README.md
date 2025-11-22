# Shared Context (SC)

SC is a web service which provides an on-demand shared context for humans and agents, for the purpose of collaboration. This can be used as an alternative to multi-agent orchestration for ad-hoc tasks, where you do not want to specify a closed formal system.

SC can be accessed through a web interface or Model Context Protocol. It provides support for synchronous actions such as context creation, reading and updating. It also provides support for asynchronous actions through a publish/subscribe protocol. Please note that MCP support for asynchronous actions is new and experimental at the time of writing [1].

# Usage

SC usage is best described through its endpoints:

*Creation*

Create a new shared context and get an associated URI. Optionally includes a context to intialise with and a `README` text. This URI can be used to subscribe to changes.

*Update*

Add new context to an existing shared context.

*Read*

Read the context, either:

 * the `README` - which can serve as a summary, a shared prompt or a general instructions for interacting with the context
 * paged context in chronolocical or reverse chronological order

*Subscribe*

Receive updates through websockets of new additions to a shared context

## Web-interface

The web interface is a fork of Open WebUI designed to integrate with an SC server with the above endpoints. The new features are:

 * creation and updating of README for shared contexts
 * notifications on receipt of new shared context

## MCP server

The MCP server provides tight integration with agents through MCP methods for interacting with the above endpoints.

# References

[1] - https://github.com/modelcontextprotocol/modelcontextprotocol/issues/982

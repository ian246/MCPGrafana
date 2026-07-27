# Grafana MCP Log Analyzer

An advanced web application that leverages a Next.js frontend and a Node.js Model Context Protocol (MCP) server to analyze system logs from Grafana Loki and report on system stability and errors.

## Context

This project demonstrates the integration of modern frontend technologies with the emerging Model Context Protocol (MCP). It features a premium, interactive user interface built with Next.js, and a robust backend MCP server that connects to Grafana Loki to extract and analyze logs in real-time. 

The goal of this project is to provide a clean, feature-driven architecture that is well-documented and ready to be showcased on platforms like GitHub and LinkedIn.

## Architecture

*   **Frontend**: Next.js App Router providing a dynamic, polished user interface.
*   **MCP Server**: Node.js application utilizing the `@modelcontextprotocol/sdk` to expose log analysis tools.
*   **Integration**: The Next.js API routes act as an MCP Client to interact with the standalone Node.js MCP server, which in turn queries Grafana Loki's HTTP API.

## Features (Planned)

*   **Interactive Dashboard**: A sleek, dark-themed UI to initiate log analysis.
*   **MCP Integration**: Seamless communication between the web client and the MCP server.
*   **Grafana Loki Connectivity**: Direct querying of log streams based on custom parameters.
*   **Instability Detection**: Automated parsing of logs to detect errors, timeouts, and system instability.

## Getting Started

*(Instructions will be added as the project is implemented)*

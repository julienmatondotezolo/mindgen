# Whiteboard Documentation

## Overview

This documentation provides a comprehensive guide to the Whiteboard component, a powerful interactive SVG-based canvas for creating and editing mind maps and diagrams with real-time collaboration features.

## Documentation Contents

### User Documentation

- [User Guide](whiteboard-user-guide.md) - Complete guide for end users covering all features and functionality

### Technical Documentation

- [Whiteboard Overview](whiteboard.md) - High-level overview of the whiteboard's architecture and features
- [Component Details](whiteboard-components.md) - Detailed information about each sub-component
- [Technical Implementation](whiteboard-technical.md) - In-depth analysis of the implementation with code examples

## Component Structure

The whiteboard is built with several key components:

1. **Main Whiteboard Component** - The core container that manages state and interactions
2. **Toolbar** - Provides tools for interaction with the canvas
3. **Layer Components** - Renders and manages interactive shapes
4. **Edge Components** - Renders and manages connections between shapes
5. **Collaborative Features** - Enables real-time multi-user editing

## Key Features

- Real-time collaborative editing
- Multiple shape types (Rectangle, Ellipse, Diamond, Path)
- Connections with various styles and decorations
- Advanced selection and manipulation tools
- Zoom and pan functionality
- Auto-saving and export capabilities
- Permission-based access control

## Technology Stack

- React for component structure
- TypeScript for type safety
- Recoil for state management
- D3.js for zoom and pan functionality
- Ably Spaces for real-time collaboration
- SVG for rendering

## Getting Started

For developers new to this codebase, we recommend:

1. Begin with the [Whiteboard Overview](whiteboard.md) to understand the component architecture
2. Review the [Component Details](whiteboard-components.md) to understand each part's role
3. Explore the [Technical Implementation](whiteboard-technical.md) for implementation specifics
4. Check the [User Guide](whiteboard-user-guide.md) to understand the end-user experience

## Contributing

When modifying the whiteboard component, please ensure:

1. All new features maintain the existing permission system
2. Performance considerations are taken into account, especially for large diagrams
3. Collaborative features remain functional
4. Documentation is updated to reflect any changes 
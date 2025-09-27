# Human in the Loop

A VS Code extension that provides language model tools for getting human feedback and choices during AI interactions.

## Features

This extension provides two powerful language model tools that enable AI assistants to request human input when needed:

### 🗨️ Human Feedback Tool (`humanInTheLoopFeedback`)

Allows language models to request detailed feedback from users through an interactive dialog:

- **Markdown Support**: Displays prompts with rich markdown formatting (bold, italic, code blocks)
- **Multi-line Input**: Provides a resizable text area for detailed responses
- **Keyboard Shortcuts**: Submit with Ctrl+Enter for quick interaction
- **VS Code Theme Integration**: Matches your editor's appearance

**Example Usage:**
```json
{
  "prompt": "Please review this code and provide feedback:\n\n```javascript\nfunction add(a, b) {\n  return a + b;\n}\n```\n\nWhat improvements would you suggest?"
}
```

### 🎯 Human Choice Tool (`humanInTheLoopChoice`)

Enables language models to present multiple options and get user selections:

- **Dynamic Button Layout**: Creates buttons for each choice option
- **Responsive Grid**: Adapts to different numbers of choices
- **Clear Visual Hierarchy**: Distinguishes between choices and cancel options
- **Keyboard Navigation**: ESC key to cancel

**Example Usage:**
```json
{
  "prompt": "Which color scheme would you prefer for the website?",
  "choices": ["Blue & White", "Dark Theme", "Green & Gold", "Minimalist Gray"]
}
```

## How It Works

Both tools open dedicated webview panels that:

1. Display the markdown-formatted prompt clearly at the top
2. Provide appropriate input mechanisms (text area or buttons)
3. Return the user's response to the language model
4. Handle cancellation gracefully

## Requirements

- VS Code version 1.104.0 or higher
- No additional dependencies required

## Language Model Integration

These tools are designed to be used by language models (like GitHub Copilot) to gather human input during conversations. They are registered as language model tools and can be invoked programmatically.

### Tool Schemas

**humanInTheLoopFeedback:**
- `prompt` (string, required): Markdown-formatted text to display to the user

**humanInTheLoopChoice:**
- `prompt` (string, required): Markdown-formatted question to display
- `choices` (array of strings, required): Available options for the user to choose from

## Use Cases

- **Code Review**: Get human feedback on generated code
- **Design Decisions**: Present multiple implementation approaches
- **Content Creation**: Choose between different writing styles or formats
- **Configuration**: Select preferences for tool behavior
- **Quality Assurance**: Validate AI-generated content before proceeding

## Known Issues

- Webview panels may not retain focus in some VS Code configurations
- Very long choice lists may require scrolling

## Release Notes

### 1.0.0

Initial release featuring:
- Human feedback tool with markdown support and multi-line input
- Human choice tool with dynamic button generation
- Full VS Code theme integration
- Keyboard shortcuts and accessibility features

---

## Development

This extension is built using:
- TypeScript
- VS Code Extension API
- Webview API for custom UI components

## License

See LICENSE file for details.

**Enjoy seamless human-AI collaboration!**

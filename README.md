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

## Installation

You can install the extension directly from the source repository by packaging it into a VSIX file. Choose one of the options below:

### Option 1 – One-step install (recommended)

```bash
npm run install:vsix
```

This command compiles the extension, creates a `humanintheloop.vsix` file, and installs it into your local VS Code using the `code` CLI. Make sure the `code` command is available on your PATH (VS Code ➜ Command Palette ➜ "Shell Command: Install 'code' command in PATH" on macOS, or install VS Code with PATH integration on Windows/Linux).

### Option 2 – Build and install manually

1. Install dependencies
   ```bash
   npm install
   ```
2. Compile the extension
   ```bash
   npm run compile
   ```
3. Package the extension (outputs `humanintheloop.vsix`)
   ```bash
   npm run package:vsix
   ```
4. Install the VSIX into VS Code
   ```bash
   code --install-extension humanintheloop.vsix
   ```

### Uninstalling

To remove the extension from VS Code:

- Using the helper script (requires `code` CLI):
  ```bash
  npm run uninstall:vsix
  ```
- Or manually via the CLI:
  ```bash
  code --uninstall-extension humanintheloop
  ```

After installation, reload VS Code if prompted. The language model tools will be available to copilot-compatible models immediately after activation.

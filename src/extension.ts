import * as vscode from 'vscode';

async function showFeedbackDialog(prompt: string): Promise<string> {
	return new Promise((resolve, reject) => {
		let isResolved = false;
		
		const panel = vscode.window.createWebviewPanel(
			'humanFeedback',
			'Human Feedback',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);

		panel.webview.html = getWebviewContent(prompt);

		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'submit':
						if (!isResolved) {
							isResolved = true;
							panel.dispose();
							resolve(message.feedback);
						}
						return;
					case 'cancel':
						if (!isResolved) {
							isResolved = true;
							panel.dispose();
							reject(new Error('User cancelled feedback'));
						}
						return;
				}
			}
		);

		panel.onDidDispose(() => {
			if (!isResolved) {
				isResolved = true;
				reject(new Error('User cancelled feedback'));
			}
		});
	});
}

function getWebviewContent(prompt: string): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Human Feedback</title>
	<style>
		body {
			font-family: var(--vscode-font-family);
			font-size: var(--vscode-font-size);
			color: var(--vscode-foreground);
			background-color: var(--vscode-editor-background);
			padding: 20px;
			margin: 0;
		}
		.prompt {
			margin-bottom: 20px;
			padding: 15px;
			background-color: var(--vscode-textBlockQuote-background);
			border-left: 4px solid var(--vscode-textBlockQuote-border);
			border-radius: 4px;
		}
		.feedback-container {
			margin-bottom: 20px;
		}
		textarea {
			width: 100%;
			min-height: 150px;
			padding: 10px;
			border: 1px solid var(--vscode-input-border);
			background-color: var(--vscode-input-background);
			color: var(--vscode-input-foreground);
			font-family: var(--vscode-font-family);
			font-size: var(--vscode-font-size);
			resize: vertical;
			border-radius: 4px;
		}
		textarea:focus {
			outline: 1px solid var(--vscode-focusBorder);
		}
		.buttons {
			display: flex;
			gap: 10px;
		}
		button {
			padding: 8px 16px;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-family: var(--vscode-font-family);
			font-size: var(--vscode-font-size);
		}
		.submit-btn {
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
		}
		.submit-btn:hover {
			background-color: var(--vscode-button-hoverBackground);
		}
		.cancel-btn {
			background-color: var(--vscode-button-secondaryBackground);
			color: var(--vscode-button-secondaryForeground);
		}
		.cancel-btn:hover {
			background-color: var(--vscode-button-secondaryHoverBackground);
		}
	</style>
</head>
<body>
	<div class="prompt">
		<div id="promptContent"></div>
	</div>
	<div class="feedback-container">
		<label for="feedback">Your feedback:</label>
		<textarea id="feedback" placeholder="Enter your feedback here..."></textarea>
	</div>
	<div class="buttons">
		<button class="submit-btn" onclick="submitFeedback()">Submit</button>
		<button class="cancel-btn" onclick="cancel()">Cancel</button>
	</div>

	<script>
		const vscode = acquireVsCodeApi();
		
		// Set the prompt content (supporting basic markdown)
		document.getElementById('promptContent').innerHTML = \`${prompt.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`
			.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
			.replace(/\\*(.*?)\\*/g, '<em>$1</em>')
			.replace(/\`(.*?)\`/g, '<code>$1</code>')
			.replace(/\\n/g, '<br>');

		function submitFeedback() {
			const feedback = document.getElementById('feedback').value;
			if (feedback.trim()) {
				vscode.postMessage({
					command: 'submit',
					feedback: feedback
				});
			}
		}

		function cancel() {
			vscode.postMessage({
				command: 'cancel'
			});
		}

		// Focus the textarea when the page loads
		document.getElementById('feedback').focus();

		// Allow Ctrl+Enter to submit
		document.getElementById('feedback').addEventListener('keydown', function(e) {
			if (e.ctrlKey && e.key === 'Enter') {
				submitFeedback();
			}
		});
	</script>
</body>
</html>`;
}

export function activate(context: vscode.ExtensionContext) {
	// Register the feedback tool
	const feedbackTool = vscode.lm.registerTool('humanInTheLoopFeedback', {
		async invoke(options) {
			const input = options.input as { prompt: string };

			// Show custom feedback dialog
			const feedback = await showFeedbackDialog(input.prompt);

			return new vscode.LanguageModelToolResult([
				new vscode.LanguageModelTextPart(feedback)
			]);
		}
	});

	// Register the choice tool
	const choiceTool = vscode.lm.registerTool('humanInTheLoopChoice', {
		async invoke(options) {
			const input = options.input as { prompt: string, choices: string[] };
			
			// Create quick pick items from choices
			const items = input.choices.map(choice => ({ label: choice }));
			
			// Add cancel option
			items.push({ label: '$(close) Cancel' });

			// Show quick pick to get user's choice
			const selectedItem = await vscode.window.showQuickPick(items, {
				placeHolder: input.prompt,
				ignoreFocusOut: true
			});

			if (!selectedItem || selectedItem.label.includes('Cancel')) {
				throw new Error('User cancelled choice');
			}

			return new vscode.LanguageModelToolResult([
				new vscode.LanguageModelTextPart(selectedItem.label)
			]);
		}
	});

	context.subscriptions.push(feedbackTool, choiceTool);
}

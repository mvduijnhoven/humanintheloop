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
	const promptJson = JSON.stringify(prompt);
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
		.prompt-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12px;
			margin-bottom: 12px;
		}
		.prompt-title {
			font-weight: bold;
		}
		.copy-actions {
			display: flex;
			align-items: center;
			gap: 8px;
		}
		.copy-btn {
			padding: 4px 10px;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			background-color: var(--vscode-button-secondaryBackground);
			color: var(--vscode-button-secondaryForeground);
			font-family: var(--vscode-font-family);
			font-size: calc(var(--vscode-font-size) * 0.9);
		}
		.copy-btn:hover {
			background-color: var(--vscode-button-secondaryHoverBackground);
		}
		.copy-status {
			min-width: 70px;
			font-size: calc(var(--vscode-font-size) * 0.85);
			color: var(--vscode-foreground);
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
		<div class="prompt-header">
			<span class="prompt-title">Prompt</span>
			<div class="copy-actions">
				<button id="copyPromptButton" class="copy-btn" onclick="copyPrompt()">Copy Prompt</button>
				<span id="copyStatus" class="copy-status" role="status" aria-live="polite"></span>
			</div>
		</div>
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
		const rawPrompt = ${promptJson};

		document.getElementById('promptContent').innerHTML = renderMarkdown(rawPrompt);

		function renderMarkdown(text) {
			return text
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
				.replace(/\\*(.*?)\\*/g, '<em>$1</em>')
				.replace(/\`(.*?)\`/g, '<code>$1</code>')
				.replace(/\\n/g, '<br>');
		}

		async function copyPrompt() {
			const status = document.getElementById('copyStatus');
			const button = document.getElementById('copyPromptButton');
			status.textContent = '';
			try {
				if (navigator.clipboard && navigator.clipboard.writeText) {
					await navigator.clipboard.writeText(rawPrompt);
				} else {
					const helper = document.createElement('textarea');
					helper.value = rawPrompt;
					helper.setAttribute('readonly', '');
					helper.style.position = 'absolute';
					helper.style.left = '-9999px';
					document.body.appendChild(helper);
					helper.select();
					document.execCommand('copy');
					document.body.removeChild(helper);
				}
				status.textContent = 'Copied!';
			} catch (error) {
				status.textContent = 'Copy failed';
			}
			button.focus();
			setTimeout(() => {
				status.textContent = '';
			}, 2000);
		}

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

		document.getElementById('feedback').focus();

		document.getElementById('feedback').addEventListener('keydown', function(e) {
			if (e.ctrlKey && e.key === 'Enter') {
				submitFeedback();
			}
		});
	</script>
</body>
</html>`;
}

async function showChoiceDialog(prompt: string, choices: string[]): Promise<string> {
	return new Promise((resolve, reject) => {
		let isResolved = false;
		
		const panel = vscode.window.createWebviewPanel(
			'humanChoice',
			'Human Choice',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true
			}
		);

		panel.webview.html = getChoiceWebviewContent(prompt, choices);

		panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'choice':
						if (!isResolved) {
							isResolved = true;
							panel.dispose();
							resolve(message.choice);
						}
						return;
					case 'cancel':
						if (!isResolved) {
							isResolved = true;
							panel.dispose();
							reject(new Error('User cancelled choice'));
						}
						return;
				}
			}
		);

		panel.onDidDispose(() => {
			if (!isResolved) {
				isResolved = true;
				reject(new Error('User cancelled choice'));
			}
		});
	});
}

function getChoiceWebviewContent(prompt: string, choices: string[]): string {
	const choiceButtons = choices.map(choice => 
		`<button class="choice-btn" onclick="selectChoice('${choice.replace(/'/g, "\\'")}')">
			${choice}
		</button>`
	).join('\n\t\t');
	const promptJson = JSON.stringify(prompt);

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Human Choice</title>
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
		.prompt-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12px;
			margin-bottom: 12px;
		}
		.prompt-title {
			font-weight: bold;
		}
		.copy-actions {
			display: flex;
			align-items: center;
			gap: 8px;
		}
		.copy-btn {
			padding: 4px 10px;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			background-color: var(--vscode-button-secondaryBackground);
			color: var(--vscode-button-secondaryForeground);
			font-family: var(--vscode-font-family);
			font-size: calc(var(--vscode-font-size) * 0.9);
		}
		.copy-btn:hover {
			background-color: var(--vscode-button-secondaryHoverBackground);
		}
		.copy-status {
			min-width: 70px;
			font-size: calc(var(--vscode-font-size) * 0.85);
			color: var(--vscode-foreground);
		}
		.choices-container {
			margin-bottom: 20px;
		}
		.choices-grid {
			display: grid;
			gap: 10px;
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			margin-bottom: 15px;
		}
		button {
			padding: 12px 16px;
			border: none;
			border-radius: 4px;
			cursor: pointer;
			font-family: var(--vscode-font-family);
			font-size: var(--vscode-font-size);
			transition: background-color 0.2s;
		}
		.choice-btn {
			background-color: var(--vscode-button-background);
			color: var(--vscode-button-foreground);
			min-height: 40px;
		}
		.choice-btn:hover {
			background-color: var(--vscode-button-hoverBackground);
		}
		.cancel-btn {
			background-color: var(--vscode-button-secondaryBackground);
			color: var(--vscode-button-secondaryForeground);
			width: 100px;
		}
		.cancel-btn:hover {
			background-color: var(--vscode-button-secondaryHoverBackground);
		}
		.cancel-container {
			text-align: center;
			border-top: 1px solid var(--vscode-widget-border);
			padding-top: 15px;
		}
	</style>
</head>
<body>
	<div class="prompt">
		<div class="prompt-header">
			<span class="prompt-title">Prompt</span>
			<div class="copy-actions">
				<button id="copyPromptButton" class="copy-btn" onclick="copyPrompt()">Copy Prompt</button>
				<span id="copyStatus" class="copy-status" role="status" aria-live="polite"></span>
			</div>
		</div>
		<div id="promptContent"></div>
	</div>
	<div class="choices-container">
		<div class="choices-grid">
			${choiceButtons}
		</div>
		<div class="cancel-container">
			<button class="cancel-btn" onclick="cancel()">Cancel</button>
		</div>
	</div>

	<script>
		const vscode = acquireVsCodeApi();
		const rawPrompt = ${promptJson};

		document.getElementById('promptContent').innerHTML = renderMarkdown(rawPrompt);

		function renderMarkdown(text) {
			return text
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
				.replace(/\\*(.*?)\\*/g, '<em>$1</em>')
				.replace(/\`(.*?)\`/g, '<code>$1</code>')
				.replace(/\\n/g, '<br>');
		}

		async function copyPrompt() {
			const status = document.getElementById('copyStatus');
			const button = document.getElementById('copyPromptButton');
			status.textContent = '';
			try {
				if (navigator.clipboard && navigator.clipboard.writeText) {
					await navigator.clipboard.writeText(rawPrompt);
				} else {
					const helper = document.createElement('textarea');
					helper.value = rawPrompt;
					helper.setAttribute('readonly', '');
					helper.style.position = 'absolute';
					helper.style.left = '-9999px';
					document.body.appendChild(helper);
					helper.select();
					document.execCommand('copy');
					document.body.removeChild(helper);
				}
				status.textContent = 'Copied!';
			} catch (error) {
				status.textContent = 'Copy failed';
			}
			button.focus();
			setTimeout(() => {
				status.textContent = '';
			}, 2000);
		}

		function selectChoice(choice) {
			vscode.postMessage({
				command: 'choice',
				choice: choice
			});
		}

		function cancel() {
			vscode.postMessage({
				command: 'cancel'
			});
		}

		document.addEventListener('keydown', function(e) {
			if (e.key === 'Escape') {
				cancel();
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
			
			// Show custom choice dialog
			const choice = await showChoiceDialog(input.prompt, input.choices);

			return new vscode.LanguageModelToolResult([
				new vscode.LanguageModelTextPart(choice)
			]);
		}
	});

	context.subscriptions.push(feedbackTool, choiceTool);
}

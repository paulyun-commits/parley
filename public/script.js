// 🤖✨ AI Auto-Chat: Where robots talk to robots! ✨🤖
document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chatHistory');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const continueButton = document.getElementById('continueButton');
    const stopButton = document.getElementById('stopButton');
    const clearButton = document.getElementById('clearButton');
    const repliesInput = document.getElementById('repliesInput');
    const delayInput = document.getElementById('delayInput');
    const noDelayCheckbox = document.getElementById('noDelayCheckbox');
    const unlimitedCheckbox = document.getElementById('unlimitedCheckbox');
    const messagesInput = document.getElementById('messagesInput');
    // Config panel elements
    const configModal = document.getElementById('configModal');
    const configPanel = document.getElementById('configPanel');
    const configToggle = document.getElementById('configToggle');
    const configClose = document.getElementById('configClose');
    const configContent = document.getElementById('configContent');
    const alphaServerInput = document.getElementById('alphaServer');
    const alphaModelSelect = document.getElementById('alphaModel');
    const alphaPromptTextarea = document.getElementById('alphaPrompt');
    // Alpha advanced options
    const alphaTemperatureInput = document.getElementById('alphaTemperature');
    const alphaTopKInput = document.getElementById('alphaTopK');
    const alphaTopPInput = document.getElementById('alphaTopP');
    const alphaRepeatPenaltyInput = document.getElementById('alphaRepeatPenalty');
    const alphaSeedInput = document.getElementById('alphaSeed');
    const alphaNumCtxInput = document.getElementById('alphaNumCtx');
    const alphaNumPredictInput = document.getElementById('alphaNumPredict');
    const alphaTypicalPInput = document.getElementById('alphaTypicalP');
    const alphaPresencePenaltyInput = document.getElementById('alphaPresencePenalty');
    const alphaFrequencyPenaltyInput = document.getElementById('alphaFrequencyPenalty');
    const alphaMirostatInput = document.getElementById('alphaMirostat');
    const alphaMirostatTauInput = document.getElementById('alphaMirostatTau');
    const alphaMirostatEtaInput = document.getElementById('alphaMirostatEta');
    
    const omegaServerInput = document.getElementById('omegaServer');
    const omegaModelSelect = document.getElementById('omegaModel');
    const omegaPromptTextarea = document.getElementById('omegaPrompt');
    // Omega advanced options
    const omegaTemperatureInput = document.getElementById('omegaTemperature');
    const omegaTopKInput = document.getElementById('omegaTopK');
    const omegaTopPInput = document.getElementById('omegaTopP');
    const omegaRepeatPenaltyInput = document.getElementById('omegaRepeatPenalty');
    const omegaSeedInput = document.getElementById('omegaSeed');
    const omegaNumCtxInput = document.getElementById('omegaNumCtx');
    const omegaNumPredictInput = document.getElementById('omegaNumPredict');
    const omegaTypicalPInput = document.getElementById('omegaTypicalP');
    const omegaPresencePenaltyInput = document.getElementById('omegaPresencePenalty');
    const omegaFrequencyPenaltyInput = document.getElementById('omegaFrequencyPenalty');
    const omegaMirostatInput = document.getElementById('omegaMirostat');
    const omegaMirostatTauInput = document.getElementById('omegaMirostatTau');
    const omegaMirostatEtaInput = document.getElementById('omegaMirostatEta');
    
    const configForm = document.getElementById('configForm');
    const alphaRestoreDefaultsBtn = document.getElementById('alphaRestoreDefaults');
    const omegaRestoreDefaultsBtn = document.getElementById('omegaRestoreDefaults');

    // Default config
    const defaultConfig = {
        alpha: { 
            server: 'http://alpha:11434', 
            model: 'llama3.2:latest',
            systemPrompt: 'You are an intelligent and logical person. Keep your messages short and concise. When you need to think through complex problems, you can use <think>your reasoning here</think> tags to show your thought process.',
            options: {
                temperature: 0.8,
                top_k: 40,
                top_p: 0.9,
                repeat_penalty: 1.1,
                seed: -1,
                num_ctx: 10240,
                num_predict: 1024,
                typical_p: 1.0,
                presence_penalty: 0.0,
                frequency_penalty: 0.0,
                mirostat: 0,
                mirostat_tau: 5.0,
                mirostat_eta: 0.1
            }
        },
        omega: { 
            server: 'http://omega:11434', 
            model: 'llama3.2:latest',
            systemPrompt: 'You are an intelligent and logical person. Keep your messages short and concise. When you need to think through complex problems, you can use <think>your reasoning here</think> tags to show your thought process.',
            options: {
                temperature: 0.8,
                top_k: 40,
                top_p: 0.9,
                repeat_penalty: 1.1,
                seed: -1,
                num_ctx: 10240,
                num_predict: 1024,
                typical_p: 1.0,
                presence_penalty: 0.0,
                frequency_penalty: 0.0,
                mirostat: 0,
                mirostat_tau: 5.0,
                mirostat_eta: 0.1
            }
        }
    };

    // Current configuration
    let currentConfig = { ...defaultConfig };

    // Conversation history for each LLM
    let conversationHistory = {
        alpha: [],
        omega: []
    };

    // Conversation control
    let isConversationActive = false;

    // Load config from localStorage or use default
    function loadConfig() {
        const config = localStorage.getItem('ollamaConfig');
        if (config) {
            return JSON.parse(config);
        }
        return { ...defaultConfig };
    }

    // Save config to localStorage
    function saveConfig(config) {
        localStorage.setItem('ollamaConfig', JSON.stringify(config));
        currentConfig = { ...config };
    }

    // Note: Chat history is intentionally not saved to localStorage
    // It will be cleared on page refresh for privacy and fresh starts

    // Load conversation history from localStorage - DISABLED
    // Chat history is not persisted across page refreshes
    function loadConversationHistory() {
        // Always start with empty conversation history
        conversationHistory = { alpha: [], omega: [] };
    }

    // Fetch available models via local proxy which forwards to the Ollama server specified by `s`
    async function fetchModelsFromOllama(serverUrl) {
        try {
            const proxiedUrl = `/api/tags?s=${encodeURIComponent(serverUrl)}`;
            const response = await fetch(proxiedUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            // Extract model info including names and sizes from Ollama's response
            return data.models?.map(model => ({
                name: model.name,
                size: model.size || 0,
                displayName: `${model.name} (${formatModelSize(model.size || 0)})`
            })) || [{
                name: defaultConfig.alpha.model,
                size: 0,
                displayName: defaultConfig.alpha.model
            }];
        } catch (error) {
            console.warn('Could not fetch models from Ollama server via proxy:', serverUrl, error.message);
            // Return default model as fallback
            return [{
                name: defaultConfig.alpha.model,
                size: 0,
                displayName: defaultConfig.alpha.model
            }];
        }
    }

    // Helper function to format model size in human-readable format
    function formatModelSize(sizeInBytes) {
        if (sizeInBytes === 0) return 'Unknown size';
        
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024));
        const size = (sizeInBytes / Math.pow(1024, i)).toFixed(1);
        
        return `${size} ${sizes[i]}`;
    }

    // Populate a <select> element with model options
    function populateModelSelect(selectEl, models, selectedModel) {
        // Clear existing options
        selectEl.innerHTML = '';
        
        // Remove duplicates by model name
        const uniqueModels = models.filter((model, index, self) => 
            index === self.findIndex(m => m.name === model.name)
        );
        
        // Sort models by name alphabetically
        uniqueModels.sort((a, b) => a.name.localeCompare(b.name));
        
        uniqueModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.name;
            option.textContent = model.displayName;
            selectEl.appendChild(option);
        });

        // Set selected model
        const modelNames = uniqueModels.map(m => m.name);
        if (selectedModel && modelNames.includes(selectedModel)) {
            selectEl.value = selectedModel;
        } else if (uniqueModels.length > 0) {
            selectEl.value = uniqueModels[0].name;
        }
    }

    // Populate config panel with current config
    async function populateConfigPanel(config) {
        alphaServerInput.value = config.alpha.server;
        omegaServerInput.value = config.omega.server;
        alphaPromptTextarea.value = config.alpha.systemPrompt || defaultConfig.alpha.systemPrompt;
        omegaPromptTextarea.value = config.omega.systemPrompt || defaultConfig.omega.systemPrompt;

        // Populate advanced options for Alpha
        const alphaOptions = config.alpha.options || defaultConfig.alpha.options;
        alphaTemperatureInput.value = alphaOptions.temperature;
        alphaTopKInput.value = alphaOptions.top_k;
        alphaTopPInput.value = alphaOptions.top_p;
        alphaRepeatPenaltyInput.value = alphaOptions.repeat_penalty;
        alphaSeedInput.value = alphaOptions.seed;
        alphaNumCtxInput.value = alphaOptions.num_ctx;
        alphaNumPredictInput.value = alphaOptions.num_predict;
        alphaTypicalPInput.value = alphaOptions.typical_p;
        alphaPresencePenaltyInput.value = alphaOptions.presence_penalty;
        alphaFrequencyPenaltyInput.value = alphaOptions.frequency_penalty;
        alphaMirostatInput.value = alphaOptions.mirostat;
        alphaMirostatTauInput.value = alphaOptions.mirostat_tau;
        alphaMirostatEtaInput.value = alphaOptions.mirostat_eta;

        // Populate advanced options for Omega
        const omegaOptions = config.omega.options || defaultConfig.omega.options;
        omegaTemperatureInput.value = omegaOptions.temperature;
        omegaTopKInput.value = omegaOptions.top_k;
        omegaTopPInput.value = omegaOptions.top_p;
        omegaRepeatPenaltyInput.value = omegaOptions.repeat_penalty;
        omegaSeedInput.value = omegaOptions.seed;
        omegaNumCtxInput.value = omegaOptions.num_ctx;
        omegaNumPredictInput.value = omegaOptions.num_predict;
        omegaTypicalPInput.value = omegaOptions.typical_p;
        omegaPresencePenaltyInput.value = omegaOptions.presence_penalty;
        omegaFrequencyPenaltyInput.value = omegaOptions.frequency_penalty;
        omegaMirostatInput.value = omegaOptions.mirostat;
        omegaMirostatTauInput.value = omegaOptions.mirostat_tau;
        omegaMirostatEtaInput.value = omegaOptions.mirostat_eta;

        // Show loading state
        populateModelSelect(alphaModelSelect, [{name: 'Loading...', size: 0, displayName: 'Loading...'}], 'Loading...');
        populateModelSelect(omegaModelSelect, [{name: 'Loading...', size: 0, displayName: 'Loading...'}], 'Loading...');

        // Fetch and populate model lists
        try {
            const [alphaModels, omegaModels] = await Promise.all([
                fetchModelsFromOllama(config.alpha.server),
                fetchModelsFromOllama(config.omega.server)
            ]);

            populateModelSelect(alphaModelSelect, alphaModels, config.alpha.model);
            populateModelSelect(omegaModelSelect, omegaModels, config.omega.model);
        } catch (error) {
            console.error('Error fetching models:', error);
            populateModelSelect(alphaModelSelect, [{name: defaultConfig.alpha.model, size: 0, displayName: defaultConfig.alpha.model}], config.alpha.model);
            populateModelSelect(omegaModelSelect, [{name: defaultConfig.omega.model, size: 0, displayName: defaultConfig.omega.model}], config.omega.model);
        }
    }

    // Restore defaults functions
    function restoreAlphaDefaults() {
        const alphaDefaults = defaultConfig.alpha.options;
        alphaTemperatureInput.value = alphaDefaults.temperature;
        alphaTopKInput.value = alphaDefaults.top_k;
        alphaTopPInput.value = alphaDefaults.top_p;
        alphaRepeatPenaltyInput.value = alphaDefaults.repeat_penalty;
        alphaSeedInput.value = alphaDefaults.seed;
        alphaNumCtxInput.value = alphaDefaults.num_ctx;
        alphaNumPredictInput.value = alphaDefaults.num_predict;
        alphaTypicalPInput.value = alphaDefaults.typical_p;
        alphaPresencePenaltyInput.value = alphaDefaults.presence_penalty;
        alphaFrequencyPenaltyInput.value = alphaDefaults.frequency_penalty;
        alphaMirostatInput.value = alphaDefaults.mirostat;
        alphaMirostatTauInput.value = alphaDefaults.mirostat_tau;
        alphaMirostatEtaInput.value = alphaDefaults.mirostat_eta;
    }

    function restoreOmegaDefaults() {
        const omegaDefaults = defaultConfig.omega.options;
        omegaTemperatureInput.value = omegaDefaults.temperature;
        omegaTopKInput.value = omegaDefaults.top_k;
        omegaTopPInput.value = omegaDefaults.top_p;
        omegaRepeatPenaltyInput.value = omegaDefaults.repeat_penalty;
        omegaSeedInput.value = omegaDefaults.seed;
        omegaNumCtxInput.value = omegaDefaults.num_ctx;
        omegaNumPredictInput.value = omegaDefaults.num_predict;
        omegaTypicalPInput.value = omegaDefaults.typical_p;
        omegaPresencePenaltyInput.value = omegaDefaults.presence_penalty;
        omegaFrequencyPenaltyInput.value = omegaDefaults.frequency_penalty;
        omegaMirostatInput.value = omegaDefaults.mirostat;
        omegaMirostatTauInput.value = omegaDefaults.mirostat_tau;
        omegaMirostatEtaInput.value = omegaDefaults.mirostat_eta;
    }

    // Initialize configuration and conversation history
    currentConfig = loadConfig();
    loadConversationHistory();
    populateConfigPanel(currentConfig);

    // Modal functionality
    function showConfigModal() {
        configModal.classList.add('show');
    }

    function hideConfigModal() {
        configModal.classList.remove('show');
    }

    // Event listeners for modal
    configToggle.addEventListener('click', showConfigModal);
    configClose.addEventListener('click', hideConfigModal);
    
    // Close modal when clicking outside the panel
    configModal.addEventListener('click', (e) => {
        if (e.target === configModal) {
            hideConfigModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && configModal.classList.contains('show')) {
            hideConfigModal();
        }
    });

    // Handle config form submission
    configForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newConfig = {
            alpha: {
                server: alphaServerInput.value.trim() || defaultConfig.alpha.server,
                model: alphaModelSelect.value || defaultConfig.alpha.model,
                systemPrompt: alphaPromptTextarea.value.trim() || defaultConfig.alpha.systemPrompt,
                options: {
                    temperature: parseFloat(alphaTemperatureInput.value),
                    top_k: parseInt(alphaTopKInput.value),
                    top_p: parseFloat(alphaTopPInput.value),
                    repeat_penalty: parseFloat(alphaRepeatPenaltyInput.value),
                    seed: parseInt(alphaSeedInput.value),
                    num_ctx: parseInt(alphaNumCtxInput.value),
                    num_predict: parseInt(alphaNumPredictInput.value),
                    typical_p: parseFloat(alphaTypicalPInput.value),
                    presence_penalty: parseFloat(alphaPresencePenaltyInput.value),
                    frequency_penalty: parseFloat(alphaFrequencyPenaltyInput.value),
                    mirostat: parseInt(alphaMirostatInput.value),
                    mirostat_tau: parseFloat(alphaMirostatTauInput.value),
                    mirostat_eta: parseFloat(alphaMirostatEtaInput.value),
                }
            },
            omega: {
                server: omegaServerInput.value.trim() || defaultConfig.omega.server,
                model: omegaModelSelect.value || defaultConfig.omega.model,
                systemPrompt: omegaPromptTextarea.value.trim() || defaultConfig.omega.systemPrompt,
                options: {
                    temperature: parseFloat(omegaTemperatureInput.value),
                    top_k: parseInt(omegaTopKInput.value),
                    top_p: parseFloat(omegaTopPInput.value),
                    repeat_penalty: parseFloat(omegaRepeatPenaltyInput.value),
                    seed: parseInt(omegaSeedInput.value),
                    num_ctx: parseInt(omegaNumCtxInput.value),
                    num_predict: parseInt(omegaNumPredictInput.value),
                    typical_p: parseFloat(omegaTypicalPInput.value),
                    presence_penalty: parseFloat(omegaPresencePenaltyInput.value),
                    frequency_penalty: parseFloat(omegaFrequencyPenaltyInput.value),
                    mirostat: parseInt(omegaMirostatInput.value),
                    mirostat_tau: parseFloat(omegaMirostatTauInput.value),
                    mirostat_eta: parseFloat(omegaMirostatEtaInput.value)
                }
            }
        };

        saveConfig(newConfig);
        await populateConfigPanel(newConfig);
        addMessage('✅ Configuration saved successfully!', 'system');
        hideConfigModal();
    });

    // Handle server input changes to refresh model lists
    alphaServerInput.addEventListener('blur', async () => {
        const server = alphaServerInput.value.trim();
        if (server && server !== currentConfig.alpha.server) {
            const models = await fetchModelsFromOllama(server);
            populateModelSelect(alphaModelSelect, models, currentConfig.alpha.model);
        }
    });

    omegaServerInput.addEventListener('blur', async () => {
        const server = omegaServerInput.value.trim();
        if (server && server !== currentConfig.omega.server) {
            const models = await fetchModelsFromOllama(server);
            populateModelSelect(omegaModelSelect, models, currentConfig.omega.model);
        }
    });

    // Restore defaults button event listeners
    alphaRestoreDefaultsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        restoreAlphaDefaults();
    });

    omegaRestoreDefaultsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        restoreOmegaDefaults();
    });

    // Helper function to get delay value in milliseconds
    function getDelayMs() {
        if (noDelayCheckbox.checked) {
            return 0; // No delay when checkbox is checked
        }
        const seconds = parseFloat(delayInput.value) || 1.0; // Default to 1.0 seconds if invalid
        return Math.round(seconds * 1000); // Convert seconds to milliseconds
    }

    // Function to get conversation history for a specific LLM
    function getConversationHistory(senderName, maxMessages = null) {
        // Use the input value if maxMessages is not explicitly provided
        if (maxMessages === null) {
            maxMessages = getMaxMessages();
        }
        
        // Get the complete conversation from the chat history DOM
        const messages = [];
        const chatMessages = chatHistory.children;
        
        // Check if there are any AI responses (to determine if we're past the first reply)
        let hasAIResponse = false;
        for (let i = 0; i < chatMessages.length; i++) {
            const messageEl = chatMessages[i];
            if (messageEl.classList.contains('alpha') || messageEl.classList.contains('omega')) {
                if (!messageEl.classList.contains('thinking')) {
                    hasAIResponse = true;
                    break;
                }
            }
        }
        
        for (let i = 0; i < chatMessages.length; i++) {
            const messageEl = chatMessages[i];
            const contentEl = messageEl.querySelector('.content');
            if (!contentEl) continue;
            
            let role;
            let content = contentEl.textContent.trim();
            
            // Skip thinking messages and empty messages
            if (messageEl.classList.contains('thinking') || !content || content === '🤔 Thinking...') {
                continue;
            }
            
            if (messageEl.classList.contains('user')) {
                // User messages are always 'user' role when calling Ollama chat endpoint
                role = 'user';
            } else if (messageEl.classList.contains('alpha')) {
                if (senderName === 'alpha') {
                    // Alpha sees its own messages as assistant
                    role = 'assistant';
                } else {
                    // Omega sees Alpha's messages as user
                    role = 'user';
                }
            } else if (messageEl.classList.contains('omega')) {
                if (senderName === 'omega') {
                    // Omega sees its own messages as assistant
                    role = 'assistant';
                } else {
                    // Alpha sees Omega's messages as user
                    role = 'user';
                }
            } else if (messageEl.classList.contains('system')) {
                // Skip system messages as they don't contribute to conversation context
                continue;
            } else {
                continue;
            }
            
            messages.push({ role, content });
        }
        
        // Return the last maxMessages to fit within context window
        return messages.slice(-maxMessages);
    }

    // Function to add message to conversation history
    function addToConversationHistory(senderName, role, content) {
        if (!conversationHistory[senderName]) {
            conversationHistory[senderName] = [];
        }
        conversationHistory[senderName].push({
            role: role,
            content: content
        });
        
        // Keep only the last 20 messages per LLM to prevent context overflow
        if (conversationHistory[senderName].length > 20) {
            conversationHistory[senderName] = conversationHistory[senderName].slice(-20);
        }
        
        // Note: Chat history is intentionally not saved to localStorage
    }
    
    // Helper function to get max replies value
    function getMaxReplies() {
        if (unlimitedCheckbox.checked) {
            return Infinity; // Unlimited replies
        }
        return parseInt(repliesInput.value) || 2; // Default to 2 if invalid
    }
    
    // Helper function to get max messages value for conversation history
    function getMaxMessages() {
        return parseInt(messagesInput.value) || 10; // Default to 10 if invalid
    }
    
    // Helper function to generate display name from server URL and model
    function getDisplayName(senderType) {
        if (senderType === 'user') return '👤 You';
        if (senderType === 'system') return '⚙️ System';
        
        const config = senderType === 'alpha' ? currentConfig.alpha : currentConfig.omega;
        const serverUrl = config.server;
        const model = config.model;
        
        // Extract hostname from URL
        let hostname;
        try {
            const url = new URL(serverUrl);
            hostname = url.hostname;
        } catch (e) {
            // If URL parsing fails, use the server string as-is
            hostname = serverUrl.replace(/^https?:\/\//, '').split(':')[0];
        }
        
        // Clean up model name (remove version tags if present)
        const modelName = model.split(':')[0];
        
        // Add emojis based on sender type
        const emoji = senderType === 'alpha' ? '🤖' : '🦾';
        
        return `${emoji} ${hostname}/${modelName}`;
    }
    
    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        
        const senderElement = document.createElement('div');
        senderElement.classList.add('sender');
        
        const senderName = getDisplayName(sender);
        
        senderElement.textContent = senderName;
        
        const contentElement = document.createElement('div');
        contentElement.classList.add('content');
        
        // Special handling for "thinking" messages
        if (message === '🤔 Thinking...') {
            contentElement.innerHTML = '<span class="thinking-dots">💭 Thinking<span class="dots"><span>.</span><span>.</span><span>.</span></span></span>';
            messageElement.classList.add('thinking');
        }
        // Parse and render markdown for AI responses, keep plain text for system/user messages
        else if (sender === 'alpha' || sender === 'omega') {
            // Handle <think> tags - extract and hide thinking content
            const processedMessage = processThinkTags(message);
            
            // Configure marked options for better rendering
            marked.setOptions({
                highlight: function(code, lang) {
                    if (lang && Prism.languages[lang]) {
                        return Prism.highlight(code, Prism.languages[lang], lang);
                    } else {
                        return code;
                    }
                },
                breaks: true,
                gfm: true
            });
            
            // Render markdown
            contentElement.innerHTML = marked.parse(processedMessage.content);
            
            // If there was thinking content, add it as a collapsible section at the top
            if (processedMessage.thinking) {
                const thinkingSection = createThinkingSection(processedMessage.thinking);
                contentElement.insertBefore(thinkingSection, contentElement.firstChild);
            }
            
            // Apply syntax highlighting to any code blocks that weren't caught by marked
            contentElement.querySelectorAll('pre code').forEach((block) => {
                if (!block.classList.contains('language-')) {
                    Prism.highlightElement(block);
                }
            });
            
            // Add copy buttons to code blocks
            contentElement.querySelectorAll('pre').forEach((pre) => {
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-code-btn';
                copyButton.innerHTML = '📋';
                copyButton.title = 'Copy code';
                copyButton.onclick = () => copyCodeBlock(pre, copyButton);
                pre.appendChild(copyButton);
            });
        } else {
            // For system and user messages, keep as plain text
            contentElement.textContent = message;
        }
        
        const timestampElement = document.createElement('div');
        timestampElement.classList.add('timestamp');
        timestampElement.textContent = new Date().toLocaleTimeString();
        
        messageElement.appendChild(senderElement);
        messageElement.appendChild(contentElement);
        messageElement.appendChild(timestampElement);
        
        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        // Auto-fade system messages after 5 seconds, but only if it's not the only message
        if (sender === 'system') {
            setTimeout(() => {
                // Check if this system message is the only message in chat history
                const allMessages = chatHistory.children;
                if (allMessages.length > 1) {
                    messageElement.classList.add('fading');
                    // Remove the message after the fade animation completes
                    setTimeout(() => {
                        if (messageElement.parentNode) {
                            messageElement.parentNode.removeChild(messageElement);
                        }
                    }, 500); // Wait for fade animation to complete
                }
            }, 3000);
        }
    }

    // Function to copy code block content
    function copyCodeBlock(pre, button) {
        const code = pre.querySelector('code');
        const text = code.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
            button.innerHTML = '✅';
            button.title = 'Copied!';
            setTimeout(() => {
                button.innerHTML = '📋';
                button.title = 'Copy code';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy code:', err);
            button.innerHTML = '❌';
            setTimeout(() => {
                button.innerHTML = '📋';
            }, 2000);
        });
    }

    // Function to process <think> tags in messages
    function processThinkTags(message) {
        const thinkRegex = /<think>([\s\S]*?)<\/think>/gi;
        let thinking = '';
        let content = message;
        
        // Extract all thinking content
        const thinkMatches = message.match(thinkRegex);
        if (thinkMatches) {
            thinking = thinkMatches.map(match => {
                return match.replace(/<\/?think>/gi, '').trim();
            }).join('\n\n');
            
            // Remove think tags from the main content
            content = message.replace(thinkRegex, '').trim();
        }
        
        return { thinking, content };
    }

    // Function to create collapsible thinking section
    function createThinkingSection(thinkingContent) {
        const thinkingWrapper = document.createElement('div');
        thinkingWrapper.className = 'thinking-section';
        
        const thinkingHeader = document.createElement('div');
        thinkingHeader.className = 'thinking-header';
        thinkingHeader.innerHTML = `
            <span class="thinking-icon">🧠</span>
            <span class="thinking-label">Thinking</span>
            <span class="thinking-toggle">▼</span>
        `;
        
        const thinkingContent_div = document.createElement('div');
        thinkingContent_div.className = 'thinking-content';
        thinkingContent_div.style.display = 'none';
        
        // Parse thinking content as markdown too
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && Prism.languages[lang]) {
                    return Prism.highlight(code, Prism.languages[lang], lang);
                } else {
                    return code;
                }
            },
            breaks: true,
            gfm: true
        });
        
        thinkingContent_div.innerHTML = marked.parse(thinkingContent);
        
        // Add click handler to toggle thinking content
        thinkingHeader.addEventListener('click', () => {
            const isHidden = thinkingContent_div.style.display === 'none';
            thinkingContent_div.style.display = isHidden ? 'block' : 'none';
            const toggle = thinkingHeader.querySelector('.thinking-toggle');
            toggle.textContent = isHidden ? '▲' : '▼';
            thinkingWrapper.classList.toggle('expanded', isHidden);
        });
        
        thinkingWrapper.appendChild(thinkingHeader);
        thinkingWrapper.appendChild(thinkingContent_div);
        
        return thinkingWrapper;
    }

    // Function to send message directly to Ollama server with streaming
    async function sendMessageToOllama(message, serverUrl, model, systemPrompt, senderName, addAsUserMessage = true) {
        let streamingMessageElement = null;
        let streamingContentElement = null;
        let fullResponse = '';
        
        try {
            addMessage('🤔 Thinking...', senderName);
            
            // Build message array with system prompt and conversation history
            const messages = [];
            
            // Add system prompt if provided
            if (systemPrompt && systemPrompt.trim()) {
                messages.push({
                    role: 'system',
                    content: systemPrompt.trim()
                });
            }
            
            // Add conversation history 
            const history = getConversationHistory(senderName);
            messages.push(...history);
            
            // Add new user message if specified (for new conversations)
            if (addAsUserMessage && message && message.trim()) {
                messages.push({
                    role: 'user',
                    content: message.trim()
                });
            }
            
            // Get advanced options for this LLM
            const config = senderName === 'alpha' ? currentConfig.alpha : currentConfig.omega;
            const options = config.options || (senderName === 'alpha' ? defaultConfig.alpha.options : defaultConfig.omega.options);
            
            // Build request body with advanced options - enable streaming
            const requestBody = {
                model: model,
                messages: messages,
                stream: true,
                options: {
                    temperature: options.temperature,
                    top_k: options.top_k,
                    top_p: options.top_p,
                    repeat_penalty: options.repeat_penalty,
                    num_ctx: options.num_ctx,
                    num_predict: options.num_predict,
                    typical_p: options.typical_p,
                    presence_penalty: options.presence_penalty,
                    frequency_penalty: options.frequency_penalty,
                    mirostat: options.mirostat,
                    mirostat_tau: options.mirostat_tau,
                    mirostat_eta: options.mirostat_eta
                }
            };
            
            // Add seed if it's not -1 (random)
            if (options.seed !== -1) {
                requestBody.options.seed = options.seed;
            }
            
            const response = await fetch(`/api/chat?s=${encodeURIComponent(serverUrl)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Remove the "thinking" message and add a new streaming message
            const messages_dom = chatHistory.children;
            const thinkingMessage = messages_dom[messages_dom.length - 1];
            if (thinkingMessage && thinkingMessage.classList.contains(senderName) && 
                thinkingMessage.classList.contains('thinking')) {
                chatHistory.removeChild(thinkingMessage);
            }
            
            // Create streaming message element
            streamingMessageElement = document.createElement('div');
            streamingMessageElement.classList.add('message', senderName, 'streaming');
            
            const senderElement = document.createElement('div');
            senderElement.classList.add('sender');
            senderElement.textContent = getDisplayName(senderName);
            
            streamingContentElement = document.createElement('div');
            streamingContentElement.classList.add('content');
            streamingContentElement.innerHTML = '<span class="streaming-cursor">▋</span>';
            
            streamingMessageElement.appendChild(senderElement);
            streamingMessageElement.appendChild(streamingContentElement);
            chatHistory.appendChild(streamingMessageElement);
            
            // Scroll to bottom to show new message
            chatHistory.scrollTop = chatHistory.scrollHeight;
            
            // Process streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        
                        if (data.message && data.message.content) {
                            fullResponse += data.message.content;
                            
                            // Process and update content with thinking tags
                            const processedMessage = processThinkTags(fullResponse);
                            
                            // Configure marked options for better rendering
                            marked.setOptions({
                                highlight: function(code, lang) {
                                    if (lang && Prism.languages[lang]) {
                                        return Prism.highlight(code, Prism.languages[lang], lang);
                                    } else {
                                        return code;
                                    }
                                },
                                breaks: true,
                                gfm: true
                            });
                            
                            // Update the streaming content
                            streamingContentElement.innerHTML = marked.parse(processedMessage.content) + '<span class="streaming-cursor">▋</span>';
                            
                            // Add thinking sections if present
                            if (processedMessage.thinking) {
                                const existingThinking = streamingMessageElement.querySelector('.thinking-section');
                                if (!existingThinking) {
                                    const thinkingElement = createThinkingSection(processedMessage.thinking);
                                    streamingMessageElement.insertBefore(thinkingElement, streamingContentElement);
                                }
                            }
                            
                            // Scroll to bottom to show new content
                            chatHistory.scrollTop = chatHistory.scrollHeight;
                        }
                        
                        if (data.done) {
                            break;
                        }
                    } catch (e) {
                        // Skip invalid JSON lines
                        console.warn('Failed to parse JSON line:', line);
                    }
                }
                
                // Check if conversation was stopped
                if (!isConversationActive) {
                    reader.cancel();
                    // Finalize the current response even if interrupted
                    if (streamingContentElement && fullResponse) {
                        const processedMessage = processThinkTags(fullResponse);
                        streamingContentElement.innerHTML = marked.parse(processedMessage.content);
                        streamingMessageElement.classList.remove('streaming');
                        
                        // Add thinking sections if present
                        if (processedMessage.thinking) {
                            const existingThinking = streamingMessageElement.querySelector('.thinking-section');
                            if (!existingThinking) {
                                const thinkingElement = createThinkingSection(processedMessage.thinking);
                                streamingMessageElement.insertBefore(thinkingElement, streamingContentElement);
                            }
                        }
                    }
                    return {
                        message: fullResponse,
                        server: senderName,
                        model: model,
                        interrupted: true
                    };
                }
            }
            
            // Remove streaming cursor and finalize message
            if (streamingContentElement) {
                const processedMessage = processThinkTags(fullResponse);
                streamingContentElement.innerHTML = marked.parse(processedMessage.content);
                streamingMessageElement.classList.remove('streaming');
                
                // Add thinking sections if present
                if (processedMessage.thinking) {
                    const existingThinking = streamingMessageElement.querySelector('.thinking-section');
                    if (!existingThinking) {
                        const thinkingElement = createThinkingSection(processedMessage.thinking);
                        streamingMessageElement.insertBefore(thinkingElement, streamingContentElement);
                    }
                }
            }
            
            return {
                message: fullResponse,
                server: senderName,
                model: model
            };
            
        } catch (error) {
            console.error('Error sending message to Ollama:', error);
            
            // Clean up any streaming elements
            if (streamingMessageElement) {
                chatHistory.removeChild(streamingMessageElement);
            }
            
            // Remove the "thinking" message if it still exists
            const messages_dom = chatHistory.children;
            const thinkingMessage = messages_dom[messages_dom.length - 1];
            if (thinkingMessage && thinkingMessage.classList.contains(senderName) && 
                thinkingMessage.classList.contains('thinking')) {
                chatHistory.removeChild(thinkingMessage);
            }
            
            addMessage(`❌ Error communicating with ${senderName}: ${error.message} 🚫`, 'system');
            return null;
        }
    }

    // Event listeners
    sendButton.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        if (!message || isConversationActive) return;

        messageInput.value = '';
        addMessage(message, 'user');

        // Start conversation
        isConversationActive = true;
        stopButton.disabled = false;
        continueButton.disabled = true;
        sendButton.disabled = true;
        messageInput.disabled = true;

        // Randomly pick either Alpha or Omega to respond first
        let currentSender = Math.random() < 0.5 ? 'alpha' : 'omega';
        let lastMessage = message;
        const maxReplies = getMaxReplies();

        for (let i = 0; i < maxReplies && isConversationActive; i++) {
            const config = currentSender === 'alpha' ? currentConfig.alpha : currentConfig.omega;
            
            const response = await sendMessageToOllama(
                lastMessage, 
                config.server, 
                config.model,
                config.systemPrompt,
                currentSender,
                false  // Don't add as user message since it's already in DOM
            );

            if (response) {
                // Note: With streaming, the message is already added to DOM during sendMessageToOllama
                lastMessage = response.message;
                
                // If conversation was interrupted, break early
                if (response.interrupted) {
                    addMessage('Conversation stopped by user', 'system');
                    break;
                }
                
                // Switch to the other LLM for next turn
                currentSender = currentSender === 'alpha' ? 'omega' : 'alpha';
                
                // Add a small delay between messages for readability
                if (i < maxReplies - 1 && isConversationActive) {
                    await new Promise(resolve => setTimeout(resolve, getDelayMs()));
                }
            } else if (!isConversationActive) {
                addMessage('Conversation stopped by user', 'system');
                break;
            } else {
                addMessage(`Failed to continue conversation - check ${currentSender} server connection`, 'system');
                break;
            }
        }

        // Reset conversation state
        isConversationActive = false;
        stopButton.disabled = true;
        continueButton.disabled = false;
        sendButton.disabled = false;
        messageInput.disabled = false;
        messageInput.focus();
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isConversationActive) {
            sendButton.click();
        }
    });

    stopButton.addEventListener('click', () => {
        isConversationActive = false;
    });

    continueButton.addEventListener('click', async () => {
        if (isConversationActive) return;

        // Get the last message from either LLM to continue from
        const messages = chatHistory.children;
        let lastMessage = '';
        let lastSender = '';
        
        // Find the last message from Alpha or Omega (skip user/system messages)
        for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i];
            if (message.classList.contains('alpha') || message.classList.contains('omega')) {
                lastMessage = message.querySelector('.content').textContent;
                lastSender = message.classList.contains('alpha') ? 'alpha' : 'omega';
                break;
            }
        }

        if (!lastMessage) {
            addMessage('⚠️ No previous conversation to continue from. Send a message to start a new conversation. 🚀', 'system');
            return;
        }

        // Start continuing the conversation
        isConversationActive = true;
        stopButton.disabled = false;
        continueButton.disabled = true;
        sendButton.disabled = true;
        messageInput.disabled = true;

        // Switch to the other LLM to continue
        let currentSender = lastSender === 'alpha' ? 'omega' : 'alpha';
        const maxReplies = getMaxReplies();

        if (maxReplies === Infinity) {
            addMessage('Continuing unlimited conversation...', 'system');
        } else {
            addMessage(`Continuing conversation for ${maxReplies} more exchanges...`, 'system');
        }

        for (let i = 0; i < maxReplies && isConversationActive; i++) {
            const config = currentSender === 'alpha' ? currentConfig.alpha : currentConfig.omega;
            
            const response = await sendMessageToOllama(
                '', 
                config.server, 
                config.model,
                config.systemPrompt,
                currentSender,
                false  // Don't add as user message, just continue from existing history
            );

            if (response) {
                // Note: With streaming, the message is already added to DOM during sendMessageToOllama
                lastMessage = response.message;
                
                // If conversation was interrupted, break early
                if (response.interrupted) {
                    addMessage('Conversation stopped by user', 'system');
                    break;
                }
                
                // Switch to the other LLM for next turn
                currentSender = currentSender === 'alpha' ? 'omega' : 'alpha';
                
                // Add a small delay between messages for readability
                if (i < maxReplies - 1 && isConversationActive) {
                    await new Promise(resolve => setTimeout(resolve, getDelayMs()));
                }
            } else if (!isConversationActive) {
                addMessage('Conversation stopped by user', 'system');
                break;
            } else {
                addMessage(`Failed to continue conversation - check ${currentSender} server connection`, 'system');
                break;
            }
        }

        // Reset conversation state
        isConversationActive = false;
        stopButton.disabled = true;
        continueButton.disabled = false;
        sendButton.disabled = false;
        messageInput.disabled = false;
        messageInput.focus();
    });

    // Initialize button states
    stopButton.disabled = true;
    continueButton.disabled = true;

    clearButton.addEventListener('click', () => {
        // Stop any active conversation first
        if (isConversationActive) {
            isConversationActive = false;
            stopButton.disabled = true;
            continueButton.disabled = true;
            sendButton.disabled = false;
            messageInput.disabled = false;
            addMessage('Conversation stopped and chat cleared.', 'system');
        }
        
        chatHistory.innerHTML = '';
        // Clear conversation history for both LLMs
        conversationHistory = {
            alpha: [],
            omega: []
        };
        // Note: No need to clear localStorage since we don't save chat history there
        
        // Reset all button states
        continueButton.disabled = true;
        
        // Add initial system message if chat wasn't already cleared
        if (!isConversationActive) {
            addMessage("Send a message to start the conversation.", 'system');
        }
        
        messageInput.focus();
    });

    // Handle unlimited checkbox
    unlimitedCheckbox.addEventListener('change', function() {
        repliesInput.disabled = this.checked;
        if (this.checked) {
            repliesInput.style.opacity = '0.5';
        } else {
            repliesInput.style.opacity = '1';
        }
    });

    // Handle no-delay checkbox
    noDelayCheckbox.addEventListener('change', function() {
        delayInput.disabled = this.checked;
        if (this.checked) {
            delayInput.style.opacity = '0.5';
        } else {
            delayInput.style.opacity = '1';
        }
    });

    // Add initial system message
    addMessage("Send a message to start the conversation.", 'system');
});
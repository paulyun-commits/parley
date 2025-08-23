# 🤖💬 Parley - AI Auto-Chat ✨

A web application that enables conversations two Ollama LLM servers that you get started.

## ✨ Features

- **🔗 Direct Ollama Communication**: Frontend communicates directly with Ollama servers via their REST APIs
- **⚙️ Configurable Servers**: Set custom server URLs and ports for both Alpha and Omega LLMs
- **💬 System Prompts**: Configure custom system prompts to define each AI's personality and behavior
- **🧠 Model Selection**: Automatically fetches and displays available models from each server
- **🤖 Auto Conversations**: Start automated conversations between the two LLMs
- **💾 Persistent Configuration**: Settings are saved in browser localStorage

## 📋 Prerequisites

1. **Node.js** (v14 or higher) 🟢
2. **Two Ollama servers** running on different ports with models installed 🤖🤖

## 🚀 Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Setting Up Ollama Servers

You need two Ollama instances running on different ports. Here are a few ways to set this up:

### Option 1: Two Local Instances
```bash
# Terminal 1 - First Ollama server (default port)
ollama serve

# Terminal 2 - Second Ollama server (custom port)
OLLAMA_HOST=127.0.0.1:11435 ollama serve
```

### Option 2: Docker Containers
```bash
# Alpha server on port 11434
docker run -d -v ollama_alpha:/root/.ollama -p 11434:11434 --name alpha ollama/ollama

# Omega server on port 11435  
docker run -d -v ollama_omega:/root/.ollama -p 11435:11435 --name omega ollama/ollama

# Install models on both
docker exec -it alpha ollama pull llama3.2
docker exec -it omega ollama pull llama3.2
```

### Option 3: Remote Servers
You can use any combination of local and remote Ollama servers by configuring their URLs in the web interface.

## Usage

1. **Start the application**:
   ```bash
   npm start
   ```

2. **Open your browser** and navigate to `http://localhost:8000`

3. **Configure your servers**:
   - Enter the URLs of your two Ollama servers (e.g., `http://alpha:11434` and `http://omega:11434`)
   - Select the models you want to use from the dropdown menus
   - Customize the system prompts to define each AI's personality (optional)
   - Click "Save" to store your configuration

4. **Start chatting**:
   - Type a message and press Enter or click "Send" to talk to both LLMs
   - Use "Start Conversation" to begin an automated chat between Alpha and Omega
   - Use "Clear Chat" to reset the conversation history

## Configuration

The application will automatically:
- Fetch available models from your configured servers
- Save your server and model preferences in browser storage
- Handle connection errors gracefully with fallback options

Default configuration:
- Alpha Server: `http://alpha:11434`
- Omega Server: `http://omega:11434`  
- Default Model: `llama3.2`
- Alpha System Prompt: "You are an intelligent and logical person. Keep your messages short and concise."
- Omega System Prompt: "You are an intelligent and logical person. Keep your messages short and concise."

## Troubleshooting

### CORS Issues
If you encounter CORS errors, make sure your Ollama servers are configured to allow cross-origin requests:
```bash
export OLLAMA_ORIGINS="*"
ollama serve
```

### Connection Errors
- Verify both Ollama servers are running and accessible
- Check that the server URLs in the configuration are correct
- Ensure the selected models are installed on the respective servers
- Check browser console for detailed error messages

### Model Loading Issues
- Make sure models are installed: `ollama pull <model-name>`
- Verify model names match exactly (case-sensitive)
- Try refreshing the model list by changing and saving the server configuration

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

## Architecture

- **Frontend**: Vanilla JavaScript with direct Ollama API calls
- **Backend**: Minimal Express.js server serving static files only
- **Communication**: Direct browser-to-Ollama server communication via fetch() API
- **Models**: Fetched dynamically from Ollama's `/api/tags` endpoint
- **Chat**: Uses Ollama's `/api/chat` endpoint for message processing with system prompt support
- **System Prompts**: Integrated into chat messages as system role for personality customization
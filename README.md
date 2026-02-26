# OwosysX AI Assistant

OwosysX AI is a WhatsApp automation and AI-response system designed to handle customer communication, voice processing, automated posting, and workflow management without direct official affiliation with WhatsApp.

It acts as an intelligent automation layer between users and their customers.

## Features

- 🤖 **AI-Powered Responses** - Intelligent automation for customer communication
- 💬 **WhatsApp Integration** - Seamless WhatsApp messaging automation
- 🎤 **Voice Processing** - Handle voice messages and audio processing
- 📱 **Auto Poster** - Automated content posting capabilities
- ⚙️ **Workflow Management** - Streamlined automation workflows

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Owolabi4199/OwosysX.git
cd OwosysX
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure your settings:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the application:
```bash
python main.py
```

## Usage

### Basic Setup

```python
from owosysx import OwosysX

# Initialize the AI Assistant
assistant = OwosysX()

# Handle customer messages
response = assistant.process_message(user_message)
```

### WhatsApp Automation

```python
# Send automated responses
assistant.send_whatsapp_message(phone_number, message)

# Handle voice messages
assistant.process_voice_message(audio_file)
```

## Prerequisites

- Python 3.8+
- WhatsApp Business Account (optional)
- API keys for AI services

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the Apache License 2.0 - see [LICENSE](LICENSE) file for details.

## Disclaimer

This project is not officially affiliated with WhatsApp or Meta Platforms, Inc. Use responsibly and in accordance with WhatsApp's Terms of Service.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
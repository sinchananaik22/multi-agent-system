

# Multi-Agent AI System

A sophisticated document processing system that uses specialized AI agents to classify, route, and process different input formats (PDF, JSON, Email) while maintaining shared context across processing steps.

## 🚀 Features

- **Multi-format Input Processing**: Handles JSON, Email, and Plain Text documents
- **AI-powered Classification**: Automatic format and intent detection using OpenAI models
- **Specialized Agents**: Three dedicated agents for different processing tasks
- **Shared Memory**: Context preservation across agents using database or in-memory storage
- **Activity Logging**: Complete audit trail of all agent activities
- **Fallback Systems**: Graceful degradation when external services are unavailable
- **Real-time Interface**: Interactive web interface for testing and monitoring

## 🏗️ System Architecture

### Core Components

1. **Classifier Agent**
   - Analyzes input to determine format (JSON, Email, PDF, PlainText)
   - Classifies intent (Invoice, RFQ, Complaint, Regulation, Query, Other)
   - Routes to appropriate specialized agent

2. **JSON Agent**
   - Processes structured JSON data
   - Extracts and validates fields against schemas
   - Flags anomalies and missing fields
   - Reformats to standardized schemas

3. **Email Agent**
   - Handles email content analysis
   - Extracts sender, recipients, subject, and key points
   - Determines intent and urgency levels
   - Formats data for CRM-style usage

4. **Shared Memory Module**
   - Maintains context across processing steps
   - Stores extracted values and metadata
   - Enables conversation threading and traceability
   - Supports both PostgreSQL and in-memory storage

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS, Lucide React
- **AI/ML**: OpenAI GPT-4, AI SDK by Vercel
- **Database**: Vercel Postgres (with in-memory fallback)
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- (Optional) Vercel Postgres database for persistent storage

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd multi-agent-system

# Install dependencies
npm install --legacy-peer-deps

# Or create from scratch
npx create-next-app@latest multi-agent-system --typescript --tailwind --eslint --app --import-alias "@/*"
```

### 2. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Required: OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Database (for persistent storage)
POSTGRES_URL=your_postgres_url_here
POSTGRES_PRISMA_URL=your_postgres_prisma_url_here
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url_here
```

### 3. Install UI Components

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Install required components
npx shadcn@latest add button card input label textarea tabs alert badge
```

### 4. Run the Application

```bash
# Development server
npm run dev

# Production build
npm run build
npm start
```

Access the application at `http://localhost:3000`

## 📖 Usage Examples

### Processing JSON Documents

```json
{
  "type": "invoice",
  "amount": 1250.00,
  "customer": "Acme Corp",
  "date": "2025-05-28",
  "items": [
    {"name": "Software License", "quantity": 1, "price": 1250.00}
  ]
}
```

**Expected Output:**
- Format: JSON
- Intent: Invoice
- Routed to: JSONAgent
- Extracted fields, missing fields, and standardized format

### Processing Email Content

```
From: john.doe@example.com
To: support@company.com
Subject: Request for Quotation - Office Supplies

Dear Support Team,

I would like to request a quotation for the following office supplies:
- 10 reams of A4 paper
- 5 boxes of blue pens
- 3 desk organizers

We need these items by June 15th. Please let me know the total cost including delivery.

Best regards,
John Doe
Procurement Manager
```

**Expected Output:**
- Format: Email
- Intent: RFQ
- Routed to: EmailAgent
- Sender, urgency, key points, and CRM-formatted data

## 🔧 API Endpoints

### Process Input
`POST /api/process`
- Processes any input through the multi-agent system
- Returns classification, routing, and processing results

### Memory Management
`GET /api/memory`
- Retrieves all shared memory entries
- Shows context and extracted data across sessions

### Activity Logs
`GET /api/logs`
- Returns agent activity logs
- Provides audit trail and debugging information

## 🏗️ Project Structure

```
multi-agent-system/
├── app/
│   ├── api/
│   │   ├── logs/route.ts          # Agent activity logs API
│   │   └── memory/route.ts        # Shared memory API
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main application page
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── agent-logs.tsx             # Agent activity viewer
│   ├── process-input.tsx          # Input processing interface
│   └── system-overview.tsx        # System architecture display
├── lib/
│   ├── actions.ts                 # Server actions and agent logic
│   ├── memory.ts                  # Shared memory management
│   └── utils.ts                   # Utility functions
├── .env.local                     # Environment variables
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## 🔄 Processing Flow

1. **Input Reception**: User submits document via web interface
2. **Classification**: Classifier Agent analyzes format and intent
3. **Routing**: Input routed to appropriate specialized agent
4. **Processing**: Specialized agent extracts and processes information
5. **Memory Storage**: Results stored in shared memory with unique ID
6. **Response**: Structured results returned to user

## 🛡️ Error Handling & Fallbacks

### Database Fallback
- Automatically uses in-memory storage when Postgres unavailable
- Maintains same API interface regardless of storage backend
- Graceful degradation for development and testing

### AI Service Fallback
- Basic rule-based classification when OpenAI unavailable
- Simplified processing maintains core functionality
- Clear user feedback about service limitations

### Input Validation
- Comprehensive error handling for malformed inputs
- Graceful handling of unsupported formats
- Detailed error messages for debugging

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Testing

### Sample Test Cases

1. **Invoice Processing**
   - JSON format with financial data
   - Expected: Invoice classification, field extraction

2. **RFQ Email**
   - Email format with procurement request
   - Expected: RFQ classification, urgency detection

3. **Complaint Text**
   - Plain text with customer complaint
   - Expected: Complaint classification, sentiment analysis

### Manual Testing

1. Navigate to `http://localhost:3000`
2. Select input type (JSON, Email, Plain Text)
3. Enter sample data or use provided examples
4. Click "Process Input"
5. Review classification and processing results
6. Check shared memory and logs tabs

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI processing |
| `POSTGRES_URL` | No | Primary database connection |
| `POSTGRES_PRISMA_URL` | No | Prisma database connection |
| `POSTGRES_URL_NON_POOLING` | No | Non-pooling database connection |

### Customization

- **Add new document types**: Extend the classifier schema
- **Custom processing logic**: Modify agent implementations
- **Additional storage backends**: Implement new memory providers
- **UI customization**: Modify components and styling

## 🐛 Troubleshooting

### Common Issues

**Permission Errors (WSL)**
```bash
# Move project to WSL filesystem
cp -r /mnt/c/path/to/project ~/project-name
cd ~/project-name
npm install
```

**Dependency Conflicts**
```bash
npm install --legacy-peer-deps
# or
npm install --force
```

**Database Connection Issues**
- System automatically falls back to in-memory storage
- Check environment variables for typos
- Verify database credentials and network access

**OpenAI API Errors**
- Verify API key is correct and has credits
- Check API key permissions
- Monitor rate limits and usage

### Debug Mode

Enable detailed logging by setting:
```env
NODE_ENV=development
DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai) for AI integration
- [shadcn/ui](https://ui.shadcn.com) for UI components
- [OpenAI](https://openai.com) for language models
- [Next.js](https://nextjs.org) for the application framework

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation

---

**Built with ❤️ using Next.js, AI SDK, and modern web technologies**
```

This README provides comprehensive documentation for setting up, using, and maintaining the Multi-Agent AI System. It includes all the necessary information for developers to understand, deploy, and extend the system.

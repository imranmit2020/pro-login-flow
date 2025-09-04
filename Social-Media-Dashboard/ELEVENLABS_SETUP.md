# ElevenLabs Voice Agent Integration Setup

This guide explains how to set up the ElevenLabs voice agent integration in your Social Media Dashboard.

## Prerequisites

1. **ElevenLabs Account**: You need an active ElevenLabs account with API access
2. **API Key**: Obtain your API key from the ElevenLabs dashboard
3. **Voice Agent**: Set up a conversational AI agent in ElevenLabs

## Environment Variables

Add the following environment variable to your `.env.local` file:

```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

## Features

The ElevenLabs integration provides:

### 📊 **Real-time Statistics**
- Total calls handled
- Success rate tracking
- Average call duration
- Credits usage monitoring

### 📞 **Call Logs**
- Complete conversation history
- Call transcripts
- Call summaries
- Filter by status (successful, failed, transferred)
- Search functionality

### 🔄 **Auto-refresh**
- Real-time data updates
- Configurable refresh intervals
- Manual refresh capability

### 📋 **Task Integration**
- Save call summaries to tasks
- Automatic task creation
- Priority assignment based on call outcome

### 📈 **Analytics Dashboard**
- Call status breakdown
- End reason analysis
- Performance metrics
- Export functionality

## API Endpoints

The integration uses the following API endpoints:

### `/api/elevenlabs/calls`
- Fetches all conversation data
- Calculates success rates and metrics
- Returns detailed call logs

### `/api/elevenlabs/usage`
- Monitors credit usage
- Tracks remaining credits
- Subscription information

## Usage

1. **Navigate to Calls Section**: Click on "Calls" in the top navigation
2. **View Statistics**: Monitor your voice agent performance in real-time
3. **Browse Call Logs**: Use filters and search to find specific calls
4. **Export Data**: Download call logs as CSV for further analysis
5. **Save to Tasks**: Convert call summaries into actionable tasks

## Troubleshooting

### Common Issues:

1. **API Key Not Found**
   - Ensure `ELEVENLABS_API_KEY` is set in your `.env.local` file
   - Verify the API key is correct and active

2. **No Call Data**
   - Check if your ElevenLabs voice agent is properly configured
   - Verify API permissions in your ElevenLabs dashboard

3. **Loading Errors**
   - Check network connectivity
   - Verify ElevenLabs API status
   - Review browser console for detailed error messages

## Configuration

The voice agent integration can be customized:

- **Refresh Interval**: Default 30 seconds for auto-refresh
- **Items Per Page**: Default 10 calls per page
- **Success Criteria**: Configurable in the API endpoint
- **Export Format**: CSV with customizable fields

## Support

For issues related to:
- ElevenLabs API: Contact ElevenLabs support
- Dashboard Integration: Check the browser console for error messages
- Feature Requests: Create an issue in the project repository

## Security

- API keys are stored securely as environment variables
- All API calls are made server-side to protect credentials
- Call data is processed in real-time without permanent storage (unless configured)

---

**Note**: This integration requires an active ElevenLabs subscription with API access. Usage will count towards your monthly credit limit. 
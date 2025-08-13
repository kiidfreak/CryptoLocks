# FlashVault Backend API 🚀

This is the backend API server for FlashVault, providing blockchain data integration and portfolio analytics.

## 📋 Overview

The FlashVault Backend API serves as a bridge between the frontend application and the blockchain, providing:

- **Blockchain Data**: Real-time lock information from smart contracts
- **Portfolio Analytics**: User portfolio performance and statistics
- **Network Management**: BSC Testnet and Mainnet support
- **Rate Limiting**: API protection and security
- **Real-time Updates**: WebSocket support for live data

## 🏗️ Architecture

### Core Components
- **Express.js Server**: Fast, unopinionated web framework
- **Ethers.js Integration**: Blockchain interaction library
- **RESTful API**: Standard HTTP endpoints
- **CORS Support**: Cross-origin resource sharing
- **Security Middleware**: Helmet, rate limiting, compression

### API Endpoints
- `GET /api/health` - Health check
- `GET /api/networks` - Available networks
- `GET /api/locks/:lockId` - Lock information
- `GET /api/users/:address/locks` - User's locks
- `GET /api/contract/:address/stats` - Contract statistics
- `GET /api/users/:address/analytics` - Portfolio analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Access to BSC networks
- Contract addresses for LockManager

### Installation
```bash
cd backend
npm install
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
PORT=3001
FRONTEND_URL=http://localhost:5173
CURRENT_NETWORK=bscTestnet
```

### Start Development Server
```bash
npm run dev
```

### Start Production Server
```bash
npm start
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3001)
- `FRONTEND_URL`: Frontend application URL
- `CURRENT_NETWORK`: Default network (bscTestnet/bscMainnet)
- `NODE_ENV`: Environment (development/production)

### Network Configuration
- **BSC Testnet**: Chain ID 97, for testing
- **BSC Mainnet**: Chain ID 56, for production
- **Custom RPC**: Configurable RPC endpoints

## 📊 API Documentation

### Health Check
```http
GET /api/health
```
Returns server status and version information.

### Network Information
```http
GET /api/networks
```
Returns available blockchain networks and configuration.

### Lock Information
```http
GET /api/locks/:lockId?network=bscTestnet&contractAddress=0x...
```
Returns detailed information about a specific lock.

**Parameters:**
- `lockId`: Lock identifier
- `network`: Blockchain network (default: bscTestnet)
- `contractAddress`: LockManager contract address

### User Locks
```http
GET /api/users/:address/locks?network=bscTestnet&contractAddress=0x...
```
Returns all locks for a specific user address.

**Parameters:**
- `address`: User wallet address
- `network`: Blockchain network
- `contractAddress`: LockManager contract address

### Contract Statistics
```http
GET /api/contract/:address/stats?network=bscTestnet
```
Returns contract-wide statistics and metrics.

**Parameters:**
- `address`: Contract address
- `network`: Blockchain network

### Portfolio Analytics
```http
GET /api/users/:address/analytics
```
Returns portfolio performance and analytics data.

**Parameters:**
- `address`: User wallet address

## 🔐 Security Features

- **Helmet**: Security headers and protection
- **CORS**: Configurable cross-origin policies
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Request parameter validation
- **Error Handling**: Secure error responses

## 📈 Performance

- **Compression**: Response compression for efficiency
- **Caching**: Smart contract data caching
- **Batch Operations**: Efficient data fetching
- **Connection Pooling**: Database connection optimization

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test networks endpoint
curl http://localhost:3001/api/networks
```

## 🔄 Development

### Code Structure
```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env.example          # Environment template
├── routes/               # API route handlers
├── middleware/           # Custom middleware
├── services/             # Business logic
├── utils/                # Utility functions
└── tests/                # Test files
```

### Adding New Endpoints
1. Define route in `server.js`
2. Add input validation
3. Implement error handling
4. Add tests
5. Update documentation

### Database Integration
The backend is designed to work with PostgreSQL for:
- User profiles and preferences
- Portfolio analytics
- Transaction history
- Performance metrics

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
```bash
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
CURRENT_NETWORK=bscMainnet
```

### Docker Support
```bash
docker build -t flashvault-backend .
docker run -p 3001:3001 flashvault-backend
```

## 🔗 Integration

### Frontend Integration
- **React Hooks**: Custom hooks for API calls
- **Real-time Updates**: WebSocket integration
- **Error Handling**: Comprehensive error management
- **Loading States**: User experience optimization

### Blockchain Integration
- **Smart Contracts**: LockManager contract interaction
- **Event Listening**: Real-time blockchain events
- **Transaction Monitoring**: Status tracking
- **Network Switching**: Multi-chain support

## 📞 Support

For technical support:
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check this README and inline comments
- **API Testing**: Use the provided test endpoints

## 📄 License

MIT License - see LICENSE file for details.

---

**🚀 Ready to power FlashVault with real blockchain data!**

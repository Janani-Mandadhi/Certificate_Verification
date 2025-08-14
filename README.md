# Certificate Verification System using Move

A decentralized certificate verification system built with Move smart contracts, Node.js backend, and React frontend. This system allows institutions to issue, verify, and revoke certificates on the blockchain ensuring immutability and authenticity.

## 🚀 Features

- **Decentralized Certificate Issuance**: Issue certificates on blockchain using Move smart contracts
- **Real-time Verification**: Instantly verify certificate authenticity
- **Role-based Access Control**: Admin, Issuer, Verifier, and User roles
- **Certificate Revocation**: Revoke compromised or invalid certificates
- **IPFS Integration**: Store certificate metadata on IPFS for decentralization
- **QR Code Generation**: Generate QR codes for easy certificate sharing
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## 🛠 Tech Stack

### Blockchain
- **Move Language**: Smart contracts for Aptos blockchain
- **Aptos SDK**: Blockchain interaction

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database for metadata
- **JWT**: Authentication
- **IPFS**: Decentralized storage

### Frontend
- **React**: UI framework
- **Tailwind CSS**: Styling
- **Axios**: HTTP requests
- **React Router**: Navigation

## 📁 Project Structure

```
certificate-verification-system/
├── move_contracts/          # Move Smart Contracts
│   ├── sources/
│   │   ├── access_control.move
│   │   ├── certificate_issuance.move
│   │   ├── certificate_verification.move
│   │   └── certificate_revocation.move
│   └── Move.toml
├── backend/                 # Node.js Backend
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
└── frontend/               # React Frontend
    ├── src/
    │   ├── components/
    │   └── utils/
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Aptos CLI
- IPFS node (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/certificate-verification-system.git
cd certificate-verification-system
```

### 2. Setup Move Contracts

```bash
cd move_contracts
aptos init
aptos move compile
aptos move publish
```

### 3. Setup Backend

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/certificate_verification
JWT_SECRET=your-super-secret-jwt-key-here
APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com/v1
APTOS_FAUCET_URL=https://faucet.devnet.aptoslabs.com
MODULE_ADDRESS=0x1
EOF

npm start
```

### 4. Setup Frontend

```bash
cd frontend
npm install

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com/v1
REACT_APP_MODULE_ADDRESS=0x1
EOF

npm start
```

## 📝 Environment Variables

### Backend (.env)
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/certificate_verification
JWT_SECRET=your-super-secret-jwt-key-here
APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com/v1
APTOS_FAUCET_URL=https://faucet.devnet.aptoslabs.com
MODULE_ADDRESS=0x1
IPFS_API_URL=http://localhost:5001
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com/v1
REACT_APP_MODULE_ADDRESS=0x1
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Certificates
- `POST /api/certificates/issue` - Issue new certificate (Admin/Issuer only)
- `GET /api/certificates/verify/:certHash` - Verify certificate
- `GET /api/certificates/quick-verify/:certHash` - Quick verification
- `POST /api/certificates/revoke/:certHash` - Revoke certificate
- `GET /api/certificates` - Get user's certificates
- `GET /api/certificates/details/:certHash` - Get certificate details

## 🏗 Smart Contract Functions

### Access Control
```move
public entry fun initialize(account: &signer)
public entry fun add_issuer(account: &signer, issuer: address)
public entry fun remove_issuer(account: &signer, issuer: address)
public fun is_authorized_issuer(issuer: address): bool
```

### Certificate Issuance
```move
public entry fun issue_certificate(
    account: &signer,
    recipient: address,
    cert_hash: String,
    metadata_uri: String
)
public fun get_certificate(cert_hash: String): (address, address, String, u64, bool)
```

### Certificate Verification
```move
public fun verify_certificate(cert_hash: String): (bool, bool, bool, address, address, String, u64)
public fun quick_verify(cert_hash: String): bool
```

### Certificate Revocation
```move
public entry fun revoke_certificate(
    account: &signer,
    cert_hash: String,
    reason: String
)
public fun is_revoked(cert_hash: String): bool
```

## 👥 User Roles

### Admin
- Manage all aspects of the system
- Add/remove issuers
- Issue, verify, and revoke certificates
- View all certificates

### Issuer
- Issue certificates
- Revoke their own certificates
- View issued certificates

### Verifier
- Verify any certificate
- View verification history

### User
- View their own certificates
- Verify certificates
- Basic access to system

## 🔄 Workflow

1. **Registration**: Institution registers and gets approved as an issuer
2. **Certificate Issuance**: Issuer creates certificate with recipient details
3. **Blockchain Storage**: Certificate hash and metadata stored on Aptos blockchain
4. **IPFS Storage**: Full certificate data stored on IPFS
5. **Verification**: Anyone can verify certificate using hash or QR code
6. **Revocation**: Original issuer can revoke certificate if needed

## 📱 Usage Examples

### Issue a Certificate
```javascript
const certificateData = {
  recipient: "0x123...abc",
  certificateType: "degree",
  title: "Bachelor of Science in Computer Science",
  description: "Awarded for completing the CS degree program",
  metadata: {
    institution: "Tech University",
    gpa: "3.8",
    graduationDate: "2024-05-15"
  }
};

const response = await axios.post('/api/certificates/issue', certificateData);
```

### Verify a Certificate
```javascript
const certHash = "a1b2c3d4e5f6...";
const response = await axios.get(`/api/certificates/verify/${certHash}`);

if (response.data.isValid) {
  console.log("Certificate is valid!");
} else {
  console.log("Certificate is invalid or revoked");
}
```

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Test Smart Contracts
```bash
cd move_contracts
aptos move test
```

## 🚀 Deployment

### Deploy Smart Contracts
```bash
cd move_contracts
aptos move publish --named-addresses certificate_system=0xYOUR_ADDRESS
```

### Deploy Backend (PM2)
```bash
cd backend
npm install pm2 -g
pm2 start server.js --name "cert-backend"
```

### Deploy Frontend
```bash
cd frontend
npm run build
# Deploy build folder to your hosting service
```

## 🔧 Configuration

### Database Configuration
Update `backend/config/database.js` with your MongoDB settings:

```javascript
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/certificate_verification';
```

### Blockchain Configuration
Update `backend/utils/aptos.js` with your Aptos network settings:

```javascript
const APTOS_NODE_URL = process.env.APTOS_NODE_URL || 'https://fullnode.devnet.aptoslabs.com/v1';
const MODULE_ADDRESS = process.env.MODULE_ADDRESS || '0x1';
```

## 🐛 Troubleshooting

### Common Issues

1. **Contract Compilation Fails**
   ```bash
   cd move_contracts
   aptos move clean
   aptos move compile --dev
   ```

2. **Database Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file

3. **Frontend Build Issues**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```

4. **Blockchain Connection Issues**
   - Verify Aptos node URL
   - Check network connectivity
   - Ensure sufficient APT balance for transactions

## 📚 Additional Resources

- [Move Programming Language](https://move-language.github.io/move/)
- [Aptos Documentation](https://aptos.dev/docs/)
- [React Documentation](https://reactjs.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Aptos Foundation for the Move programming language
- IPFS for decentralized storage
- MongoDB for database solutions
- React team for the amazing frontend framework



0xf85641281bf7e5c9cd3c8a0b2f076f3172b3ccd583978b614e69a5d381b6d3bd

![alt text](image.png)




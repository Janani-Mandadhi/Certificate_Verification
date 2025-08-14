A decentralized certificate verification system built with Move smart contracts, Node.js backend, and React frontend. This system allows institutions to issue, verify, and revoke certificates on the blockchain ensuring immutability and authenticity.

- **Decentralized Certificate Issuance**: Issue certificates on blockchain using Move smart contracts
- **Real-time Verification**: Instantly verify certificate authenticity
- **Role-based Access Control**: Admin, Issuer, Verifier, and User roles
- **Certificate Revocation**: Revoke compromised or invalid certificates
- **IPFS Integration**: Store certificate metadata on IPFS for decentralization
- **QR Code Generation**: Generate QR codes for easy certificate sharing
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

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

0xba349666182fd20aaa50cf25984dac0d6138a267a41ecbb9bde14b19449e629c

<img width="1362" height="662" alt="Screenshot 2025-08-14 125737" src="https://github.com/user-attachments/assets/975ea887-4e11-4e18-88e3-4105e9e672e3" />

TEAM NAME:Chain Chasers
TEAM MEMBERS

    1.MANDADHI JANANI-jm0173420@gmail.com
    
    2.KROSURI HRITHVIKA SARVANI-sarvanikrosuri@gmail.com
    
    3.CHARITHA SRI LUKKA-charithasrilukka@gmail.com
    
 PPT LINK:
 
https://www.canva.com/design/DAGv1X_fvD8/SrhfR9Xsfj_kFs_OIxmwSg/edit?utm_content=DAGv1X_fvD8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton









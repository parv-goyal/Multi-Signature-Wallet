# Multi-Signature Wallet on StarkNet

![StarkNet](https://img.shields.io/badge/StarkNet-Powered-blue)
![Cairo](https://img.shields.io/badge/Cairo-1.0-green)
![React](https://img.shields.io/badge/React-18-61dafb)
![License](https://img.shields.io/badge/License-MIT-yellow)

A secure and user-friendly multi-signature wallet implementation built on StarkNet, combining the power of Cairo smart contracts with a modern React frontend. This project was developed as part of the OnchAIn Island Pre-Selection Task, demonstrating the potential of decentralized security and collaborative transaction management.

## 🌟 Features

- **Secure Multi-Signature Functionality**
  - Multiple wallet owners
  - Configurable approval threshold
  - Transaction proposal and approval system
  - Real-time transaction tracking

- **Modern User Interface**
  - Clean and intuitive design
  - Real-time updates
  - Responsive layout
  - Transaction history visualization

- **StarkNet Integration**
  - Native StarkNet wallet connection
  - Efficient contract interactions
  - Secure transaction handling
  - Cairo 1.0 smart contract

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Yarn or npm
- A StarkNet wallet (e.g., ArgentX, Braavos)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/multisig-wallet.git
cd multisig-wallet
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Smart Contract Deployment

1. Install Scarb (if not already installed):
```bash
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
```

2. Build the smart contract:
```bash
scarb build
```

3. Deploy to StarkNet (requires account with funds):
```bash
starknet deploy --contract target/dev/multisig_wallet_MultiSigWallet.sierra.json
```

## 🔧 Technical Architecture

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for styling
- **StarkNet.js** for blockchain interactions
- **Vite** for fast development and building

### Smart Contract
- Written in **Cairo 1.0**
- Implements multi-signature logic
- Includes comprehensive test suite
- Follows best security practices

### Key Components
- `MultiSigWallet.cairo`: Core smart contract implementation
- `App.tsx`: Main application component
- `components/`: Reusable UI components
- `lib/`: Contract interaction utilities

## 🔐 Security Features

- Row-level security for transaction data
- Secure wallet connection handling
- Input validation and sanitization
- Error boundary implementation
- Transaction confirmation requirements

## 🧪 Testing

### Smart Contract Tests
```bash
scarb test
```

### Frontend Tests
```bash
npm run test
```

## 📖 Usage Guide

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve connection in your StarkNet wallet

2. **View Wallet Info**
   - Connected account address
   - Current balance
   - Owner status
   - Required approvals

3. **Submit Transaction**
   - Fill in recipient address
   - Enter amount
   - Add optional data
   - Submit for approval

4. **Approve Transactions**
   - View pending transactions
   - Approve as owner
   - Track approval status
   - Monitor execution

## 🛠 Development

### Project Structure
```
├── src/
│   ├── components/     # React components
│   ├── lib/           # Contract interactions
│   └── tests/         # Test files
├── public/            # Static assets
└── contracts/         # Cairo contracts
```

### Environment Variables
```env
VITE_CONTRACT_ADDRESS=your_contract_address
VITE_NETWORK=mainnet_or_testnet
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- StarkNet Foundation
- Cairo Language Team
- OnchAIn Island Hackathon Team
- Open Source Community

## 🔗 Links

- [StarkNet Documentation](https://docs.starknet.io)
- [Cairo Documentation](https://cairo-lang.org)
- [React Documentation](https://reactjs.org)

## 👥 Team

- Parv Goyal
- [GitHub](https://github.com/parv-goyal)
- [Twitter](https://x.com/notpervv)

- Varun Sharma
- [GitHub](https://github.com/Varunhrdcr)
- [Twitter](https://x.com/VARUNSH28676736?t=ite6JxDJtGgb_toiS8lQvA&s=09)


---

Built with ❤️ for OnchAIn Island Hackathon 2025
![image](https://github.com/user-attachments/assets/0927d24d-4fe7-4886-a4cc-0abad8d30046)

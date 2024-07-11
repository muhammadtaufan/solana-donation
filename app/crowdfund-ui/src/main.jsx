import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Import wallet adapter components
import { WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

// Import the Phantom wallet adapter directly
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

import { clusterApiUrl } from "@solana/web3.js";

// Include wallet adapter UI styles
import "@solana/wallet-adapter-react-ui/styles.css";

const network = clusterApiUrl("devnet");
const wallets = [new PhantomWalletAdapter()]; // Instantiate the adapter

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);

import Upload from "./artifacts/contracts/Upload.sol/Upload.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import FileUpload from "./components/FileUpload";
import Display from "./components/Display";
import Modal from "./components/Modal";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const loadProvider = async () => {
      if (provider) {
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });

        window.ethereum.on("accountsChanged", () => {
          window.location.reload();
        });

        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        let contractAddress = env.Contract_address;

        const contract = new ethers.Contract(
          contractAddress,
          Upload.abi,
          signer
        );
        setContract(contract);
        setProvider(provider);
      } else {
        console.error("Metamask is not installed");
      }
    };

    provider && loadProvider();
  }, []);

  return (
    <div className={`app ${isDarkTheme ? "dark" : "light"}`}>
  <header className="app-header">
    <h1>Decentralized Cloud Storage</h1>
    <div className="account-info">
      <p>
        <span className="account-text">Account:</span>
        {account ? (
          <span className="account-display">
            {account}
            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(account);
                alert("Address copied to clipboard!");
              }}
              title="Copy to Clipboard"
            >
              📋
            </button>
          </span>
        ) : (
          "Not connected"
        )}
      </p>
    </div>
    <button
      className="theme-toggle"
      onClick={() => setIsDarkTheme((prev) => !prev)}
    >
      {isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
    </button>
  </header>

  <main className="app-main">
    <div className="app-content">
      <section className="app-section">
        <h2>Upload Files</h2>
        <FileUpload
          account={account}
          provider={provider}
          contract={contract}
        />
      </section>
      <section className="app-section">
        <h2>Retrieve Files</h2>
        <Display contract={contract} account={account} />
      </section>
    </div>
  </main>

  <div className="app-actions">
    {!modalOpen && (
      <button
        className="btn-primary share-btn"
        onClick={() => setModalOpen(true)}
      >
        Share
      </button>
    )}
    {modalOpen && (
      <Modal setModalOpen={setModalOpen} contract={contract}></Modal>
    )}
  </div>

  <footer className="app-footer">
    <p>Decentralized Cloud Storage &copy; 2024.</p>
  </footer>
</div>

  
  );
}

export default App;

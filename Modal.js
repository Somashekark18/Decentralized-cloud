import { useEffect, useState } from "react";
import "./Modal.css";

const Modal = ({ setModalOpen, contract }) => {
  // State to capture the address input value
  const [address, setAddress] = useState("");

  const sharing = async () => {
    console.log("Address being read:", address); // Log the address being read

    if (!address) {
      alert("Please enter a valid address.");
      return;
    }

    try {
      await contract.allow(address);
      setModalOpen(false);
    } catch (error) {
      alert("Error while sharing access: " + error.message);
    }
  };

  useEffect(() => {
    const accessList = async () => {
      try {
        const addressList = await contract.shareAccess();
        let select = document.querySelector("#selectNumber");
        const options = addressList;

        for (let i = 0; i < options.length; i++) {
          let opt = options[i];
          let e1 = document.createElement("option");
          e1.textContent = opt;
          e1.value = opt;
          select.appendChild(e1);
        }
      } catch (error) {
        console.error("Error fetching access list:", error);
      }
    };
    contract && accessList();
  }, [contract]);

  return (
    <div className="modalBackground">
      <div className="modalContainer">
        <div className="modalHeader">
          <h2 className="title">Share Access</h2>
          <button
            className="closeBtn"
            onClick={() => setModalOpen(false)}
          >
            &times;
          </button>
        </div>
        <div className="modalBody">
          <input
            type="text"
            className="address"
            placeholder="Enter Address"
            value={address} // Bind the state value to the input field
            onChange={(e) => setAddress(e.target.value)} // Update the state on input change
            required
          />
          <select id="selectNumber">
            <option className="address">People With Access</option>
          </select>
        </div>
        <div className="modalFooter">
          <button
            onClick={() => setModalOpen(false)}
            className="cancelBtn"
          >
            Cancel
          </button>
          <button
            onClick={sharing}
            className="shareBtn"
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

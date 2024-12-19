import { useEffect, useState } from "react";
import "./Display.css";
import axios from "axios";

const Display = ({ contract, account }) => {
  const [data, setData] = useState([]);

  const getdata = async () => {
    let dataArray;
    const Otheraddress = document.querySelector(".address").value;

    try {
      if (Otheraddress) {
        dataArray = await contract.display(Otheraddress);
      } else {
        dataArray = await contract.display(account);
      }
    } catch (e) {
      alert("You don't have access");
      return;
    }

    if (dataArray && dataArray.length > 0) {
      const files = dataArray.map((item) => {
        const ipfsPath = item.startsWith("ipfs://") ? item.substring(6) : item;
        const fileUrl = `${ipfsPath}`;
        const CID = ipfsPath.substring(34); // Extract CID

        return { fileUrl, CID };
      });

      setData(files);
    } else {
      alert("No files to display");
    }
  };

  const handleClick = async (fileUrl) => {
    const width = 800;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    const popupWindow = window.open(
      "",
      "FilePopup",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (popupWindow) {
      try {
        const response = await axios.head(fileUrl);
        const mimeType = response.headers["content-type"];

        let content;
        if (mimeType.startsWith("image/")) {
          content = `<img src="${fileUrl}" style="max-width:100%; max-height:100%; display:block;" />`;
        } else if (mimeType.startsWith("video/")) {
          content = `<video src="${fileUrl}" controls style="max-width:100%; max-height:100%; display:block;"></video>`;
        } else if (mimeType.startsWith("audio/")) {
          content = `<audio src="${fileUrl}" controls style="width:100%;"></audio>`;
        } else if (mimeType === "application/pdf") {
          content = `<iframe src="${fileUrl}" style="width:100%; height:100%; border:none;"></iframe>`;
        } else {
          content = `<p>File cannot be previewed. <a href="${fileUrl}" target="_blank" rel="noopener noreferrer">Download</a></p>`;
        }

        popupWindow.document.write(
          `<html><body style="margin:0; overflow:hidden;">${content}</body></html>`
        );
      } catch (error) {
        popupWindow.document.write(
          `<html><body style="margin:20px; color:red;">Error: Unable to load the file.</body></html>`
        );
      }
    }
  };

  return (
    <div className="display-container">
  <div className="file-list">
    {data.map(({ fileUrl, CID }, index) => (
      <button
        key={index}
        className="file-button"
        onClick={() => handleClick(fileUrl)}
      >
        {CID}
      </button>
    ))}
  </div>
  <div className="input-container">
    <input
      type="text"
      placeholder="Enter Address"
      className="address"
    />
    <button className="button" onClick={getdata}>
      Get Data
    </button>
  </div>
</div>

  );
};

export default Display;

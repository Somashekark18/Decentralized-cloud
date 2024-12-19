// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EncryptionKeyStorage {
    // Struct to hold key data
    struct EncryptionKey {
        bytes32 key; // AES key (256 bits)
        bytes16 iv;  // Initialization Vector (128 bits)
        string description; // Description or label for the key
    }

    mapping(bytes32 => EncryptionKey) private keys;

    event KeyStored(bytes32 indexed identifier, string description);

    function storeEncryptionKey(
        bytes32 identifier,
        bytes32 key,
        bytes16 iv,
        string memory description
    ) public {
        require(identifier != bytes32(0), "Identifier cannot be empty");
        require(key != bytes32(0), "Key cannot be empty");
        require(iv != bytes16(0), "IV cannot be empty");

        keys[identifier] = EncryptionKey(key, iv, description);

        emit KeyStored(identifier, description);
    }

    function getEncryptionKey(bytes32 identifier)
        public
        view
        returns (bytes32 key, bytes16 iv, string memory description)
    {
        EncryptionKey memory encryptionKey = keys[identifier];
        require(encryptionKey.key != bytes32(0), "Key not found");
        return (encryptionKey.key, encryptionKey.iv, encryptionKey.description);
    }
}

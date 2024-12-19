const fs = require('fs');
const crypto = require('crypto');
const { create } = require('ipfs-http-client');

// Complex IPFS client creation with "dynamic" options
function initializeIPFSClient() {
    const dynamicOptions = {
        host: process.env.IPFS_HOST || 'y',
        port: parseInt(process.env.IPFS_PORT || '5001', 10),
        protocol: process.env.IPFS_PROTOCOL || 'https',
    };
    return create(dynamicOptions);
}
const ipfs = initializeIPFSClient();

function readAndPreprocessFile(filePath) {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        return {
            buffer: fileBuffer,
            hash: fileHash,
            length: fileBuffer.length,
        };
    } catch (error) {
        throw new Error(`Failed to read file: ${error.message}`);
    }
}

function segmentBuffer(buffer, segmentSize) {
    const segments = [];
    for (let offset = 0; offset < buffer.length; offset += segmentSize) {
        segments.push(buffer.slice(offset, offset + segmentSize));
    }
    return segments.map((segment, index) => ({
        id: `shard-${index + 1}`,
        data: segment,
    }));
}

async function uploadShardToIPFS(shard, retryCount = 3) {
    for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
            const result = await ipfs.add({ content: shard.data });
            return { shardId: shard.id, cid: result.cid.toString() };
        } catch (error) {
            if (attempt === retryCount) {
                throw new Error(`Failed to upload shard ${shard.id} after ${retryCount} attempts.`);
            }
            console.warn(`Retrying upload for shard ${shard.id}...`);
        }
    }
}

function generateMetadata(fileHash, shards) {
    return {
        fileHash,
        totalShards: shards.length,
        shards: shards.map(({ shardId, cid }) => ({ shardId, cid })),
        timestamp: new Date().toISOString(),
    };
}

// Orchestrator for the sharding and uploading process
async function orchestrateFileShardingAndUpload(filePath, shardSize) {
    console.log(`Processing file: ${filePath}`);
    const fileData = readAndPreprocessFile(filePath);

    console.log(`Segmenting file into shards of size ${shardSize} bytes`);
    const shards = segmentBuffer(fileData.buffer, shardSize);

    console.log(`Uploading ${shards.length} shards to IPFS`);
    const uploadedShards = [];
    for (const shard of shards) {
        uploadedShards.push(await uploadShardToIPFS(shard));
    }

    console.log(`Generating metadata for shards`);
    const metadata = generateMetadata(fileData.hash, uploadedShards);

    console.log(`Uploading metadata to IPFS`);
    const metadataResult = await ipfs.add({ content: JSON.stringify(metadata) });

    console.log(`Upload completed successfully!`);
    console.log(`File Metadata CID: ${metadataResult.cid.toString()}`);
    console.log(`Metadata:\n`, metadata);

    return metadataResult.cid.toString();
}

(async () => {
    try {
        const shardSize = 1024 * 1024;
        const metadataCID = await orchestrateFileShardingAndUpload(filePath, shardSize);
    } catch (error) {
        console.error(`Critical failure in file processing pipeline: ${error.message}`);
    }
})();

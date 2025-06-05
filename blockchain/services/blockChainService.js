import { configDotenv } from "dotenv";
configDotenv();
import { ethers } from "ethers";
import contractJson from "../contractABI.json" with { type: "json" };
const contractABI = contractJson.abi;

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
console.log("Your provider", provider);
console.log("Provider link", process.env.BLOCKCHAIN_RPC_URL);
console.log("Your private key", process.env.BLOCKCHAIN_PRIVATE_KEY);
const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY);
console.log("Wallet address in use:", await wallet.getAddress());
const signer = wallet.connect(provider);
console.log("From Environment variables",process.env.CONTRACT_ADDRESS);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  signer
);

const storeAssessmentHash = async (hash, assessmentCode) => {
  try {
    if (!/^[0-9a-fA-F]+$/.test(hash)) {
      throw new Error(`Invalid hash format: ${hash}. Hash must contain only hexadecimal characters (0-9, a-f, A-F).`);
    }
    let paddedHash = hash.padStart(64, '0');

    if (paddedHash.length > 64) {
        paddedHash = paddedHash.substring(0, 64);
        console.warn(`Hash was too long and has been truncated to: ${paddedHash}`);
    }
    
    // const bytes32Hash = ethers.getBytes("0x" + paddedHash);
    console.log("Simple hash", hash);
    console.log("Padded hash", paddedHash);
    const bytes32Hash=ethers.hexlify("0x" + paddedHash);
    console.log("bytes 32 hash", bytes32Hash);
    const address=await contract.owner();
    console.log("The address returned is",address);
    const tx = await contract.storeAssessment(assessmentCode, bytes32Hash);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error("Error while storing assessment hash:", error);
    throw error;
  }
};

const verifyAssessmentHash = async (hash, assessmentCode) => {
  try {
    if (!/^[0-9a-fA-F]+$/.test(hash)) {
      throw new Error(`Invalid hash format: ${hash}. Hash must contain only hexadecimal characters (0-9, a-f, A-F).`);
    }

    let paddedHash = hash.padStart(64, '0');
    if (paddedHash.length > 64) {
      paddedHash = paddedHash.substring(0, 64);
      console.warn(`Hash was too long and has been truncated to: ${paddedHash}`);
    }

    const bytes32Hash = ethers.getBytes("0x" + paddedHash);

    const isValid = await contract.verifyAssessment(assessmentCode, bytes32Hash);
    return isValid;
  } catch (error) {
    console.error("Error while verifying assessment hash:", error);
    throw error;
  }
};

export { storeAssessmentHash, verifyAssessmentHash };
import { configDotenv } from "dotenv";
configDotenv();

import { ethers } from "ethers";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const contractJson = require("../contractABI.json");
const contractABI = contractJson.abi;

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY, provider);
const walletAddress = await wallet.getAddress();

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  wallet
);

const storeAssessmentHash = async (hash, assessmentCode) => {
  try {
    if (!/^[0-9a-fA-F]+$/.test(hash)) {
      throw new Error(
        `Invalid hash format: ${hash}. Must be a hex string without 0x.`
      );
    }

    let paddedHash = hash.padStart(64, "0").substring(0, 64);
    const bytes32Hash = ethers.getBytes("0x" + paddedHash);

    console.log("Storing assessment...");
    const tx = await contract.storeAssessment(assessmentCode, bytes32Hash);
    await tx.wait();

    console.log("Transaction successful:", tx.hash);
    return tx.hash;
  } catch (error) {
    console.error("❌ Error while storing assessment hash:", error);
    throw error;
  }
};

const verifyAssessmentHash = async (hash, assessmentCode) => {
  try {
    if (!/^[0-9a-fA-F]+$/.test(hash)) {
      throw new Error(
        `Invalid hash format: ${hash}. Must be a hex string without 0x.`
      );
    }

    let paddedHash = hash.padStart(64, "0").substring(0, 64);
    const bytes32Hash = ethers.getBytes("0x" + paddedHash);

    console.log("Verifying assessment...");
    const isValid = await contract.verifyAssessment(
      assessmentCode,
      bytes32Hash
    );

    console.log("Verification result:", isValid);
    return isValid;
  } catch (error) {
    console.error("❌ Error while verifying assessment hash:", error);
    throw error;
  }
};

export { storeAssessmentHash, verifyAssessmentHash };

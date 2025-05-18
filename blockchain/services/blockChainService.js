import { configDotenv } from "dotenv";
configDotenv();
import { ethers } from "ethers";
import contractABI from "../contractABI.json";

const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
const wallet = new ethers.Wallet(process.env.BLOCKCHAIN_PRIVATE_KEY);
const signer = wallet.connect(provider);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  contractABI,
  signer
);

const storeAssessmentHash = async (hash, assessmentCode) => {
  try {
    const tx = await contract.storeAssessment(assessmentCode, hash);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error("Error while storing assessment hash:", error);
    throw error;
  }
};

const verifyAssessmentHash = async (hash, assessmentCode) => {
  try {
    const isValid = await contract.verifyAssessment(assessmentCode, hash);
    return isValid;
  } catch (error) {
    console.error("Error while verifying assessment hash:", error);
    throw error;
  }
};

export { storeAssessmentHash, verifyAssessmentHash };

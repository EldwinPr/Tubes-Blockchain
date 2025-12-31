const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Define the initial Oracle address
  // For now, we set it to the deployer itself so we can test easily.
  // In production, this would be the address of your Oracle Service wallet.
  const oracleAddress = deployer.address; 

  const SalesManager = await hre.ethers.getContractFactory("SalesManager");
  const salesManager = await SalesManager.deploy(oracleAddress);

  await salesManager.waitForDeployment();

  const address = await salesManager.getAddress();
  console.log("SalesManager deployed to:", address);
  console.log("Oracle Address set to:", oracleAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

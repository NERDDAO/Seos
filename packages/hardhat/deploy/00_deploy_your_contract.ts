import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "ethers";

const INITIAL_SUPPLY = BigNumber.from("100000000000000000000000000"); // 100 million tokens with 18 decimal places

/**

Deploys a contract named "Acid" using the deployer account and
constructor arguments set to the initial supply of tokens
@param hre HardhatRuntimeEnvironment object.
*/
const deployAcid: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  await deploy("Acid", {
    from: deployer,
    // Contract constructor arguments
    args: [INITIAL_SUPPLY],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  // const acid = await hre.ethers.getContract("Acid", deployer);
};

export default deployAcid;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Acid
deployAcid.tags = ["Acid"];

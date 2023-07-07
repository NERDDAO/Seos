import { useAccount } from "wagmi";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

type pMProps = {
  startingBlock: number;
};

const PositionManager = (props: pMProps) => {
  const { address, isConnected } = useAccount();
  // get position ID from transfer events
  const { startingBlock } = props;

  const { data, error } = useScaffoldEventHistory({
    contractName: "FarmMainRegularMinStake",
    eventName: "Transfer",
    fromBlock: BigInt(startingBlock),
    filters: { from: address },
  });

  // const { positionId, position, pendingReward, pool } = props;
  //
  // //parse pending reward into number with 18 decimals
  //
  // const liquidityPool = pool.data ? pool.data.liquidity.toString() : "notFound";
  //
  // const parsedPendingReward = pendingReward.data ? ethers.utils.formatUnits(pendingReward.data, 18) : "notFound";
  //
  // console.log("POSITIONMANAGER", positionId, position);
  //
  // // Result: ["0x69eF61AFc3AA356e1ac97347119d75cBdAbEF534", 1, 16969625, 481551, 0]
  // //   {
  // //     "components": [
  // //       { "internalType": "address", "name": "uniqueOwner", "type": "address" },
  // //       { "internalType": "uint256", "name": "setupIndex", "type": "uint256" },
  // //       { "internalType": "uint256", "name": "creationBlock", "type": "uint256" },
  // //       { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
  // //       { "internalType": "uint256", "name": "reward", "type": "uint256" }
  return (
    <div>
      <h1>Position Manager{isConnected && address ? ` for ${address}` : ""}</h1>
    </div>
  );
};

export default PositionManager;

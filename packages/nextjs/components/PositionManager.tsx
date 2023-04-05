import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { BigNumber, ethers } from "ethers";

const PositionManager = (props: any) => {
  const { positionId } = props;

  const position = useScaffoldContractRead("FarmMainRegularMinStake", "position", [positionId]);
  const pendingReward = useScaffoldContractRead("FarmMainRegularMinStake", "calculateFreeFarmingReward", [
    positionId,
    true,
  ]);

  //parse pending reward into number with 18 decimals

  const parsedPendingReward = pendingReward.data ? ethers.utils.formatUnits(pendingReward.data, 18) : "notFound";

  console.log("POSITIONMANAGER", positionId, position);

  // Result: ["0x69eF61AFc3AA356e1ac97347119d75cBdAbEF534", 1, 16969625, 481551, 0]
  //   {
  //     "components": [
  //       { "internalType": "address", "name": "uniqueOwner", "type": "address" },
  //       { "internalType": "uint256", "name": "setupIndex", "type": "uint256" },
  //       { "internalType": "uint256", "name": "creationBlock", "type": "uint256" },
  //       { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
  //       { "internalType": "uint256", "name": "reward", "type": "uint256" }
  return (
    <div>
      <h1>Position Manager</h1>
      <p>Position ID: {positionId}</p>
      <p>Position: {position.data ? position.data.toString() : "notFound"}</p>
      {
        //need to make this from big number into numbers with 18 decimals//
      }
      <p>Pending Reward: {pendingReward.data ? parsedPendingReward : "notFound"} OS</p>
    </div>
  );
};

export default PositionManager;

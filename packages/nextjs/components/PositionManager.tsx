import { useAccount, usePublicClient, useContractRead } from "wagmi";
import { useScaffoldEventHistory, useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import INonfungiblePositionManager from '@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json'
import { getContract } from "viem";
import { } from "@uniswap/v3-sdk"
import { } from "@uniswap/sdk-core"

type pMProps = {
  startingBlock: number;
  lpTokenAddress: `0x${string}`;
  positionId: number;
};

type Slot0ReturnType = {
  sqrtPriceX96: number | number[];
  tick: number;
  observationIndex: number;
  observationCardinality: number;
  observationCardinalityNext: number;
  feeProtocol: number;
  unlocked: boolean;
};

type addLiquidityArgs = {
  amount0: number;
  amount1: number;
  amount0Min: number;
  amount1Min: number;
  address: string;

}

const PositionManager = (props: pMProps) => {
  const { address, isConnected } = useAccount();
  // get position ID from transfer events
  const { startingBlock, lpTokenAddress, positionId } = props;
  const ethPrice = useGlobalState(state => state.nativeCurrencyPrice);
  const { data, error } = useScaffoldEventHistory({
    contractName: "FarmMainRegularMinStake",
    eventName: "Transfer",
    fromBlock: BigInt(startingBlock),
    filters: { from: address },
  });

  // TODO: GET position id from transfer events

  const publicClient = usePublicClient()

  const poolContract = getContract(
    {
      address: lpTokenAddress,
      abi: IUniswapV3PoolABI.abi,
      publicClient
    })

  const positionManagerContract = getContract({
    address: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    abi: INonfungiblePositionManager.abi,
    publicClient
  })

  const result = useContractRead({
    address: poolContract.address,
    functionName: "slot0",
    args: [],
    abi: poolContract.abi,
  })

  // Example function call
  // Mapping result to the TypeScript interface
  // TODO: Fix types on contract to avoid error here
  const mappedResult: Slot0ReturnType = {
    sqrtPriceX96: result.data ? result.data[0] as number : 0,
    tick: result.data ? result.data[1] as number : 0,
    observationIndex: result.data ? result.data[2] as number : 0,
    observationCardinality: result.data ? result.data[3] as number : 0,
    observationCardinalityNext: result.data ? result.data[4] as number : 0,
    feeProtocol: result.data ? result.data[5] as number : 0,
    unlocked: result.data ? result.data[6] as boolean : false,
  };
  console.log("mappedResult", mappedResult)

  //TODO: 1) get LP token information [done]
  //           -- TOken address + user balance <---- 
  //           -- display user balannce
  //           -- functions:
  //           handleAMmountChange{
  //           -- get price of ether
  //           -- determine price of token using pool information 
  //           -- change ammound based on price
  //           }
  //            handleApprove{
  //            check approval status
  //            run approvals for missing tokens
  //            }
  //
  // read position data from contract
  const { data: positionData, isFetching: positionIsFetching, error: positionError } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "position",
    args: [BigInt(positionId)],
  });

  const tokenId = positionData?.tokenId;

  const position = useContractRead({
    address: positionManagerContract.address,
    functionName: "positions",
    args: [{ tokenId: BigInt(tokenId ? tokenId : -1) }],
    abi: positionManagerContract.abi,
  })
  return (
    <div>
      <h1>Position Manager{isConnected && address ? ` for ${address}` : ""}</h1>
      ETH PRICE{ethPrice}
      <form>
        <label>
          Ammount 1:
          <input type="text" name="positionId" />
        </label>
        <label>
          Ammount 2:
          <input type="text" name="positionId" />
        </label>
      </form>
    </div>
  );
};
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
// //       { "internalType": "uint256", "name": "rewa ffrd", "type": "uint256" }

export default PositionManager;

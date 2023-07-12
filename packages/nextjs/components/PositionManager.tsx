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
//DEV NOTE::
//Logic for position manager component: 
// 1) get position id from transfer events
// 2) get pool information from lpTokenAddres
// 3b) get token balances from user address
// 3) get position information from position ids
// 4) display position information
//
//
//TODO: 
//1) Smart contract queries
//- get position id from transfer events[x]
//- get pool information from lpTokenAddress[x]
//- get token balances from user address[ ]
//- get position information from position ids[ ]
//2) UI inputs
//3) UI display
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
const PositionManager = (props: pMProps) => {
  // chain setup
  const publicClient = usePublicClient()
  const { address, isConnected } = useAccount();
  const { startingBlock, lpTokenAddress } = props;
  const ethPrice = useGlobalState(state => state.nativeCurrencyPrice);
  let positionId = BigInt(0);
  // get position ID from transfer events

  const { data, error } = useScaffoldEventHistory({
    contractName: "FarmMainRegularMinStake",
    eventName: "Transfer",
    fromBlock: BigInt(startingBlock),
    filters: { from: address },
  });

  //
  // TODO: GET position id from transfer events
  // note: a user can have multiple ids -> store them in array

  if (data) {
    positionId = data[0].args["positionId"]
    console.log(data)
  }
  // NOTE: Using both getContract and useContractRead to get pool information is a bit redundant. should delete one of them
  //
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

  const slotResult = useContractRead({
    address: poolContract.address,
    functionName: "slot0",
    args: [],
    abi: poolContract.abi,
  })

  const { data: positionData, isFetching: positionIsFetching, error: positionError } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "position",
    args: [positionId],
  });

  const tokenId = positionData?.tokenId;

  const position = useContractRead({
    address: positionManagerContract.address,
    functionName: "positions",
    args: [{ tokenId: BigInt(tokenId ? tokenId : -1) }],
    abi: positionManagerContract.abi,
  })

  // Example function call
  // Mapping result to the TypeScript interface
  // TODO: Fix types on contract to avoid error here
  const mappedResult: Slot0ReturnType = {
    sqrtPriceX96: slotResult.data ? slotResult.data[0] as number : 0,
    tick: slotResult.data ? slotResult.data[1] as number : 0,
    observationIndex: slotResult.data ? slotResult.data[2] as number : 0,
    observationCardinality: slotResult.data ? slotResult.data[3] as number : 0,
    observationCardinalityNext: slotResult.data ? slotResult.data[4] as number : 0,
    feeProtocol: slotResult.data ? slotResult.data[5] as number : 0,
    unlocked: slotResult.data ? slotResult.data[6] as boolean : false,
  };
  console.log("mappedResult", mappedResult)


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

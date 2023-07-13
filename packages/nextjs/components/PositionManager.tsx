import { } from "@uniswap/sdk-core";
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import INonfungiblePositionManager from '@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json';
import { } from "@uniswap/v3-sdk";
import { getContract } from "viem";
import { useAccount, useContractRead, usePublicClient, useBalance } from "wagmi";
import { useAccountBalance, useScaffoldContractRead, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";

//TODO: 0) get LP token information [done]
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

type pMProps = {
  startingBlock: number;
  lpTokenAddress: `0x${string}`;
};

type Slot0ReturnType = {
  sqrtPriceX96: number | number[];
  tick: number,
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

  const publicClient = usePublicClient()
  const { address, isConnected } = useAccount();
  // get position ID from transfer events
  const { startingBlock, lpTokenAddress } = props;
  const ethPrice = useGlobalState(state => state.nativeCurrencyPrice);

  const vbtc = "0xe1406825186d63980fd6e2ec61888f7b91c4bae4"
  // TODO: Get ussr balances

  const testBalance = useBalance({ address: address, token: vbtc });
  console.log("user balance", testBalance, address, lpTokenAddress)

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

  const { data, error } = useScaffoldEventHistory({
    contractName: "FarmMainRegularMinStake",
    eventName: "Transfer",
    fromBlock: BigInt(startingBlock),
    filters: { from: address },
  });

  // TODO: GET position id from transfer events

  let positionId = BigInt(0);
  if (data) {
    positionId = data[0]
    console.log(data)
  }

  const sl0tResult = useContractRead({
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
    sqrtPriceX96: sl0tResult.data ? sl0tResult.data[0] as number : 0,
    tick: sl0tResult.data ? sl0tResult.data[1] as number : 0,
    observationIndex: sl0tResult.data ? sl0tResult.data[2] as number : 0,
    observationCardinality: sl0tResult.data ? sl0tResult.data[3] as number : 0,
    observationCardinalityNext: sl0tResult.data ? sl0tResult.data[4] as number : 0,
    feeProtocol: sl0tResult.data ? sl0tResult.data[5] as number : 0,
    unlocked: sl0tResult.data ? sl0tResult.data[6] as boolean : false,
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

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
  mainToken: `0x${string}`;
  involvingETH: boolean;
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
  const { startingBlock, lpTokenAddress, mainToken, involvingETH } = props;
  const ethPrice = useGlobalState(state => state.nativeCurrencyPrice);
  let positionId = BigInt(0);
  const userAddress = address as string;
  const { data: tranferData, error } = useScaffoldEventHistory({
    contractName: "FarmMainRegularMinStake",
    eventName: "Transfer",
    fromBlock: BigInt(startingBlock),
    filters: { from: address },
  });
  // TODO: map different position id from transfer events

  if (tranferData && tranferData.length > 0) {
    positionId = BigInt(tranferData[0].args.positionId);

  }

  const poolContract = {
    address: lpTokenAddress,
    abi: IUniswapV3PoolABI.abi,
    publicClient
  }
  const positionManagerContract = {
    address: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    abi: INonfungiblePositionManager.abi,
    publicClient
  }

  //QUERY THE CHAIN
  const sl0tResult = useContractRead({
    address: poolContract.address,
    functionName: "slot0",
    args: [],
    abi: poolContract.abi,
  });

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


  // BALANCE CHECK 
  let mainTokenBalance: number | null = 0;
  const TokenBalance = useBalance({ address: address, token: mainToken });
  if (TokenBalance) {
    mainTokenBalance = Number(TokenBalance.data?.value)
  }

  // TODO: Hanle pools that do not have ETH

  let userBalance: number | null = 0;
  const ethBalance = useAccountBalance(
    userAddress);
  if (involvingETH === true) {

    userBalance = ethBalance.balance;

  }
  // POSITION DATA
  const { data: positionData, isFetching: positionIsFetching, error: positionError } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "position",
    args: [positionId],
  });

  // Example function call

  ///CONSOLE LOGGING---------------------------------------------
  console.log("user balance 👨:", mainTokenBalance, address, lpTokenAddress)
  console.log("mappedResult 🦖: ", mappedResult)
  console.log("position🐝", positionData)
  console.log(tranferData, "🐮transfer data")
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
export default PositionManager;

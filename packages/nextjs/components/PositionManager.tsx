import { useState, useEffect } from "react";
import { } from "@uniswap/sdk-core";
import QuoterV2 from '@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import INonfungiblePositionManager from '@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json';
import { } from "@uniswap/v3-sdk";
import { useAccount, useContractRead, usePublicClient, useBalance, erc20ABI } from "wagmi";
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
  const [amounts, setAmounts] = useState({ amount0: 0, amount1: 0 });
  const publicClient = usePublicClient()
  const { address, isConnected } = useAccount();
  // get position ID from transfer events
  const ethPrice = useGlobalState(state => state.nativeCurrencyPrice);
  let positionId = BigInt(0);
  const userAddress = address as string;

  const { startingBlock, lpTokenAddress, mainToken, involvingETH } = props;

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
  // Position QUERY
  const positionQuery = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "position",
    args: [positionId],
  });

  const poolContract = {
    address: lpTokenAddress,
    abi: IUniswapV3PoolABI.abi,
    publicClient
  }
  // FETCH TOKEN DECIMALS
  const ETHDECIMALS = 18;
  let token0Decimals = 0
  const tokenQuery = useContractRead({
    address: mainToken,
    functionName: "decimals",
    abi: erc20ABI,
  });
  if (tokenQuery.data) {
    token0Decimals = tokenQuery.data as number;
  }
  //QUERY THE POOL STATUS
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
  // CONVERT SLOT0 TICK TO PRICE  FOR tokens



  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, slot: "slot0" | "slot1") => {
    let input = Number(e.target.value)
    const ttp = Number(mappedResult.sqrtPriceX96) ** 2 / 196 ** 2;
    const calculatedAmount = input * ttp;
    if (slot === "slot0") {
      setAmounts({ amount0: input, amount1: calculatedAmount })
    }
    else {
      setAmounts({ amount0: calculatedAmount, amount1: input })
    }
  };


  function handleAmmountChange() {

  };

  function handleApprove() { };
  function handleAddLiquidity() { };
  function handleRemoveLiquidity() { };
  function handleCollectFees() { };
  ///CONSOLE LOGGING---------------------------------------------
  console.log("eth balance 🐷:", ethBalance)
  console.log("slot0 🐸:", sl0tResult)
  console.log("user balance 👨:", mainTokenBalance, address, lpTokenAddress)
  console.log("mappedResult 🦖: ", mappedResult)
  console.log("position🐝", positionQuery)
  console.log(tranferData, "🐮transfer data")
  console.log("Decimals", token0Decimals)
  ///-------------------------------------------------------------
  return (
    <div>
      <h1>Position Manager{isConnected && address ? ` for ${address}` : ""}</h1>
      ETH PRICE{ethPrice}
      <form>
        <label>
          Ammount 1:
          <input type="text" name="positionId" defaultValue={amounts.amount0} />
        </label>
        <br />
        <label>
          Ammount 2:
          <input type="text" name="positionId" defaultValue={amounts.amount1} />
        </label>
      </form>
    </div>
  );
};
export default PositionManager;

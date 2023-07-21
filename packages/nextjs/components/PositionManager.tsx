import { useState, useEffect } from "react";
import { } from "@uniswap/sdk-core";
import QuoterV2 from '@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import INonfungiblePositionManager from '@uniswap/v3-periphery/artifacts/contracts/interfaces/INonfungiblePositionManager.sol/INonfungiblePositionManager.json';
import { } from "@uniswap/v3-sdk";
import { useAccount, useContractRead, useContractWrite, usePublicClient, useBalance, erc20ABI, usePrepareContractWrite } from "wagmi";
import { useAccountBalance, useScaffoldContractRead, useScaffoldEventHistory, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { Button } from "@mui/material";
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
  pid: number;
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

  const { startingBlock, lpTokenAddress, mainToken, involvingETH, pid } = props;

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
    const ttp = Number(mappedResult.sqrtPriceX96) ** 2 / 2 ** 192;
    if (slot === "slot0") {

      const calculatedAmount = input * ttp;
      setAmounts({ amount0: input, amount1: calculatedAmount })
    }
    else {

      const calculatedAmount = input / ttp;
      setAmounts({ amount0: calculatedAmount, amount1: input })
    }
  };

  // TODO: Handle approval for tokens
  const farmContractAddress = "0x8f5adC58b32D4e5Ca02EAC0E293D35855999436C"

  let approvalArray = { token0ApprovedFor: BigInt, token1ApprovedFor: BigInt }


  const { config } = usePrepareContractWrite({
    address: mainToken,
    functionName: "approve",
    args: [farmContractAddress, BigInt(Math.floor(amounts.amount0 * (10 ** 18)))],
    abi: erc20ABI,
  })
  const { data, isLoading, isSuccess, write } = useContractWrite(config)

  const handleClickApprove = () => {
    if (write && amounts.amount0 > 0) { // check if write is defined
      write();
    } else {
      console.error("Enter an amount to approve");
    }
  };

  /* TODO:
  -> 
  -> Make sure we're using the farmRegular contract
  -> Make sure ammount 0 = OS and amount 1 = ETH
  -> Check that amount <= than balance before sending tx
  -> Check that approval >= balance before sending tx
      */

  const { data: LiquidityData, isLoading: isLiquidityLoading, isSuccess: isLiquiditySuccess, write: writeLiquidity } = useScaffoldContractWrite(
    {
      contractName: "FarmMainRegularMinStake",
      functionName: "openPosition", //or whatever the fuck its called
      args: [{
        setupIndex: BigInt(pid),
        amount0: BigInt(Math.floor(amounts.amount0 * (10 ** 18))),
        amount1: BigInt(Math.floor(amounts.amount1 * (10 ** 18))),
        positionOwner: address as string,
        amount0Min: BigInt(Math.floor((amounts.amount0 ** 0.95) * (10 ** 18))),
        amount1Min: BigInt(Math.floor((amounts.amount1 ** 0.95) * (10 ** 18))),
      }
      ],
      value: `${0}`
    })

  const handleClickAddLiquidity = () => {
    if (amounts.amount0 > 0)
      writeLiquidity();
  };


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
          <input type="text" name="positionId" value={amounts.amount0} onChange={
            (e) => handleAmountChange(e, "slot0")
          } />
        </label>
        <br />
        <label>
          Ammount 2:
          <input type="text" name="positionId" value={amounts.amount1} onChange={
            (e) => handleAmountChange(e, "slot1")} />
        </label>
        <Button onClick={handleClickApprove}>Approve</Button>
        <Button onClick={handleClickAddLiquidity}>Add Liquidity</Button>
      </form>
    </div>
  );
};
export default PositionManager;

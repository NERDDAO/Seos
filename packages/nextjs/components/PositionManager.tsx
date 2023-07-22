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
  const [amounts, setAmounts] = useState({ float0: 0, float1: 0, amount0: 0n, amount1: 0n, amount0Min: 0n, amount1Min: 0n });
  const publicClient = usePublicClient()
  const { address, isConnected } = useAccount();
  // get position ID from transfer events
  const ethPrice = useGlobalState(state => state.nativeCurrencyPrice);
  let positionId = BigInt(0);
  const userAddress = address as string;

  const { startingBlock, lpTokenAddress, mainToken, involvingETH, pid } = props;

  const { data: transferData, error } = useScaffoldEventHistory({
    contractName: "FarmMainRegularMinStake",
    eventName: "Transfer",
    fromBlock: BigInt(startingBlock),
    filters: { from: address },
  });
  // TODO: map different position id from transfer events
  useEffect(() => {
    const filteredData = transferData?.filter((event) => event.args.from !== address);
    console.log(filteredData, "IM RACING HAMSTERS");
    positionId = BigInt(0);
    if (transferData && transferData.length > 0) {
      positionId = BigInt(transferData[0].args.positionId);
      console.log(positionId, "positionId");
    }
  }, [transferData, address]);
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
  let mainTokenBalance: number = 0;
  const TokenBalance = useBalance({ address: address, token: mainToken });
  if (TokenBalance) {
    mainTokenBalance = Number(TokenBalance.data?.value)
  }

  // TODO: Hanle pools that do not have ETH

  let userBalance: number = 0;
  const ethBalance = useAccountBalance(
    userAddress);
  if (involvingETH === true && ethBalance.balance) {
    userBalance = ethBalance.balance;
  }
  // CONVERT SLOT0 TICK TO PRICE  FOR tokens
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>, slot: "slot0" | "slot1") => {
    if (slot == "slot0" && Number(e.target.value) > mainTokenBalance || slot == "slot1" && Number(e.target.value) > userBalance) {
      return console.log("insufficient funds");
    }
    let input = Number.parseFloat(e.target.value);
    let bigInput = BigInt(input * 10 ** token0Decimals);
    let amount0Min = BigInt(0);
    let amount1Min = BigInt(0);
    let calculatedAmount = BigInt(0);
    const slippage: number = 0.95
    console.log(input);

    const ttp = Number(mappedResult.sqrtPriceX96) ** 2 / 2 ** 192;

    if (slot === "slot0") {

      calculatedAmount = BigInt(input * ttp * 10 ** ETHDECIMALS);

      amount0Min = BigInt(input * slippage * 10 ** token0Decimals);

      amount1Min = BigInt(input * ttp * slippage * 10 ** ETHDECIMALS);
      setAmounts({ float0: input, float1: input * ttp, amount0: bigInput, amount0Min: amount0Min, amount1: calculatedAmount, amount1Min: amount1Min })
    }
    else {
      bigInput = BigInt(input * 10 ** ETHDECIMALS);
      calculatedAmount = BigInt(input * 1 / ttp * 10 ** token0Decimals);
      amount0Min = BigInt(input * ttp * slippage * 10 ** token0Decimals);
      amount1Min = BigInt(input * 1 / ttp * slippage * 10 ** ETHDECIMALS);
      setAmounts({ float0: input * 1 / ttp, float1: input, amount0: calculatedAmount, amount1: bigInput, amount0Min: amount0Min, amount1Min: amount1Min })
    }
  };

  // TODO: Handle approval for tokens
  const farmContractAddress = "0x129a261afAAe9Fc9AB9D5107e840560d052Cd97E"

  let approvalArray = { token0ApprovedFor: BigInt, token1ApprovedFor: BigInt }


  const { config } = usePrepareContractWrite({
    address: mainToken,
    functionName: "approve",
    args: [farmContractAddress, amounts.amount0],
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
  const { data: LiquidityData, isLoading: isLiquidityLoading, isSuccess: isLiquiditySuccess, write: writeLiquidity } = useScaffoldContractWrite(
    {
      contractName: "FarmMainRegularMinStake",
      functionName: "openPosition",//or whatever the fuck its called
      args: [{
        setupIndex: BigInt(pid),
        amount0: amounts.amount0,
        amount1: amounts.amount1,
        positionOwner: address as string,
        amount0Min: amounts.amount0Min,
        amount1Min: amounts.amount1Min,
      }
      ]
      ,
      value: `${Number(amounts.float1.toFixed(18))}`
    })
  const { data: addData, isLoading: addLoading, isSuccess: isAddSuccess, write: addWrite } = useScaffoldContractWrite(
    {
      contractName: "FarmMainRegularMinStake",
      functionName: "addLiquidity",//or whatever the fuck its called
      args: [
        positionId,
        {
          setupIndex: BigInt(pid),
          amount0: amounts.amount0,
          amount1: amounts.amount1,

          positionOwner: address as string,
          amount0Min: amounts.amount0Min,
          amount1Min: amounts.amount1Min,
        }
      ]
      ,
      value: `${Number(amounts.float1.toFixed(18))}`
    })
  // Liquidity add function picker
  const handleClickAddLiquidity = () => {
    if (positionId !== BigInt(0))
      addWrite()
    else writeLiquidity()
  };


  function handleRemoveLiquidity() { };
  function handleCollectFees() { };
  ///CONSOLE LOGGING---------------------------------------------
  console.log("eth balance 🐷:", ethBalance)
  console.log("slot0 🐸:", sl0tResult)
  console.log("user balance 👨:", mainTokenBalance, address, lpTokenAddress)
  console.log("mappedResult 🦖: ", mappedResult)
  console.log("position🐝", positionQuery)
  console.log(transferData, "🐮transfer data")
  console.log("Decimals", token0Decimals)
  ///-------------------------------------------------------------

  return (
    <div>
      <h1>Position Manager{isConnected && address ? ` for ${address}` : ""}</h1>
      ETH PRICE{ethPrice}
      <form>
        <label>
          Ammount 1:
          <input type="number" name="positionId" value={amounts.float0} onChange={
            (e) => handleAmountChange(e, "slot0")
          } />
        </label>
        <br />
        <label>
          Ammount 2:
          <input type="number" name="positionId" value={amounts.float1} onChange={
            (e) => handleAmountChange(e, "slot1")} />
        </label>
        <Button onClick={handleClickApprove}>Approve</Button>
        <Button onClick={handleClickAddLiquidity}>Add Liquidity</Button>
      </form>
    </div>
  );
};
export default PositionManager;

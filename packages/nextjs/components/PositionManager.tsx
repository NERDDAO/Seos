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
import { Card } from "@mui/material";
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

  const { data: transferData, error } = useScaffoldEventHistory({
    contractName: "FarmMainRegularMinStake",
    eventName: "Transfer",
    fromBlock: BigInt(startingBlock),
    filters: { from: address },
  });
  // TODO: map different position id from transfer events

  useEffect(() => {
    if (isConnected === true) {
      const filteredData = transferData?.filter((event) => event.args.from !== address);
      console.log(filteredData, "IM RACING HAMSTERS");
      if (transferData && transferData.length > 0) {
        positionId = BigInt(transferData[0].args.positionId);
        console.log(positionId, "positionId");
      }
      else {
        positionId = BigInt(0);
      }
    }
    else {
      positionId = BigInt(0);
    }
  }, [transferData, address, isConnected]);

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
    mainTokenBalance = Number(TokenBalance.data?.value) / 10 ** token0Decimals;
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
  const farmContractAddress = "0x129a261afAAe9Fc9AB9D5107e840560d052Cd97E"

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
  -> AddTo position
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
        amount0Min: BigInt(Math.floor((amounts.amount0 * 0.95) * (10 ** 18))),
        amount1Min: BigInt(Math.floor((amounts.amount1 * 0.95) * (10 ** 18))),
      }
      ],
      value: `${amounts.amount1}`
    })

  const handleClickAddLiquidity = () => {
    if (amounts.amount0 > 0)
      writeLiquidity();
  };


  //TODO: Figure out the ammount i need to send to withdraw
  const { data: wData, write: wWrite } = useScaffoldContractWrite({
    contractName: "FarmMainRegularMinStake",
    functionName: "withdrawLiquidity",
    args: [{
      positionId: positionId,
      removedLiquidity: amounts.amount0,
      burnData: '0x',
    }]

  }
  )

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
    <Card className="bg-gradient-to-r from-gray-400 to-black-500 hover:from-gray-100 hover:to-black-100 text-black font-bold py-2 px-6 rounded">
      <h1 className="text-3xl font-bold text-center pb-5">Position Manager{isConnected && address ? ` for ${address}` : ""}</h1>
      <div className="grid grid-cols-2 gap-4 p-5 bg-white rounded-xl">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Balances</h2>
          <p>Token Balance: {mainTokenBalance}</p>
          <p>ETH Price: {ethPrice}</p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Manage Position</h2>
          <label className="flex flex-col gap-1">
            <span>Amount 1:</span>
            <input type="text" name="positionId" value={amounts.amount0} onChange={(e) => handleAmountChange(e, "slot0")} className="p-2 rounded border border-gray-200" />
          </label>
          <label className="flex flex-col gap-1">
            <span>Amount 2:</span>
            <input type="text" name="positionId" value={amounts.amount1} onChange={(e) => handleAmountChange(e, "slot1")} className="p-2 rounded border border-gray-200" />
          </label>
          <div className="flex gap-4 mt-4">
            <Button className="bg-gradient-to-r from-gray-400 to-black-500 hover:from-gray-100 hover:to-black-100 text-black font-bold py-2 px-6 rounded" onClick={handleClickApprove}>Approve</Button>
            <Button className="bg-gradient-to-r from-gray-400 to-black-500 hover:from-gray-100 hover:to-black-100 text-black font-bold py-2 px-6 rounded" onClick={handleClickAddLiquidity}>Add Liquidity</Button>
          </div>
        </div>
      </div>
    </Card>
  );

};
export default PositionManager;

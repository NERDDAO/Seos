import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useEthPrice, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { TextField, Button, Grid, Typography, FormControlLabel, Checkbox } from "@material-ui/core";
import BigNumber from "bignumber.js";
import { useAccount, useProvider } from "wagmi";
import { useAccountBalance } from "~~/hooks/scaffold-eth/useAccountBalance";
import { useAppStore } from "~~/services/store/store";
import { UserPositions } from "~~/services/store/slices/querySlice";
import { ethers } from "ethers";
import { parseAmount } from "~~/utils/amountConversionWithHandler";
import { useUniswapPool } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useScaffoldERCWrite } from "~~/hooks/scaffold-eth/useScaffoldERCWrite";
import useAllowance from "~~/hooks/scaffold-eth/useAllowance";

function AddLiquidityForm(props: any) {
  const { lptokenAddress, tickLower, tickUpper, involvingETH, mainTokenAddress } = props;
  const addressZero = ethers.constants.AddressZero;
  const [showPositionOwner, setShowPositionOwner] = useState(false);
  const { tempSlice } = useAppStore();
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  const [positionOwner, setPositionOwner] = useState("");
  const [amount0Min, setAmount0Min] = useState("");
  const [amount1Min, setAmount1Min] = useState("");
  const [percentageSetting, setPercentageSetting] = useState(";"); // default to 1%
  const [lastUpdatedField, setLastUpdatedField] = useState("");
  const [currentPrice, setCurrentPrice] = useState(0);
  // create e const for the array of token addresses, that will also contain the input value and approval state
  const [tokenAddresses, setTokenAddresses] = useState([
    { address: "", value: 0, allowance: 0, approved: false },
    { address: "", value: 0, allowance: 0, approved: false },
  ]);

  const [error, setError] = useState("");

  const contractName = "FarmMainRegularMinStake";
  const account = useAccount();
  const address = account?.address;

  const { balance, price, isError, onToggleBalance, isEthBalance } = useAccountBalance(account.address);

  const provider = useProvider();
  const addr = lptokenAddress;
  // Uses Graph Protocol to fetch existing indexed positions
  const eth = useEthPrice();
  const { executeQuery } = useAppStore(state => state.querySlice);
  const [userPositions, setUserPositions] = useState<Array<UserPositions>>([]);

  const handleExecuteQuery = async (address: string) => {
    const result = await executeQuery(address);
    setUserPositions(result.user?.positions || []);
  };
  //get contract address from deployedContractInfo
  const deployedContractInfo = useDeployedContractInfo(contractName);
  const contractAddress = deployedContractInfo.data?.address;
  console.log("contractAddress:", contractAddress);

  useEffect(() => {
    if (account?.address) {
      handleExecuteQuery(account?.address);
    }
  }, [account?.address]);

  // Checks graph query result if user has a position else returns a string this happens when user has no position

  const positionId = userPositions?.length > 0 ? userPositions[0].id : null;

  // Get univ3 pool data
  const unipool = useUniswapPool(addr, tickLower, tickUpper, involvingETH, eth);
  console.log("unipool:", unipool);
  // Define an interface for the unipool object
  interface UnipoolData {
    cursorData: {
      currentTickPrice: string;
      formattedCursorNumber: number;
      tickCurrentUSDPrice: number;
      tickLowerUSDPrice: number;
      tickUpperUSDPrice: number;
      token0Address: string;
      token1Address: string;
    };
  }

  // Use a type assertion to cast unipool to the UnipoolData type
  const unipoolData = unipool as UnipoolData;

  // Destructure unipoolData to get each variable
  try {
    if (unipoolData.cursorData !== null) {
      const {
        cursorData,
        cursorData: {
          currentTickPrice,
          formattedCursorNumber,
          tickCurrentUSDPrice,
          tickLowerUSDPrice,
          tickUpperUSDPrice,
          token0Address,
          token1Address,
        },
      } = unipoolData;

      // Get the current price of the pool
      const price = parseFloat(currentTickPrice);

      // Set the token addresses to the state using token0Address and token1Address
      if (tokenAddresses[0].address === "") {
        setTokenAddresses([
          { address: token0Address, value: 0, allowance: 0, approved: false },
          { address: token1Address, value: 0, allowance: 0, approved: false },
        ]);
      }

      // Set the current price to the state

      if (currentPrice == 0) {
        setCurrentPrice(price);
      } else {
        console.log("currentPrice", currentPrice);
      }
    }
  } catch (e) {
    console.log("error:", e);
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const amount0Value = new BigNumber(amount0);
        const amount1Value = new BigNumber(amount1);

        if (lastUpdatedField === "amount0") {
          if (amount0Value.isGreaterThan(0) && currentPrice) {
            const correspondingAmount1 = amount0Value.multipliedBy(currentPrice);
            setAmount1(correspondingAmount1.toString());
          } else {
            setAmount1("");
          }
        } else if (lastUpdatedField === "amount1") {
          if (amount1Value.isGreaterThan(0) && currentPrice) {
            const correspondingAmount0 = amount1Value.dividedBy(currentPrice);
            setAmount0(correspondingAmount0.toString());
          } else {
            setAmount0("");
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, [amount0, amount1, lastUpdatedField, price, currentPrice]);

  // Handles Inputs for tokens: Token A is derived from Token B

  const handleAmount0Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount0(e.target.value);
    setLastUpdatedField("amount0");
    if (currentPrice && !isNaN(parseFloat(e.target.value))) {
      setAmount1((parseFloat(e.target.value) / currentPrice).toString());
    }
  };

  const handleAmount1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount1(e.target.value);
    setLastUpdatedField("amount1");
    if (currentPrice && !isNaN(parseFloat(e.target.value))) {
      setAmount0((parseFloat(e.target.value) * currentPrice).toString());
    }
  };
  // Scaffold Contract Write takes contract and function + args (Touple) and should handle the transaction

  useEffect(() => {
    const calculateMinAmounts = () => {
      const amount0Value = parseFloat(amount0);
      const amount1Value = parseFloat(amount1);
      const percentage = parseFloat(percentageSetting);

      if (isNaN(amount0Value) || isNaN(amount1Value) || isNaN(percentage)) {
        // Handle invalid input values
        return;
      }

      const amount0MinValue = amount0Value - amount0Value * percentage;
      const amount1MinValue = amount1Value - amount1Value * percentage;

      // Set the minimum amount values
      setAmount0Min(amount0MinValue.toFixed(4));
      setAmount1Min(amount1MinValue.toFixed(4));
    };

    calculateMinAmounts();
  }, [amount0, amount1, percentageSetting]);

  // update the existing token info state with token 0 and token 1 with amount0 and amount1 input values avoid infinite loops
  useEffect(() => {
    if (amount0 && amount1) {
      setTokenAddresses(prev => {
        // Check if the amounts have changed before updating the state
        if (prev[0].value !== Number(amount0) || prev[1].value !== Number(amount1)) {
          const firstToken = { ...prev[0], value: Number(amount0) };
          const secondToken = { ...prev[1], value: Number(amount1) };
          return [firstToken, secondToken];
        } else {
          // If the amounts have not changed, return the previous state
          return prev;
        }
      });
    }
  }, [amount0, amount1, tokenAddresses]);
  //... use tokenAddresses to check if approved and update the staet of the token addresses

  const updateTokenAllowances = useCallback((updatedTokens: any) => {
    setTokenAddresses(updatedTokens);
  }, []);

  const { allowance } = useAllowance({
    tokens: tokenAddresses,
    owner: address ? address : "",
    spender: contractAddress ? contractAddress : "",
    onAllowanceFetched: updateTokenAllowances,
  });

  const isApproved = useMemo(() => {
    return tokenAddresses.every(token => token.approved);
  }, [tokenAddresses]);

  // determine which token index (approved = false)
  const tokenIndex = useMemo(() => {
    return tokenAddresses.findIndex(token => !token.approved);
  }, [tokenAddresses]);

  console.log("tokenIndex", tokenIndex);

  console.log("allowance", tokenAddresses);

  //...if approved, show add liquidity button...

  //handle add liquidity
  const functionNameToCall = positionId ? "addLiquidity" : "openPosition";

  const args = positionId
    ? [
        positionId,
        {
          setupIndex: tempSlice.pid,
          amount0: parseAmount(amount0),
          amount1: parseAmount(amount1),
          positionOwner: positionOwner || addressZero,
          amount0Min: parseAmount(amount0Min),
          amount1Min: parseAmount(amount1Min),
        },
      ]
    : [
        {
          setupIndex: tempSlice.pid,
          amount0: parseAmount(amount0),
          amount1: parseAmount(amount1),
          positionOwner: positionOwner || addressZero,
          amount0Min: parseAmount(amount0Min),
          amount1Min: parseAmount(amount1Min),
        },
      ];

  const { isLoading, writeAsync } = useScaffoldContractWrite(contractName, functionNameToCall, args);

  const handleClick = async () => {
    if (!isLoading) {
      console.log("🚀 Constructed args of the tuple", {
        setupIndex: tempSlice.pid,
        amount0: parseAmount(amount0),
        amount1: parseAmount(amount1),
        positionOwner: positionOwner || addressZero,
        amount0Min: parseAmount(amount0Min),
        amount1Min: parseAmount(amount1Min),
      });
      await writeAsync();
    }
  };

  const approvalAddress = tokenAddresses[tokenIndex]?.address ? tokenAddresses[tokenIndex].address : "0x";
  const approvalAmount = tokenAddresses[tokenIndex].value
    ? ethers.utils.parseUnits(
        tokenAddresses[tokenIndex].value.toString(),
        18, // change to tokenDecimals if needed
      )
    : parseAmount("0");

  console.log(approvalAmount);
  console.log("approvalAddress", approvalAddress);
  const { isLoading: isApproving, writeAsync: approveAsync } = useScaffoldERCWrite(approvalAddress, "approve", [
    contractAddress,
    // 5000 in wei
    approvalAmount,
  ]);

  const handleTokenApproval = async () => {
    if (!isApproving) await approveAsync();
    // Add any additional logic after token approval if needed
  };

  return (
    <Grid container direction="column" alignItems="center">
      <Typography variant="h6" style={{ marginTop: "20px" }}>
        Add Liquidity
      </Typography>
      <form>
        <div> lpTokenAddress: {addr}</div>
        <div> Setup Index: {tempSlice.pid} </div>
        <div> Position ID: {positionId} </div>
        <div> Current Price: {currentPrice} </div>
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={showPositionOwner}
                onChange={e => setShowPositionOwner(e.target.checked)}
                color="primary"
              />
            }
            label="Specify Position Owner"
          />
        </div>
        <TextField
          label="Amount 0"
          variant="outlined"
          type="number"
          value={amount0}
          onChange={handleAmount0Change}
          style={{ margin: "20px 0" }}
        />
        <TextField
          label="Amount 1"
          variant="outlined"
          type="number"
          value={amount1}
          onChange={handleAmount1Change}
          style={{ margin: "20px 0" }}
        />
        <div style={{ margin: "20px 0" }}>
          <Typography variant="subtitle1">Choose a minimum amount setting:</Typography>
          <div>
            <Button
              variant="contained"
              color={percentageSetting === "0.01" ? "primary" : "default"}
              onClick={() => setPercentageSetting("0.01")}
            >
              0.1%
            </Button>
            <Button
              variant="contained"
              color={percentageSetting === "0.05" ? "primary" : "default"}
              onClick={() => setPercentageSetting("0.05")}
            >
              1%
            </Button>
            <Button
              variant="contained"
              color={percentageSetting === "0.1" ? "primary" : "default"}
              onClick={() => setPercentageSetting("0.1")}
            >
              5%
            </Button>
          </div>
        </div>
        {showPositionOwner && (
          <TextField
            label="Position Owner"
            variant="outlined"
            type="text"
            value={positionOwner}
            onChange={e => setPositionOwner(e.target.value)}
            style={{ margin: "20px 0" }}
          />
        )}
        <TextField
          label="Amount 0 Minimum"
          variant="outlined"
          type="number"
          value={amount0Min}
          onChange={e => setAmount0Min(e.target.value)}
          style={{ margin: "20px 0" }}
          disabled
        />
        <TextField
          label="Amount 1 Minimum"
          variant="outlined"
          type="number"
          value={amount1Min}
          onChange={e => setAmount1Min(e.target.value)}
          style={{ margin: "20px 0" }}
          disabled
        />
        <div>
          <Button variant="contained" color="primary" onClick={handleClick} disabled={isLoading || !isApproved}>
            {isLoading ? "Loading..." : "Add Liquidity"}
          </Button>
          <Button variant="contained" color="primary" onClick={handleTokenApproval} disabled={isLoading || isApproved}>
            {isLoading ? "Loading..." : "Approve Tokens"}
          </Button>
        </div>
        <div>
          <div>Balance: {balance}</div>
          <div>Price: {eth}</div>
          <div>Error: {isError ? "true" : "false"}</div>

          <button onClick={onToggleBalance}>Toggle Balance Display</button>
          <div>Displaying balance in {isEthBalance ? "ETH" : "Token"}</div>
        </div>
      </form>
    </Grid>
  );
}

export default AddLiquidityForm;

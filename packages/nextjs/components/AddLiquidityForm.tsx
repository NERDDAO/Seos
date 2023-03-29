import React, { useState, useEffect } from "react";
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

function AddLiquidityForm(props: any) {
  const { lptokenAddress, tickLower, tickUpper, involvingETH } = props;
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
  const [ethPrice, setEthPrice] = useState(1);
  const [currentPrice, setCurrentPrice] = useState(0);

  const [error, setError] = useState("");

  const contractName = "FarmMainRegularMinStake";
  const account = useAccount();
  const { balance, price, isError, onToggleBalance, isEthBalance } = useAccountBalance(account.address);

  const provider = useProvider();
  const addr = lptokenAddress;
  // Uses Graph Protocol to fetch existing indexed positions
  const eth = useEthPrice();
  console.log("eth:", eth);
  const { executeQuery } = useAppStore(state => state.querySlice);
  const [userPositions, setUserPositions] = useState<Array<UserPositions>>([]);

  const handleExecuteQuery = async (address: string) => {
    const result = await executeQuery(address);
    setUserPositions(result.user?.positions || []);
  };

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
        },
      } = unipoolData;

      // Get the current price of the pool
      const price = parseFloat(currentTickPrice);
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
        // Old logic
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

  // Use allowance checker

  //...if not approved, show approve button... handle approve

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
        {error && <Typography color="error">{error}</Typography>}
        <Button
          type="button"
          variant="contained"
          color="primary"
          style={{ marginTop: "20px" }}
          onClick={() => {
            handleClick();
          }}
        >
          Add Liquidity
        </Button>

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
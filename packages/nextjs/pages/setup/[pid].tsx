import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import {
  Card,
  CardHeader,
  CardContent,
  makeStyles,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@material-ui/core";
import { useRouter } from "next/router";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";
import AddLiquidityForm from "~~/components/AddLiquidityForm";
import { useAppStore } from "~~/services/store/store";
import { utils } from "ethers";
import { UserPositions } from "~~/services/store/slices/querySlice";
import PositionManager from "~~/components/PositionManager";

const epochToDateAndTime = (epochTime: number) => {
  const dateObj = new Date(epochTime * 1000);
  const date = dateObj.toLocaleDateString();
  const time = dateObj.toLocaleTimeString();

  return `${date} ${time}`;
};

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 500,
    margin: "20px auto",
    cursor: "pointer",
    padding: "20px",
    backgroundColor: "#f7f7f7",
  },
  header: {
    backgroundColor: "#3f51b5",
    color: "#fff",
    padding: "10px 20px",
    textAlign: "center",
  },
  content: {
    padding: "20px",
  },
  table: {
    margin: "10px auto",
  },
  tableCell: {
    padding: "10px",
  },
  tableHeader: {
    fontWeight: "bold",
  },
}));

interface SetupCardProps {
  web3: any;
  farmingContractAddress: string;
  children?: React.ReactNode;
}

const SetupCard: React.FC<SetupCardProps> = ({ web3, farmingContractAddress, children }) => {
  const { address, isConnected } = useAccount();
  const account = address;
  const { tempSlice } = useAppStore();
  const classes = useStyles();
  const router = useRouter();
  // @dev
  // this is the contract for the MinStake farm position. Our first version should behardcoded  to the oregular one

  const contractName = "FarmMainRegularMinStake";
  const functionName = "setup";
  const { pid } = router.query;
  const contract = useScaffoldContractRead(contractName, functionName, [pid]);
  let data: any;
  if (contract.data) {
    data = contract.data as any[];
    console.log(contract.data);
    data = {
      startBlock: data[0].startBlock ? epochToDateAndTime(data[0].startBlock.toString()) : "",
      rewardPerBlock: data[0].rewardPerBlock ? utils.formatEther(data[0].rewardPerBlock) : "",
      totalSupply: data[0].totalSupply ? utils.formatEther(data[0].totalSupply) : "",
      //handle boolean type: there's  prob better way to do this
      involvingEth: data[1].involvingETH == true ? true : data[1].involvingETH == false ? false : "undef",
      lpTokenAddress: data[1].liquidityPoolTokenAddress ? data[1].liquidityPoolTokenAddress : "",
      MainToken: data[1].mainTokenAddress ? data[1].mainTokenAddress : "",
      minStakeableAmount: data[1].minStakeable ? utils.formatEther(data[1].minStakeable) : "notfound",
      tickLower: data[1].tickLower ? data[1].tickLower : "",
      tickUpper: data[1].tickUpper ? data[1].tickUpper : "",
    };
  }
  const variableNames = {
    startBlock: "Start Block",
    rewardPerBlock: "Reward per Block",
    totalSupply: "Total Supply",
    involvingEth: "Involving ETH",
    lpTokenAddress: "LP Token Address",
    MainToken: "Main Token",
    minStakeableAmount: "Min Stakeable Amount",
  };

  console.log("data", data);

  const [lptokenAddress, setLptokenAddress] = useState("");
  const [tickLower, setTickLower] = useState("0");
  const [tickUpper, setTickUpper] = useState("0");
  const [involvingETH, setInvolvingETH] = useState(false);
  const [mainTokenAddress, setMainTokenAddress] = useState("");

  // Uses Graph Protocol to fetch existing indexed positions
  const { executeQuery } = useAppStore(state => state.querySlice);
  const [userPositions, setUserPositions] = useState<Array<UserPositions>>([]);
  console.log("userPositions:", userPositions);

  const handleExecuteQuery = async (address: string) => {
    const result = await executeQuery(address);
    setUserPositions(result.user?.positions || []);
  };

  useEffect(() => {
    if (address) {
      handleExecuteQuery(address);
      console.log("account?.address:", address);
    }
  }, [address]);

  // Checks graph query result if user has a position else returns a string this happens when user has no position

  const positionId = userPositions?.length > 0 ? userPositions[0].id : null;

  // Get univ3 pool data

  useEffect(() => {
    if (data) {
      setLptokenAddress(data.lpTokenAddress);
      setTickLower(data.tickLower);
      setTickUpper(data.tickUpper);
      setInvolvingETH(data.involvingEth);
      setMainTokenAddress(data.MainToken);
    }
  }, [data]);

  return (
    <Card className={classes.card}>
      <CardHeader className={classes.header} title="Data" />
      <CardContent className={classes.content}>
        {data && (
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell className={classes.tableHeader}>Variable Name</TableCell>
                  <TableCell className={classes.tableHeader}>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(variableNames).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className={classes.tableCell} component="th" scope="row">
                      {value}
                    </TableCell>
                    <TableCell className={classes.tableCell}>{data[key]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Typography variant="body2" component="p">
          {children}
        </Typography>
      </CardContent>
      <PositionManager positionId={positionId} />
      <AddLiquidityForm
        lptokenAddress={lptokenAddress}
        tickLower={tickLower}
        tickUpper={tickUpper}
        involvingETH={involvingETH}
        mainTokenAddress={mainTokenAddress}
        positionId={positionId}
      />
    </Card>
  );
};

export default SetupCard;

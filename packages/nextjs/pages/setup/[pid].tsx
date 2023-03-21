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
  const contractName = "FarmMainRegularMinStake";
  const functionName = "setup";
  const { pid } = router.query;
  const contract = useScaffoldContractRead(contractName, functionName, [pid]);
  let data: any;
  console.log("⚡️ ~ file: [pid].tsx:81 ~ contract", contract);
  if (contract.data) {
    data = contract.data as any[];
    data = {
      startBlock: data[0].startBlock ? epochToDateAndTime(data[0].startBlock.toString()) : "",
      rewardPerBlock: data[0].rewardPerBlock ? utils.formatEther(data[0].rewardPerBlock) : "",
      totalSupply: data[0].totalSupply ? utils.formatEther(data[0].totalSupply) : "",
      //@dev
      //handle boolean type there's  prob better way to do this
      involvingEth: data[1].involvingETH == true ? "TRUE" : data[1].involvingETH == false ? "FALSE" : "undef",
      lpTokenAddress: data[1].liquidityPoolTokenAddress ? data[1].liquidityPoolTokenAddress : "",
      MainToken: data[1].mainTokenAddress ? data[1].mainTokenAddress : "",
      minStakeableAmount: data[1].minStakeable ? utils.formatEther(data[1].minStakeable) : "notfound",
    };
    console.log("⚡️ ~ file: [pid].tsx:82 ~ data:", data);
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

  //TODO: Pass the data to the      <AddLiquidityForm />

  // lpTokenAddress: data[1].liquidityPoolTokenAddress ? data[1].liquidityPoolTokenAddress : "",
  // involvinEth: data[1].involvingETH ? data[1].involvingETH : "notfound",
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
      <AddLiquidityForm lpTokenAddress={data.lpTokenAddress} involvingEth={data.involvingEth} />
    </Card>
  );
};

export default SetupCard;

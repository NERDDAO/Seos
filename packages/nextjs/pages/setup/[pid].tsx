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
  if (contract.data) {
    data = contract.data as any[];
    data = {
      startBlock: data[0].startBlock ? epochToDateAndTime(data[0].startBlock.toString()) : "",
      rewardPerBlock: data[0].rewardPerBlock ? utils.formatEther(data[0].rewardPerBlock) : "",
      totalSupply: data[0].totalSupply ? utils.formatEther(data[0].totalSupply) : "",
    };
    console.log("⚡️ ~ file: [pid].tsx:82 ~ data:", data);
  }
  const variableNames = {
    startBlock: "Start Block",
    rewardPerBlock: "Reward per Block",
    totalSupply: "Total Supply",
  };

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
      <AddLiquidityForm />
    </Card>
  );
};

export default SetupCard;

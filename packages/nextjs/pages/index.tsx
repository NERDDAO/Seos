import type { NextPage } from "next";
import React, { useState, useEffect } from "react";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/useScaffoldContractRead";
import { useAccount } from "wagmi";

import {
  Card,
  CardHeader,
  CardContent,
  makeStyles,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Link,
  Popover,
  Typography,
  TableBody,
  Button,
  CardActions,
  Grid,
} from "@material-ui/core";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAppStore } from "~~/services/store/store";
import { utils } from "ethers";
import { Address } from "~~/components/scaffold-eth";
import Spinner from "~~/components/Spinner";

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 200,
    cursor: "pointer",
  },
  title: {
    fontSize: 14,
  },
  gridContainer: {
    maxWidth: "100vw",
    padding: "0 20px",
    marginTop: "2rem",
  },
}));

const Home: NextPage = () => {
  const { tempSlice } = useAppStore();
  const { address, isConnected } = useAccount();
  const classes = useStyles();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const contractName = "FarmMainRegularMinStake";
  const functionName = "setups";
  const { isFetching, data } = useScaffoldContractRead<any[]>(contractName, functionName, undefined, {
    select: data => {
      // @ts-expect-error
      return data.filter((setup: any) => setup.rewardPerBlock?.toNumber() > 0);
    },
  });
  console.log("⚡️ ~ file: index.tsx:54 ~ isFetching:", isFetching);

  useEffect(() => {
    if (address) {
      tempSlice.setAddress(address);
    }
  }, [address, tempSlice]);

  const handleClick = (setupId: string) => {
    tempSlice.setPID(setupId);
    router.push(`/setup/${setupId}`);
  };

  console.log("data", data, "userData", userData);
  return (
    <>
      <Head>
        <title>Scaffold-eth App</title>
        <meta name="description" content="Created with 🏗 scaffold-eth" />
      </Head>
      {tempSlice.address && (
        <div className="flex w-full items-center flex-col mt-6 space-y-1">
          <p className="m-0 font-semibold text-lg">Your Address is : </p>
          <Address address={tempSlice.address} />
        </div>
      )}
      {isFetching ? (
        <div className="flex justify-center mt-4">
          <Spinner width="50" height="50" />
        </div>
      ) : (
        <Grid container spacing={4} className={classes.gridContainer} justifyContent="center">
          {data?.map((setup: any, index: any) => (
            <Grid key={index} item xs={12} sm={6} md={4} onClick={() => handleClick(index)}>
              <Card className={classes.root}>
                <CardContent>
                  <Typography className={classes.title} color="textSecondary" gutterBottom>
                    PID
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {index}
                  </Typography>
                  <Typography className={classes.title} color="textSecondary" gutterBottom>
                    Reward Per Block
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {utils.formatEther(setup.rewardPerBlock?.toString())}
                  </Typography>
                  <Typography className={classes.title} color="textSecondary" gutterBottom>
                    End Block
                  </Typography>
                  <Typography variant="h5" component="h2">
                    {setup.endBlock?.toNumber()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default Home;

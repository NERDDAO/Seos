import * as React from "react";
import { TableBody } from "@material-ui/core";
import { Card, TableCell, TableRow } from "@mui/material";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/useScaffoldContractRead";
import { useGlobalState } from "~~/services/store/store";
import PositionManager from "~~/components/PositionManager";

type SetupType = {
  pid: number;
};

type namedDataType = {
  startBlock: string;
  rewardPerBlock: string;
  totalSupply: string;
  involvingEth: boolean;
  lpTokenAddress: `0x${string}`;
  MainToken: `0x${string}`;
  tickLower: string;
  tickUpper: string;
};

const SetupCard = (props: SetupType) => {
  const epochToDateAndTime = (epochTime: number) => {
    const dateObj = new Date(epochTime * 100000);
    const date = dateObj.toLocaleDateString();
    const time = dateObj.toLocaleTimeString();

    return `${date} ${time}`;
  };

  const startingBlock = useGlobalState(state =>
    parseInt(state.setupInfo.startingBlock ? state.setupInfo.startingBlock : "0"),
  );


  // Get setup info from contract
  const { data, isFetching, error } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "setup",
    args: [BigInt(props.pid)],
  });
  const variableNames = {
    startBlock: "Start Block",
    rewardPerBlock: "Reward per Block",
    totalSupply: "Total Supply",
    involvingEth: "Involving ETH",
    lpTokenAddress: "LP Token Address",
    MainToken: "Main Token",
    minStakeableAmount: "Min Stakeable Amount",
    tickLower: "Tick Lower",
    tickUpper: "Tick Upper",
  };
  let namedData: namedDataType = {
    startBlock: "",
    rewardPerBlock: "",
    totalSupply: "",
    involvingEth: true,
    lpTokenAddress: "0x0",
    MainToken: "0x0",
    tickLower: "",
    tickUpper: "",
  };

  console.log("data", data);

  if (data) {
    namedData = {
      //TODO: i think the ABI is telling TS the wrong array type

      startBlock: data[0].startBlock ? epochToDateAndTime(data[0].startBlock.toString()) : "",
      rewardPerBlock: data[0].rewardPerBlock ? BigInt(data[0].rewardPerBlock).toString() : "",
      totalSupply: data[0].totalSupply ? BigInt(data[0].totalSupply).toString() : "",
      //handle boolean type: there's  prob better way to do this
      involvingEth: data[1].involvingETH ? data[1].involvingEth : true,
      lpTokenAddress: data[1].liquidityPoolTokenAddress ? data[1].liquidityPoolTokenAddress : "",
      MainToken: data[1].mainTokenAddress ? data[1].mainTokenAddress : "",
      tickLower: data[1].tickLower ? data[1].tickLower : "",
      tickUpper: data[1].tickUpper ? data[1].tickUpper : "",
    };
  }


  return (
    <React.Fragment>
      <Card className="flex flex-col text-left overflow-scroll p-5 m-5 w-196 h-96 rounded-xl shadow-xl bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-black font-bold py-2 px-6 rounded overflow-X-scroll">
        Setup #{props.pid}
        Rewards Per Block:{" "}
        {isFetching && !data
          ? "Loading..."
          : error
            ? error.message
            : data && (
              <TableBody>
                {Object.entries(variableNames).map(([key, value]) => (
                  <TableRow key={key}>
                    {value}
                    <TableCell>{namedData[key as keyof namedDataType]}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
      </Card>
      <Card className="flex flex-col text-left overflow-scroll p-5 m-5 w-196 h-96 rounded-xl shadow-xl bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-black font-bold py-2 px-6 rounded overflow-X-scroll">
        <PositionManager
          startingBlock={startingBlock}
          lpTokenAddress={namedData["lpTokenAddress"]}
          involvingETH={namedData.involvingEth}
          mainToken={namedData.MainToken}
          pid={props.pid}

        />
      </Card>
    </React.Fragment>

  );
};

export default SetupCard;

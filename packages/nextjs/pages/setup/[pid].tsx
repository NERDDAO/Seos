import { useState } from "react";
import ToDo from "../../components/NerdTodo";
import { Card } from "@mui/material";
import { useAccount } from "wagmi";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/useScaffoldContractRead";
import { useGlobalState } from "~~/services/store/store";

export default function SetupPage() {
  // Get pid and starting block from contract
  const pid = useGlobalState(state => parseInt(state.setupInfo.pid ? state.setupInfo.pid : "0"));
  const startingBlock = useGlobalState(state =>
    parseInt(state.setupInfo.startingBlock ? state.setupInfo.startingBlock : "0"),
  );
  // Get setup info from contract
  const { data, isFetching, error } = useScaffoldContractRead({
    contractName: "FarmMainRegularMinStake",
    functionName: "setup",
    args: [BigInt(pid)],
  });
  const { address, isConnected } = useAccount();
  // get position ID from transfer events
  const { data: history, error: historyError } = useScaffoldEventHistory({
    contractName: "FarmMainRegularMinStake",
    eventName: "Transfer",
    fromBlock: BigInt(startingBlock),
    filters: { from: address },
  });
  console.log(history);
  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="text-2xl font-bold text-center align-middle mb-4">
          Setup #{pid?.toString()}
          <ToDo />
        </div>
        <div className="text-2xl font-bold text-center align-middle mb-4">
          Setup Info
          <Card>
            <div>
              Rewards Per Block:{" "}
              {isFetching ? (
                "Loading..."
              ) : error ? (
                error.message
              ) : (
                <>
                  {/*@ts-ignore*/}
                  <span> {data ? [0] && data[0].rewardPerBlock.toString() : "undefined"} </span>
                  {history?.map(item => {
                    <div key={item}>Some Stuff</div>;
                  })}
                </>
              )}
            </div>
          </Card>
          $
        </div>
      </div>
    </div>
  );
}

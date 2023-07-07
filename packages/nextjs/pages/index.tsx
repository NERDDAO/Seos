import Link from "next/link";
import { useRouter } from "next/router";
import { useScaffoldContractRead } from "../hooks/scaffold-eth/useScaffoldContractRead";
import { Card } from "@material-ui/core";
import { Button } from "@mui/material";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { useGlobalState } from "~~/services/store/store";

const Home: NextPage = () => {
  const contractName = "FarmMainRegularMinStake";
  const functionName = "setups";
  const router = useRouter();

  const { isFetching, data, error } = useScaffoldContractRead({
    contractName: contractName,
    functionName: functionName,
  });

  //TODO: store selected pid on the global state
  //
  const setPid = useGlobalState(state => state.setSetupInfo);
  function handleClick(pid: string, rpb: string) {

    setPid({ pid: pid, startingBlock: rpb });
    router.push(`/setup/${pid}`);
  }

  console.log("⚡️ ~ file: index.tsx:54 ~ isFetching:", isFetching, data, error);
  if (data) {
    console.log("⚡️ ~ file: ind.tsx:54 ~ data:", data);
  }

  if (error) {
    console.log("⚡️ ~ file: index.tsx:54 ~ error:", error);
  }

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          SOMETHING SHOULD BE HERE
          {data?.map(
            (item: any) =>
              item.active === true && (
                <Card
                  className="flex flex-col justify-center items-center p-5 m-5 w-96 h-96 rounded-xl shadow-xl bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-black font-bold py-2 px-6 rounded"
                  key={item.id}
                >
                  SETUP INFO
                  <br />
                  <>
                    Start Block: {item.startBlock.toString()}
                    <br /> {item.active == true && "ACTIVE"}
                  </>
                  <br />
                  <Button
                    className={
                      "bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-black font-bold py-2 px-6 rounded"
                    }
                    onClick={() => {
                      handleClick(item.infoIndex.toString(), item.startBlock.toString());
                    }}
                  >
                    Open Setup
                  </Button>
                </Card>
              ),
          )}
        </div>
      </div>
    </>
  );
};

export default Home;

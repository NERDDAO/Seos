import Link from "next/link";
import { useRouter } from "next/router";
import { useScaffoldContractRead } from "../hooks/scaffold-eth/useScaffoldContractRead";
import { Card } from "@mui/material";
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

  const setPid = useGlobalState(state => state.setSetupInfo);

  function handleClick(pid: string, rpb: string) {
    setPid({ pid: pid, startingBlock: rpb });
    router.push(`/setup/${pid}`);
  }

return (
  <>
    <MetaHeader />
    <div className="flex flex-col items-center flex-grow pt-10 space-y-6 bg-white min-h-screen">
      <p className="text-xl font-bold text-black">Welcome to...</p>
      <h1 className="text-8xl font-bold text-center outlined-text">The Farm</h1>
      <p className="text-lg text-center text-black font-bold">Your active pools:</p>
      <div className="grid grid-cols-1 sm:grid-cols lg:grid-cols gap-4 px-5 w-full max-w-2xl justify-self-center">
        {isFetching && <p>Loading setups...</p>}
        {error && <p>There was an error fetching setups: {error.message}</p>}
        {data?.map(
          (item: any) =>
            item.active === true && (
              <Card
                className="flex flex-col items-center justify-center border-4 border-black border-dotted p-5 space-y-4 h-96 rounded-x2 shadow-xl hover:from-purple-500 hover:to-white-500 text-black font-bold"
                key={item.id}
              >
                <h2 className="text-2xl font-bold">Setup #{item.infoIndex}</h2>
                <p>Start Block: {item.startBlock.toString()}</p>
                <p>{item.active === true && "ACTIVE"}</p>
                <Button
                  className={
                    "bg-gradient-to-r from-gray-400 to-black-500 hover:from-gray-100 hover:to-black-100 text-black font-bold py-2 px-6 rounded"
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

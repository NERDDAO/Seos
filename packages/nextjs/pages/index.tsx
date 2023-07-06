import Link from "next/link";
import { useRouter } from "next/router";
import { useScaffoldContractRead } from "../hooks/scaffold-eth/useScaffoldContractRead";
import type { NextPage } from "next";
import { BugAntIcon, MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";

const Home: NextPage = () => {
  const contractName = "FarmMainRegularMinStake";
  const functionName = "setups";
  const router = useRouter();

  const { isFetching, data, error } = useScaffoldContractRead({
    contractName: contractName,
    functionName: functionName,
  });

  console.log("⚡️ ~ file: index.tsx:54 ~ isFetching:", isFetching, data, error);
  if (data) {
    console.log("⚡️ ~ file: index.tsx:54 ~ data:", data);
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
                <div key={item.id}>
                  <>
                    Start Block: {item.startBlock.toString()}
                    <br /> {item.active == true && "ACTIVE"}
                  </>
                  <br />
                  <button
                    onClick={() => {
                      router.push(`/setup/${item.infoIndex.toString()}`);
                    }}
                  >
                    BUTTON
                  </button>
                </div>
              ),
          )}
        </div>
      </div>
    </>
  );
};

export default Home;

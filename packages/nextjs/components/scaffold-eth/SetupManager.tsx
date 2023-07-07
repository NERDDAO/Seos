import { useAccount } from "wagmi";
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth/useScaffoldEventHistory";

type ManagerProps = {
  startingBlock: number;
};

const PositionManager = (props: ManagerProps) => {
  const { startingBlock } = props;
  const { address, isConnected } = useAccount();

  const { data: history, error: historyError } = useScaffoldEventHistory({
    contractName: "FarmMainRegularMinStake",
    eventName: "Transfer",
    fromBlock: BigInt(startingBlock),
    filters: { from: address },
  });

  return <div>Position Manager{isConnected ? "connected" : "not connected"}</div>;
};

export default PositionManager;

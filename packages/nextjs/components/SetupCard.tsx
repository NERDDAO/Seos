import { TableBody } from "@material-ui/core";
import { Card, TableCell, TableRow } from "@mui/material";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/useScaffoldContractRead";
import { useGlobalState } from "~~/services/store/store";

type SetupType = {
  pid: number;
};

type namedDataType = {
  startBlock: string;
  rewardPerBlock: string;
  totalSupply: string;
  involvingEth: string;
  lpTokenAddress: string;
  MainToken: string;
  minStakeableAmount: string;
};

const SetupCard = (props: SetupType) => {
  const epochToDateAndTime = (epochTime: number) => {
    const dateObj = new Date(epochTime * 1000);
    const date = dateObj.toLocaleDateString();
    const time = dateObj.toLocaleTimeString();

    return `${date} ${time}`;
  };
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
  };
  var namedData: namedDataType = {
    startBlock: "",
    rewardPerBlock: "",
    totalSupply: "",
    involvingEth: "",
    lpTokenAddress: "",
    MainToken: "",
    minStakeableAmount: "",
  };

  console.log("data", data);

  if (data) {
    namedData = {
      //@ts-ignore

      startBlock: data[0].startBlock ? epochToDateAndTime(data[0].startBlock.toString()) : "",
      rewardPerBlock: data[0].rewardPerBlock ? utils.formatEther(data[0].rewardPerBlock) : "",
      totalSupply: data[0].totalSupply ? utils.formatEther(data[0].totalSupply) : "",
      //handle boolean type: there's  prob better way to do this
      involvingEth: data[1].involvingETH == true ? true : data[1].involvingETH == false ? false : "undef",
      lpTokenAddress: data[1].liquidityPoolTokenAddress ? data[1].liquidityPoolTokenAddress : "",
      MainToken: data[1].mainTokenAddress ? data[1].mainTokenAddress : "",
      minStakeableAmount: data[1].minStakeable ? BigInt(data[1].minStakeable) : "notfound",
      tickLower: data[1].tickLower ? data[1].tickLower : "",
      tickUpper: data[1].tickUpper ? data[1].tickUpper : "",
    };
  }

  //
  // const [lptokenAddress, setLptokenAddress] = useState("");
  // const [tickLower, setTickLower] = useState("0");
  // const [tickUpper, setTickUpper] = useState("0");
  // const [involvingETH, setInvolvingETH] = useState(false);
  // const [mainTokenAddress, setMainTokenAddress] = useState("");
  //
  // useEffect(() => {
  //   if (data) {
  //     setLptokenAddress(data.lpTokenAddress);
  //     setTickLower(data.tickLower);
  //     setTickUpper(data.tickUpper);
  //     setInvolvingETH(data.involvingEth);
  //     setMainTokenAddress(data.MainToken);
  //   }
  // }, [data]);

  return (
    <Card className="flex flex-col text-left p-5 m-5 w-196 h-96 rounded-xl shadow-xl bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-black font-bold py-2 px-6 rounded overflow-X-scroll">
      Setup #{props.pid}
      Rewards Per Block:{" "}
      {isFetching
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
  );
};

export default SetupCard;

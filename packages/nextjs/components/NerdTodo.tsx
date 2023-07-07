import { Card } from "@mui/material";

export default function ToDo() {
  return (
    <Card className="flex flex-col justify-center items-center p-5 m-5 w-96 h-96 rounded-xl shadow-xl bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-black font-bold py-2 px-6 rounded">
      ToDo List
      <ul className="list-disc list-inside">
        <li>
          {" "}
          Setup Info: Fetch on chain data for active setup <span style={{ color: "red" }}>Done</span>
        </li>

        <li>
          {" "}
          Graph Query: Redeploy graph and fetch active positions
          <ul className="">
            <li>
              <span style={{ fontWeight: "bold" }}>**NEW***</span> useScaffold contract listener instead
            </li>
          </ul>
        </li>
        <li> Add Liquidity function []</li>
        <li> Remove Liquidity function []</li>
        <li> Claim FUnction []</li>
      </ul>
    </Card>
  );
}

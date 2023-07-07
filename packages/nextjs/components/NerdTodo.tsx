import { Card } from "@mui/material";

export default function ToDo() {
  return (
    <Card className="flex flex-col text-left p-5 m-5 w-196 h-96 rounded-xl shadow-xl bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 text-black font-bold py-2 px-6 rounded overflow-X-scroll">
      ToDo List
      <ul className="list-disc list-inside">
        <li>
          {" "}
          Setup Info: Fetch on chain data for active setup <span style={{ color: "red" }}>Done</span>
        </li>

        <li>
          useScaffold contract listener instead<span style={{ color: "red" }}>DONE</span>
        </li>
        <li>
          Setup Card component[at0x]
          <ul>
            <li>Import Setup Card component</li>
            <li>Fix: Calculate liquidity ammounts</li>
            <li>Import Approval flow</li>
          </ul>
        </li>
        <li>
          {" "}
          Add Liquidity function []
          <ul className="">
            <li>define function array</li>
            <li>manage users with and without existing positions</li>
          </ul>
        </li>
        <li> Remove Liquidity function []</li>
        <li> Claim FUnction []</li>
      </ul>
    </Card>
  );
}

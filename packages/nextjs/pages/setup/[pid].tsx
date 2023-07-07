
import ToDo from "~~/components/NerdTodo";
import SetupCard from "~~/components/SetupCard";
import PositionManager from "~~/components/PositionManager";
import { useGlobalState } from "~~/services/store/store";

export default function SetupPage() {
 // Get pid and starting block from contract
 const pid = useGlobalState(state => parseInt(state.setupInfo.pid ? state.setupInfo.pid : "0"));
 const startingBlock = useGlobalState(state =>
  parseInt(state.setupInfo.startingBlock ? state.setupInfo.startingBlock : "0"),
 );

 return (
  <div>
   <div className="flex flex-col items-center justify-center min-h-screen py-2">
    <div className="text-2xl font-bold text-center align-middle mb-4">
     Setup #{pid?.toString()}
     <ToDo />
    </div>
    <div className="text-2xl font-bold text-center align-middle mb-4">
     Setup Info
     {/* 
            DEV NOTES
            ==========
         Component: SetupCard 
          ====================================
          Component purpose: Display setup Info
          ====================================
          What info?
          - Setup id
          - Pool Info
          --- Pool id
          --- Pool token
          --- Pool token address
          --- tickPrice
          --- available Positions
          ====================================
          Component: Position Manager
          ====================================
          Component purpose: Display position Info
          and allow user to add/remove/claimRewards
          on position
          ====================================
          Elements:
          - Position id
          - User balance
          - input fields token1 and token2
          - Approve button
          -Claim button
          -add/Remove position button
          */}
     <SetupCard pid={pid} />
     <PositionManager startingBlock={startingBlock} />
    </div>
   </div>
  </div>
 );
}

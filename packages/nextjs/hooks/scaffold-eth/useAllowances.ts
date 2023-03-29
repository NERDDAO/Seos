import { useState, useCallback, useEffect } from "react";
import { useScaffoldERCWrite } from "./useScaffoldERCWrite";
import { useScaffoldERC20Read } from "./useScaffoldERC20Read";
import { BigNumber } from "ethers";

type UseAllowanceProps = {
  tokens: { address: string; contract: any; value: number }[];
  owner: string;
  spender: string;
};

type AllowanceItem = {
  token: string;
  approvedAmount: any;
};

const useAllowance = ({ tokens, owner, spender }: UseAllowanceProps) => {
  const [allowance, setAllowances] = useState<AllowanceItem[]>([]);
  const allowance0 = useScaffoldERC20Read(tokens[0].address, "allowance", [tokens[0].value, spender]);
  const allowance1 = useScaffoldERC20Read(tokens[1].address, "allowance", [tokens[1].value, spender]);

  const fetchAllowances = useCallback(async () => {
    const allowancesPromises = tokens.map(async token => {
      // map tokens to their allowances that are declared earlier (Allowance0 and Allowance1)
      const allowance = token.address === tokens[0].address ? allowance0 : allowance1;
      return {
        token: token.address,
        approvedAmount: allowance,
      };
    });

    const allowances = await Promise.all(allowancesPromises);
    setAllowances(allowances);
  }, [tokens, owner, spender]);

  useEffect(() => {
    if (tokens.length > 0) {
      fetchAllowances();
    }
  }, [tokens, owner, spender]);

  return { allowance, fetchAllowances };
};

export default useAllowance;
// const [approveLoading, setApproveLoading] = useState(false);
// const onTokenApproval = useCallback(
//   async (tokenAddress:string) => {
//     setApproveLoading(true);
//     try {
//       const token = tokens.find((t) => t.address === tokenAddress);
//       if (!token) {
//         throw new Error('Token not found');
//       }

//       const index = tokens.findIndex((t) => t.address === tokenAddress);
//       const tokenValue = values[index] === null ? BigNumber.from(2).pow(256).sub(1) : values[index];

//       useScaffoldERCWrite('approve', tokenAddress, [spender, tokenValue]);
//       onApproval();

//       // Update allowance for the approved token
//       setAllowances((prevState) =>
//         prevState.map((item) =>
//           item.token === tokenAddress
//             ? { ...item, approvedAmount: tokenValue }
//             : item
//         )
//       );
//     } catch (e) {
//       throw e;
//     } finally {
//       setApproveLoading(false);
//     }
//   },
//   [tokens, spender, values, onApproval]
// );

// return { approveLoading, onTokenApproval, allowances };

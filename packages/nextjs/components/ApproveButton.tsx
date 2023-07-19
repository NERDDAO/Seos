import { useWallet } from '~~/hooks/scaffold-eth'; // replace with actual import
import BigNumber from 'bignumber.js';
import { erc20ABI } from 'wagmi';
import { ethers } from 'ethers';

interface ApproveButtonProps {
  lpTokenAddress: string;
  mainToken: string;
}

export function ApproveButton({ lpTokenAddress, mainToken }: ApproveButtonProps) {
  const wallet = useWallet();
  const maxApproveValue = new BigNumber(2).pow(256).minus(1).toFixed();

  const handleClick = async () => {
    if (!wallet) {
      return;
    }

    try {
      const contract = new ethers.Contract(mainToken, erc20ABI, wallet);
      const tx = await contract.approve(lpTokenAddress, maxApproveValue);
      await tx.wait();
      // additional logic after the transaction is successful...
    } catch (error) {
      console.error('An error occurred', error);
      // handle the error...
    }
  };

  return (
    <button onClick={handleClick}>
      Approve
    </button>
  );
}

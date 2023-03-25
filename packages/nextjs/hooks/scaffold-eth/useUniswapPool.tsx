import {
  tickToPrice,
  Pool,
  Position,
  nearestUsableTick,
  TICK_SPACINGS,
  TickMath,
  maxLiquidityForAmounts,
} from "@uniswap/v3-sdk/dist/";
import { Token, Percent } from "@uniswap/sdk-core/dist";
import { useDeployedPoolInfo } from "~~/hooks/scaffold-eth";
import { useScaffoldPoolRead } from "~~/hooks/scaffold-eth";
import { useEffect, useState } from "react";

export const useUniswapPool = (addr: string, tickLower: number, tickUpper: number) => {
  const [lpTokenInfo, setLpTokenInfo] = useState([]);
  const lpTokenSymbol = "UniV3";
  const lpTokenDecimals = "18";
  const lpTokenBalance = "0";
  const lpTokenApproval = "0";
  const fee = useScaffoldPoolRead(addr, "fee");
  const slot = useScaffoldPoolRead(addr, "slot0");
  console.log("⚡️ ~ file: useUniswapPool.tsx:25 ~ slot", slot);
  const token0AddressData = useScaffoldPoolRead(addr, "token0");
  const token1AddressData = useScaffoldPoolRead(addr, "token1");

  useEffect(() => {
    if (
      fee.data &&
      slot.data &&
      token0AddressData.data &&
      token1AddressData.data &&
      tickLower !== undefined &&
      tickUpper !== undefined
    ) {
      const token0 = new Token(1, token0AddressData.data, 18); // assuming 18 decimal places
      const token1 = new Token(1, token1AddressData.data, 18);

      // Uncomment the lines below when using the current price to calculate tickLower and tickUpper
      // const currentPrice = tickToPrice(token0, token1, slot.data.tick);
      // const [tickLower, tickUpper] = [
      //   currentPrice.mul(new Percent(0.9, 100)).toFixed(0),
      //   currentPrice.mul(new Percent(1.1, 100)).toFixed(0),
      // ].map(price => nearestUsableTick(price));

      const a = tickToPrice(token0, token1, tickLower).toSignificant(15);
      const b = tickToPrice(token1, token0, tickUpper).toSignificant(15);
      const c = tickToPrice(token0, token1, parseInt(slot.data[1])).toSignificant(15);

      console.log("TICKDATA", `a: ${a}, b: ${b}, c: ${c}`);
    }
  }, [addr, fee.data, slot.data, token0AddressData.data, token1AddressData.data, tickLower, tickUpper]);
};

//         var diluted = Math.abs(parseInt(setupInfo.tickUpper) - parseInt(setupInfo.tickLower)) >= 180000;
//         var tickData = {
//           diluted,
//           maxPrice: tickToPrice(
//             lpTokenInfo.uniswapTokens[1 - secondTokenIndex],
//             lpTokenInfo.uniswapTokens[secondTokenIndex],
//             parseInt(setupInfo.tickLower),
//           ).toSignificant(4),
//           minPrice: tickToPrice(
//             lpTokenInfo.uniswapTokens[1 - secondTokenIndex],
//             lpTokenInfo.uniswapTokens[secondTokenIndex],
//             parseInt(setupInfo.tickUpper),
//           ).toSignificant(4),
//           currentPrice: tickToPrice(
//             lpTokenInfo.uniswapTokens[1 - secondTokenIndex],
//             lpTokenInfo.uniswapTokens[secondTokenIndex],
//             parseInt(slot.tick),
//           ).toSignificant(4),
//           cursorNumber: !(c > a) ? 100 : !(c < b) ? 0 : null,
//           outOfRangeLower: parseInt(slot.tick) <= parseInt(setupInfo.tickLower),
//           outOfRangeUpper: parseInt(slot.tick) >= parseInt(setupInfo.tickUpper),
//           tickLowerUSDPrice: 0,
//           tickUpperUSDPrice: 0,
//           tickCurrentUSDPrice: 0,
//         };
//         if (secondTokenIndex === 1) {
//           var maxPrice = tickData.maxPrice;
//           tickData.maxPrice = tickData.minPrice;
//           tickData.minPrice = maxPrice;
//         }
//         if (tickData.cursorNumber !== 0 && tickData.cursorNumber !== 100) {
//           tickData.cursorNumber = (1 / ((Math.sqrt(a * b) - Math.sqrt(b * c)) / (c - Math.sqrt(b * c)) + 1)) * 100;
//         }
//         tickData.cursor = formatMoneyUniV3(
//           secondTokenIndex === 1 ? 100 - tickData.cursorNumber : tickData.cursorNumber,
//           2,
//         );

//         var tokensForPrice = lpTokenInfo.uniswapTokens.map(it =>
//           it.address === ethereumAddress ? VOID_ETHEREUM_ADDRESS : it.address,
//         );
//         var ethIndex = tokensForPrice.indexOf(VOID_ETHEREUM_ADDRESS);
//         if (ethIndex !== -1) {
//           var ethPrice = await getEthereumPrice({ context });
//           tickData.tickLowerUSDPrice =
//             formatNumber(
//               tickToPrice(
//                 lpTokenInfo.uniswapTokens[1 - ethIndex],
//                 lpTokenInfo.uniswapTokens[ethIndex],
//                 parseInt(setupInfo.tickLower),
//               ).toSignificant(15),
//             ) * ethPrice;
//           tickData.tickUpperUSDPrice =
//             formatNumber(
//               tickToPrice(
//                 lpTokenInfo.uniswapTokens[1 - ethIndex],
//                 lpTokenInfo.uniswapTokens[ethIndex],
//                 parseInt(setupInfo.tickUpper),
//               ).toSignificant(15),
//             ) * ethPrice;
//           tickData.tickCurrentUSDPrice =
//             formatNumber(
//               tickToPrice(
//                 lpTokenInfo.uniswapTokens[1 - ethIndex],
//                 lpTokenInfo.uniswapTokens[ethIndex],
//                 parseInt(slot.tick),
//               ).toSignificant(15),
//             ) * ethPrice;
//           tickData.cursor = formatMoneyUniV3(ethIndex === 1 ? 100 - tickData.cursorNumber : tickData.cursorNumber, 2);
//         }
//         setTickData(tickData);
//       } catch (e) {}
//     }),
//   [lpTokenInfo, secondTokenIndex, setupInfo],
// );

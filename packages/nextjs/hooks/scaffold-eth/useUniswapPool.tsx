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
  const uniswapTokens = Promise.all([useScaffoldPoolRead(addr, "token0"), useScaffoldPoolRead(addr, "token1")]);

  uniswapTokens
    .then(results => {
      results.forEach((result, index) => {
        const tokenAddress = result.data;
        console.log(`Token ${index}: ${tokenAddress}`);
      });
    })
    .catch(error => {
      console.log(error);
    });
  try {
    uniswapTokens
      .then(results => {
        const token0Address = results[0].data;
        const token1Address = results[1].data;

        const token0 = new Token(1, token0Address, 18); // assuming 18 decimal places
        const token1 = new Token(1, token1Address, 18);

        const currentPrice = tickToPrice(token0, token1, slot.data.tick);

        // const [tickLower, tickUpper] = [
        //   currentPrice.mul(new Percent(0.9, 100)).toFixed(0), // 10% lower than current price
        //   currentPrice.mul(new Percent(1.1, 100)).toFixed(0), // 10% higher than current price
        // ].map(price => nearestUsableTick(price));

        // console.log(`tickLower: ${tickLower}, tickUpper: ${tickUpper}`);

        const a = tickToPrice(token0, token1, tickLower).toSignificant(15);

        const b = tickToPrice(token1, token0, tickUpper).toSignificant(15);

        const c = tickToPrice(token0, token1, parseInt(slot.data.tick)).toSignificant(15);

        console.log(`a: ${a}, b: ${b}, c: ${c}`);
      })
      .catch(error => {
        console.log(error);
      });
  } catch (e) {
    console.log(e);
  }
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

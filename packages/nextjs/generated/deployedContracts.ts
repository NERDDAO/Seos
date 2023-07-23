const contracts = {
  1: [
    {
      chainId: "1",
      name: "mainnet",
      contracts: {
        YourContract: {
          address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          abi: [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "_owner",
                  type: "address",
                },
              ],
              stateMutability: "nonpayable",
              type: "constructor",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "greetingSetter",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "newGreeting",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "bool",
                  name: "premium",
                  type: "bool",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "value",
                  type: "uint256",
                },
              ],
              name: "GreetingChange",
              type: "event",
            },
            {
              inputs: [],
              name: "greeting",
              outputs: [
                {
                  internalType: "string",
                  name: "",
                  type: "string",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "owner",
              outputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "premium",
              outputs: [
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "string",
                  name: "_newGreeting",
                  type: "string",
                },
              ],
              name: "setGreeting",
              outputs: [],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [],
              name: "totalCounter",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
              ],
              name: "userGreetingCounter",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "withdraw",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              stateMutability: "payable",
              type: "receive",
            },
          ],
        },

        // Farming interface
        FarmMainRegularMinStake: {
          address: "0x129a261afAAe9Fc9AB9D5107e840560d052Cd97E",
          abi: abi: [
            {
              anonymous: false,
              inputs: [{ indexed: true, internalType: "address", name: "rewardTokenAddress", type: "address" }],
              name: "RewardToken",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                { indexed: true, internalType: "address", name: "mainToken", type: "address" },
                { indexed: true, internalType: "address", name: "involvedToken", type: "address" },
              ],
              name: "SetupToken",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                { indexed: true, internalType: "uint256", name: "positionId", type: "uint256" },
                { indexed: true, internalType: "address", name: "from", type: "address" },
                { indexed: true, internalType: "address", name: "to", type: "address" },
              ],
              name: "Transfer",
              type: "event",
            },
            {
              inputs: [],
              name: "ONE_HUNDRED",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "_farmingSetupsCount",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "_farmingSetupsInfoCount",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              name: "_rewardPaid",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              name: "_rewardReceived",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "_rewardTokenAddress",
              outputs: [{ internalType: "address", name: "", type: "address" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                { internalType: "uint256", name: "positionId", type: "uint256" },
                { internalType: "uint128", name: "removedLiquidity", type: "uint128" },
                { internalType: "uint256", name: "amount0Min", type: "uint256" },
                { internalType: "uint256", name: "amount1Min", type: "uint256" },
                { internalType: "bytes", name: "burnData", type: "bytes" },
              ],
              name: "_withdrawLiquidity",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [{ internalType: "uint256", name: "setupInfoIndex", type: "uint256" }],
              name: "activateSetup",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                { internalType: "uint256", name: "positionId", type: "uint256" },
                {
                  components: [
                    { internalType: "uint256", name: "setupIndex", type: "uint256" },
                    { internalType: "uint256", name: "amount0", type: "uint256" },
                    { internalType: "uint256", name: "amount1", type: "uint256" },
                    { internalType: "address", name: "positionOwner", type: "address" },
                    { internalType: "uint256", name: "amount0Min", type: "uint256" },
                    { internalType: "uint256", name: "amount1Min", type: "uint256" },
                  ],
                  internalType: "struct FarmingPositionRequest",
                  name: "request",
                  type: "tuple",
                },
              ],
              name: "addLiquidity",
              outputs: [],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [
                { internalType: "uint256", name: "positionId", type: "uint256" },
                { internalType: "bool", name: "isExt", type: "bool" },
              ],
              name: "calculateFreeFarmingReward",
              outputs: [{ internalType: "uint256", name: "reward", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                { internalType: "address[]", name: "tokens", type: "address[]" },
                { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
              ],
              name: "finalFlush",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [],
              name: "host",
              outputs: [{ internalType: "address", name: "", type: "address" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "initializer",
              outputs: [{ internalType: "address", name: "", type: "address" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [{ internalType: "bytes", name: "lazyInitData", type: "bytes" }],
              name: "lazyInit",
              outputs: [{ internalType: "bytes", name: "extensionReturnCall", type: "bytes" }],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [],
              name: "nonfungiblePositionManager",
              outputs: [{ internalType: "contract INonfungiblePositionManager", name: "", type: "address" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  components: [
                    { internalType: "uint256", name: "setupIndex", type: "uint256" },
                    { internalType: "uint256", name: "amount0", type: "uint256" },
                    { internalType: "uint256", name: "amount1", type: "uint256" },
                    { internalType: "address", name: "positionOwner", type: "address" },
                    { internalType: "uint256", name: "amount0Min", type: "uint256" },
                    { internalType: "uint256", name: "amount1Min", type: "uint256" },
                  ],
                  internalType: "struct FarmingPositionRequest",
                  name: "request",
                  type: "tuple",
                },
              ],
              name: "openPosition",
              outputs: [{ internalType: "uint256", name: "positionId", type: "uint256" }],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [{ internalType: "uint256", name: "positionId", type: "uint256" }],
              name: "position",
              outputs: [
                {
                  components: [
                    { internalType: "address", name: "uniqueOwner", type: "address" },
                    { internalType: "uint256", name: "setupIndex", type: "uint256" },
                    { internalType: "uint256", name: "creationBlock", type: "uint256" },
                    { internalType: "uint256", name: "tokenId", type: "uint256" },
                    { internalType: "uint256", name: "reward", type: "uint256" },
                  ],
                  internalType: "struct FarmingPosition",
                  name: "",
                  type: "tuple",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  components: [
                    { internalType: "bool", name: "add", type: "bool" },
                    { internalType: "bool", name: "disable", type: "bool" },
                    { internalType: "uint256", name: "index", type: "uint256" },
                    {
                      components: [
                        { internalType: "uint256", name: "blockDuration", type: "uint256" },
                        { internalType: "uint256", name: "startBlock", type: "uint256" },
                        { internalType: "uint256", name: "originalRewardPerBlock", type: "uint256" },
                        { internalType: "uint256", name: "minStakeable", type: "uint256" },
                        { internalType: "uint256", name: "renewTimes", type: "uint256" },
                        { internalType: "address", name: "liquidityPoolTokenAddress", type: "address" },
                        { internalType: "address", name: "mainTokenAddress", type: "address" },
                        { internalType: "bool", name: "involvingETH", type: "bool" },
                        { internalType: "uint256", name: "setupsCount", type: "uint256" },
                        { internalType: "uint256", name: "lastSetupIndex", type: "uint256" },
                        { internalType: "int24", name: "tickLower", type: "int24" },
                        { internalType: "int24", name: "tickUpper", type: "int24" },
                      ],
                      internalType: "struct FarmingSetupInfo",
                      name: "info",
                      type: "tuple",
                    },
                  ],
                  internalType: "struct FarmingSetupConfiguration[]",
                  name: "farmingSetups",
                  type: "tuple[]",
                },
              ],
              name: "setFarmingSetups",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [{ internalType: "uint256", name: "setupIndex", type: "uint256" }],
              name: "setup",
              outputs: [
                {
                  components: [
                    { internalType: "uint256", name: "infoIndex", type: "uint256" },
                    { internalType: "bool", name: "active", type: "bool" },
                    { internalType: "uint256", name: "startBlock", type: "uint256" },
                    { internalType: "uint256", name: "endBlock", type: "uint256" },
                    { internalType: "uint256", name: "lastUpdateBlock", type: "uint256" },
                    { internalType: "uint256", name: "deprecatedObjectId", type: "uint256" },
                    { internalType: "uint256", name: "rewardPerBlock", type: "uint256" },
                    { internalType: "uint128", name: "totalSupply", type: "uint128" },
                  ],
                  internalType: "struct FarmingSetup",
                  name: "",
                  type: "tuple",
                },
                {
                  components: [
                    { internalType: "uint256", name: "blockDuration", type: "uint256" },
                    { internalType: "uint256", name: "startBlock", type: "uint256" },
                    { internalType: "uint256", name: "originalRewardPerBlock", type: "uint256" },
                    { internalType: "uint256", name: "minStakeable", type: "uint256" },
                    { internalType: "uint256", name: "renewTimes", type: "uint256" },
                    { internalType: "address", name: "liquidityPoolTokenAddress", type: "address" },
                    { internalType: "address", name: "mainTokenAddress", type: "address" },
                    { internalType: "bool", name: "involvingETH", type: "bool" },
                    { internalType: "uint256", name: "setupsCount", type: "uint256" },
                    { internalType: "uint256", name: "lastSetupIndex", type: "uint256" },
                    { internalType: "int24", name: "tickLower", type: "int24" },
                    { internalType: "int24", name: "tickUpper", type: "int24" },
                  ],
                  internalType: "struct FarmingSetupInfo",
                  name: "",
                  type: "tuple",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "setups",
              outputs: [
                {
                  components: [
                    { internalType: "uint256", name: "infoIndex", type: "uint256" },
                    { internalType: "bool", name: "active", type: "bool" },
                    { internalType: "uint256", name: "startBlock", type: "uint256" },
                    { internalType: "uint256", name: "endBlock", type: "uint256" },
                    { internalType: "uint256", name: "lastUpdateBlock", type: "uint256" },
                    { internalType: "uint256", name: "deprecatedObjectId", type: "uint256" },
                    { internalType: "uint256", name: "rewardPerBlock", type: "uint256" },
                    { internalType: "uint128", name: "totalSupply", type: "uint128" },
                  ],
                  internalType: "struct FarmingSetup[]",
                  name: "",
                  type: "tuple[]",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [{ internalType: "uint256", name: "setupInfoIndex", type: "uint256" }],
              name: "toggleSetup",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                { internalType: "uint256", name: "positionId", type: "uint256" },
                { internalType: "uint128", name: "removedLiquidity", type: "uint128" },
                { internalType: "uint256", name: "amount0Min", type: "uint256" },
                { internalType: "uint256", name: "amount1Min", type: "uint256" },
                { internalType: "bytes", name: "burnData", type: "bytes" },
              ],
              name: "withdrawLiquidity",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                { internalType: "uint256", name: "positionId", type: "uint256" },
                { internalType: "uint128", name: "removedLiquidity", type: "uint128" },
                { internalType: "bytes", name: "burnData", type: "bytes" },
              ],
              name: "withdrawLiquidity",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [{ internalType: "uint256", name: "positionId", type: "uint256" }],
              name: "withdrawReward",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            { stateMutability: "payable", type: "receive" },
          ],
        },
      },
    },
  ],
} as const;

export default contracts;


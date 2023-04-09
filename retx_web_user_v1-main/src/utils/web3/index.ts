import { assetApi, userApi } from "@apis/index";
import axios from "axios";
import { InfoCmd } from "src/models/nft.model";
import { AssetTransaction } from "src/models/smart_contract.model";
import { P2PTransaction } from "src/models/user/p2p-transaction.model";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { TransactionReceipt } from "web3-core";

export function paramsToObj(params: any[]) {
  let obj = {};
  params?.forEach((item) => {
    obj[item.name] = item.value;
  });
  return obj;
}

export function formatAddress(text: string) {
  let hex = text.replace(/^0x/, '');
  hex = hex.replace(/^0+/, '');
  while (hex.length < 40) {
    hex = "0" + hex;
  }
  return "0x"+hex;
}

export async function getAllEvents({
  contract,
  fromBlock,
  toBlock,
}: {
  contract: Contract;
  fromBlock: number;
  toBlock: number;
}) {
  let allEvents = [];

  const batchSize = 5000; // Chia phạm vi lấy các transaction thành các batch có kích thước 5000 blocks

  let startBlock = fromBlock;
  console.log("🚀 ~ file: web3.ts:37 ~ startBlock:", startBlock);
  let endBlock = startBlock + batchSize;

  while (startBlock <= toBlock) {
    let events = await contract.getPastEvents("Transfer", {
      fromBlock: startBlock,
      toBlock: endBlock,
    });
    allEvents = allEvents.concat(events);

    startBlock = endBlock + 1;
    endBlock = Math.min(startBlock + batchSize, toBlock);
  }

  return allEvents;
}

export async function runPromisesSequentially<T>(
  promises: Promise<T>[]
): Promise<T[]> {
  if (promises.length === 0) {
    return Promise.resolve([]);
  }

  const [firstPromise, ...restPromises] = promises;

  return firstPromise.then((result) => {
    return runPromisesSequentially(restPromises).then((results: T[]) => {
      return [result, ...results];
    });
  });
}

async function getInfoTradeAcceptNegotiate(
  web3: Web3,
  transactionReceipt: TransactionReceipt
) {
  try {
    let logsPrice = transactionReceipt.logs[0];
    let logsFee = transactionReceipt.logs[1];
    let logsExchange = transactionReceipt.logs[2];
    let logsCollection =
      transactionReceipt.logs[transactionReceipt.logs.length - 1];

    return {
      from: formatAddress(logsPrice.topics[2]),
      to: formatAddress(logsExchange.topics[2]),
      price: web3.utils.hexToNumberString(logsPrice.data),
      fee: web3.utils.hexToNumberString(logsFee.data),
      nftId: web3.utils.hexToNumberString(logsCollection.data),
    };
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function getInfoTradeAcceptSell(
  web3: Web3,
  transactionReceipt: TransactionReceipt
) {
  try {
    let logsPrice = transactionReceipt.logs[0];
    let logsFee = transactionReceipt.logs[2];
    let logsCollection =
      transactionReceipt.logs[transactionReceipt.logs.length - 1];

    return {
      from: formatAddress(logsPrice.topics[2]),
      to: formatAddress(logsPrice.topics[1]),
      price: web3.utils.hexToNumberString(logsPrice.data),
      fee: web3.utils.hexToNumberString(logsFee.data),
      nftId: web3.utils.hexToNumberString(logsCollection.data),
    };
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function parseDataCollectionAsset({
  web3,
  transactionHash,
  assetAddress,
  abiCollection,
  abiNftExchange,
}: {
  web3: Web3;
  transactionHash: string;
  assetAddress: string;
  abiNftExchange: string;
  abiCollection: string;
}) {
  let result = {
    timestamp: null,
    blockNumber: null,
    method: null,
    from: null,
    to: null,
    price: null,
    fee: null,
    nftId: null,
    assetType: "collection_asset",
    assetAddress,
    status: null,
    transactionHash: null,
  };

  let transactionReceipt = await web3.eth.getTransactionReceipt(
    transactionHash
  );
  result.status = transactionReceipt.status;
  result.transactionHash = transactionReceipt.transactionHash;

  let transaction = await web3.eth.getTransaction(transactionHash);
  result.blockNumber = transaction.blockNumber;
  let input = transaction.input;

  let { timestamp } = await web3.eth.getBlock(transaction?.blockNumber);
  result.timestamp = timestamp;

  let decoded: any;

  if (transaction.to.toLowerCase() != assetAddress.toLowerCase()) {
    let { data } = await axios({
      url: "/api/decode-input",
      method: "POST",
      data: {
        abi: abiNftExchange,
        input,
      },
    });
    decoded = data;
  } else {
    let { data } = await axios({
      url: "/api/decode-input",
      method: "POST",
      data: {
        abi: abiCollection,
        input,
      },
    });
    decoded = data;
  }

  result.method = decoded.name;
  decoded.params = paramsToObj(decoded.params);

  if (result.method == "transferFrom") {
    result.from = decoded.params?._from;
    result.to = decoded.params?._to;
    result.nftId = decoded.params?._tokenId;
  } else if (result.method == "negCmd_accept") {
    let data = await getInfoTradeAcceptNegotiate(web3, transactionReceipt);
    result.from = data.from;
    result.to = data.to;
    result.price = data.price;
    result.fee = data.fee;
    result.nftId = data.nftId;
  } else if (result.method == "sellCmd_accept") {
    let data = await getInfoTradeAcceptSell(web3, transactionReceipt);
    result.from = data.from;
    result.to = data.to;
    result.price = data.price;
    result.fee = data.fee;
    result.nftId = data.nftId;
  } else return null;

  return new AssetTransaction(result as any);
}

export async function getTransactionsCollectionAsset({
  web3,
  assetAddress,
  abiCollection,
  abiNftExchange,
  assetContract,
}: {
  web3: Web3;
  assetAddress: string;
  abiNftExchange: string;
  abiCollection: string;
  assetContract: Contract;
}) {
  try {
    let fromBlock: number;

    let dataAssetTransactions = await assetApi.getAssetTransactions(
      assetAddress
    );
    let blockTransaction = await assetApi.getAssetBlockTransactions(
      assetAddress
    );

    fromBlock = blockTransaction + 1;

    let toBlock = await web3.eth.getBlockNumber();

    let events = await getAllEvents({
      contract: assetContract,
      fromBlock,
      toBlock,
    });
    let data = await runPromisesSequentially<AssetTransaction>(
      events.map(async (event) =>
        parseDataCollectionAsset({
          transactionHash: event.transactionHash,
          web3,
          assetAddress,
          abiCollection,
          abiNftExchange,
        })
      )
    );
    data = data.filter((item) => !!item);
    data.sort((a, b) => -a.blockNumber + b.blockNumber);
    data.length > 0 &&
      (await assetApi.updateAssetTransactions(assetAddress, data));
    toBlock > fromBlock &&
      (await assetApi.addAssetBlockTransaction({
        assetAddress,
        fromBlock: toBlock,
      }));
    return [...data, ...dataAssetTransactions];
  } catch (err) {
    console.log(err);
    return [];
  }
}

function getInfoTradeBuyAsset(params) {
  return {
    to: params.to, // Người mua
    price: params.amountInMax,
    amount: params.amountOut,
  };
}

function getInfoTradeSellAsset(params) {
  return {
    from: params.to, // Người bán
    price: params.amountOutMin,
    amount: params.amountIn,
  };
}

function getInfoTradeTransfer(params) {
  return {
    to: params.recipient, // Người bán
    price: 0,
    amount: params.amount,
  };
}

async function parseDataSingleAsset({
  web3,
  transactionHash,
  assetAddress,
  abiSingleAsset,
  abiPancakeRouter,
}: {
  web3: Web3;
  transactionHash: string;
  assetAddress: string;
  abiSingleAsset: string;
  abiPancakeRouter: string;
}) {
  // console.log("----------------------------------------------------------------")
  let result = {
    timestamp: null,
    blockNumber: null,
    method: null,
    from: null,
    to: null,
    price: null,
    amount: null,
    fee: null,
    nftId: null,
    assetType: "single_asset",
    assetAddress: assetAddress.toLowerCase(),
    status: null,
    transactionHash: null,
  };

  let transactionReceipt = await web3.eth.getTransactionReceipt(
    transactionHash
  );
  result.status = transactionReceipt.status;
  result.transactionHash = transactionReceipt.transactionHash;

  let transaction = await web3.eth.getTransaction(transactionHash);
  result.blockNumber = transaction.blockNumber;
  let input = transaction.input;

  let { timestamp } = await web3.eth.getBlock(transaction?.blockNumber);
  result.timestamp = timestamp;

  let decoded: any;

  if (transaction.to.toLowerCase() != assetAddress.toLowerCase()) {
    let { data } = await axios({
      url: "/api/decode-input",
      method: "POST",
      data: {
        abi: abiPancakeRouter,
        input,
      },
    });
    decoded = data;
  } else {
    let { data } = await axios({
      url: "/api/decode-input",
      method: "POST",
      data: {
        abi: abiSingleAsset,
        input,
      },
    });
    decoded = data;
  }

  if (!decoded.params) return null;
  result.method = decoded.name;
  decoded.params = paramsToObj(decoded.params);

  if (result.method == "swapExactTokensForTokens") {
    // bán
    let { from, price, amount } = getInfoTradeSellAsset(decoded.params);
    result.to = transaction.to;
    result.from = from;
    result.price = price;
    result.amount = amount;
  } else if (result.method == "swapTokensForExactTokens") {
    // mua
    let { to, price, amount } = getInfoTradeBuyAsset(decoded.params);
    result.from = transaction.to;
    result.to = to;
    result.price = price;
    result.amount = amount;
  } else if (result.method == "transfer") {
    let { to, price, amount } = getInfoTradeTransfer(decoded.params);
    result.from = transaction.from;
    result.to = to;
    result.price = price;
    result.amount = amount;
  }
  else if (result.method == "transferFrom") {
    result.from = decoded?.params?.sender;
    result.to = decoded?.params?.recipient;
    result.price = 0;
    result.amount = decoded?.params?.amount;
  }  else return null;

  return new AssetTransaction(result as any);
}

export async function getTransactionsSingleAsset({
  web3,
  assetAddress,
  abiSingleAsset,
  abiPancakeRouter,
  assetContract,
}: {
  web3: Web3;
  assetAddress: string;
  abiPancakeRouter: string;
  abiSingleAsset: string;
  assetContract: Contract;
}) {
  try {
    let fromBlock: number;
    const BLOCK_NUMBER_DEFAULT = 26189051;
    let dataAssetTransactions = await assetApi.getAssetTransactions(
      assetAddress
    );
    let blockTransaction = await assetApi.getAssetBlockTransactions(
      assetAddress
    );
    
    fromBlock = blockTransaction + 1;


    let toBlock = await web3.eth.getBlockNumber();

    let events = await getAllEvents({
      contract: assetContract,
      fromBlock:
        fromBlock > BLOCK_NUMBER_DEFAULT ? fromBlock : BLOCK_NUMBER_DEFAULT,
      toBlock,
    });
    let data = await runPromisesSequentially<AssetTransaction>(
      events.map(async (event) =>
        parseDataSingleAsset({
          transactionHash: event.transactionHash,
          web3,
          assetAddress,
          abiSingleAsset,
          abiPancakeRouter,
        })
      )
    );
    data = data.filter((item) => !!item);
    data.sort((a, b) => -a.blockNumber + b.blockNumber);

    data.length > 0 &&
      (await assetApi.updateAssetTransactions(assetAddress, data));

    toBlock > fromBlock &&
      (await assetApi.addAssetBlockTransaction({
        assetAddress,
        fromBlock: toBlock,
      }));

    return [...data, ...dataAssetTransactions];
  } catch (err) {
    console.log(err);
    return [];
  }
}

// Lấy owner thực sự của nftID trong collection asset
export async function getOwnerOfNftId({
  assetContract,
  nftExchangeContract,
  nftId,
  nftExchangeAddress,
  assetAddress,
}: {
  assetContract: Contract;
  nftExchangeContract: Contract;
  nftId: number;
  nftExchangeAddress: string;
  assetAddress: string;
}) {
  try {
    let owner: string = await assetContract.methods.ownerOf(nftId).call();
    owner = owner.toLowerCase();
    if (owner == nftExchangeAddress.toLowerCase()) {
      let value: any = await nftExchangeContract.methods
        .sellCmd_getInfo(assetAddress, nftId)
        .call();
      let info = new InfoCmd(value);
      if (!!info.is_open) {
        return info.maker.toLowerCase();
      }
    } else return owner;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function parseDataP2PTransaction({
  web3,
  transactionHash,
  abiStableCoin,
}: {
  web3: Web3;
  transactionHash: string;
  abiStableCoin: string;
}) {
  // console.log("----------------------------------------------------------------")
  let result = {
    timestamp: null,
    blockNumber: null,
    method: null,
    from: null,
    to: null,
    amount: 0,
    status: null,
    transactionHash: null,
  };

  let transactionReceipt = await web3.eth.getTransactionReceipt(
    transactionHash
  );
  result.status = transactionReceipt.status;
  result.transactionHash = transactionReceipt.transactionHash;

  let transaction = await web3.eth.getTransaction(transactionHash);
  result.blockNumber = transaction.blockNumber;
  let input = transaction.input;

  let { timestamp } = await web3.eth.getBlock(transaction?.blockNumber);
  result.timestamp = timestamp;

  let { data } = await axios({
    url: "/api/decode-input",
    method: "POST",
    data: {
      abi: abiStableCoin,
      input,
    },
  });
  let decoded = data;

  if (!decoded) {
    return null;
  }

  result.method = decoded.name;
  decoded.params = paramsToObj(decoded.params);

  if (result.method == "transfer") {
    result.from = transaction.from;
    result.to = decoded.params?.recipient;
    result.amount = parseInt(decoded.params?.amount);
  } else if (result.method == "transferFrom") {
    result.from = decoded.params?.sender;
    result.to = decoded.params?.recipient;
    result.amount = parseInt(decoded.params?.amount);
  } else return null;

  return new P2PTransaction(result);
}

export async function getP2PTransaction({
  web3,
  abiStableCoin,
  stableCoinContract,
  myWalletAddress,
  addressStableCoin,
}: {
  web3: Web3;
  abiStableCoin: string;
  stableCoinContract: Contract;
  myWalletAddress: string;
  addressStableCoin: string;
}) {
  try {
    const BLOCK_NUMBER_DEFAULT = 24011832;
    let fromBlock: number = 0;

    let { data: dataTransactions, lastBlockNumber } =
      await userApi.getP2PTransaction();

    let blockTransaction = await assetApi.getAssetBlockTransactions(
      addressStableCoin
    );
    if (lastBlockNumber > blockTransaction) {
      fromBlock = lastBlockNumber + 1;
    } else {
      fromBlock = blockTransaction + 1;
    }

    let toBlock = await web3.eth.getBlockNumber();

    let events = await getAllEvents({
      contract: stableCoinContract,
      fromBlock:
        fromBlock > BLOCK_NUMBER_DEFAULT ? fromBlock : BLOCK_NUMBER_DEFAULT,
      toBlock,
    });
    let data = await runPromisesSequentially<P2PTransaction>(
      events.map(async (event) =>
        parseDataP2PTransaction({
          transactionHash: event.transactionHash,
          web3,
          abiStableCoin,
        })
      )
    );
    data = data.filter((item) => !!item);
    data.sort((a, b) => -a.blockNumber + b.blockNumber);

    data.length > 0 && (await userApi.updateP2PTransaction(data));

    toBlock > fromBlock &&
      (await assetApi.addAssetBlockTransaction({
        assetAddress: addressStableCoin,
        fromBlock: toBlock,
      }));

    return [...data, ...dataTransactions].filter(
      (item) =>
        item.from.includes(myWalletAddress) || item.to.includes(myWalletAddress)
    );
  } catch (err) {
    console.log(err);
    return [];
  }
}

export async function getListNegotiated({
  nftExchange,
  collectionAddress,
  nftId,
}: {
  nftExchange: Contract;
  collectionAddress: string;
  nftId: number;
}) {
  try {
    let total = await nftExchange.methods
      .negCmd_getCounter(collectionAddress, nftId)
      .call();
    let list = [];
    for (let index = 1; index <= total; index++) {
      let item = await nftExchange.methods
        .negCmd_getInfo(collectionAddress, nftId, index)
        .call();
      list.push(item);
    }
    return list.map(item => new InfoCmd(item))
  } catch (err) {
    console.log(err);
  }
}

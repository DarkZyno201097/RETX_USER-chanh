import { assetApi, userApi } from "@apis/index";
import axios from "axios";
import { InfoCmd } from "src/models/nft.model";
import { AssetTransaction } from "src/models/smart_contract.model";
import { P2PTransaction } from "src/models/user/p2p-transaction.model";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";
import { TransactionReceipt } from "web3-core";
import {
  formatAddress,
  getAllEvents,
  paramsToObj,
  runPromisesSequentially,
} from ".";

async function getInfoTradeInvest(transactionHash: string, web3: Web3) {
  try {
    let transactionReceipt = await web3.eth.getTransactionReceipt(
      transactionHash
    );
    let logsPrice = transactionReceipt.logs[0];
    let logsFee = transactionReceipt.logs[2];
    let logsAsset = transactionReceipt.logs[4];

    return {
      from: formatAddress(logsPrice.topics[1]),
      price: web3.utils.hexToNumberString(logsPrice.data),
      fee: web3.utils.hexToNumberString(logsFee.data),
      amount: web3.utils.hexToNumberString(logsAsset.data),
    };
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function getInfoTradeWithdraw(transactionHash: string, web3: Web3) {
  try {
    let transactionReceipt = await web3.eth.getTransactionReceipt(
      transactionHash
    );
    let logsPrice = transactionReceipt.logs[2];
    let logsFee = transactionReceipt.logs[3];
    let logsAsset = transactionReceipt.logs[0];

    return {
      from: formatAddress(logsPrice.topics[1]),
      to: formatAddress(logsPrice.topics[2]),
      price: web3.utils.hexToNumberString(logsPrice.data),
      fee: web3.utils.hexToNumberString(logsFee.data),
      amount: web3.utils.hexToNumberString(logsAsset.data),
    };
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function parseDataRisingPoolAsset({
  web3,
  transactionHash,
  assetAddress,
  abiSingleAsset,
  abiPool,
}: {
  web3: Web3;
  transactionHash: string;
  assetAddress: string;
  abiSingleAsset: string;
  abiPool: string;
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
    assetType: "fund_rising_pool",
    assetAddress: assetAddress.toLowerCase(),
    status: null,
    transactionHash: null,
  };

  let transactionReceipt = await web3.eth.getTransactionReceipt(
    transactionHash
  );
  result.status = transactionReceipt.status;
  result.transactionHash = transactionHash;

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
        abi: abiPool,
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

  if (result.method == "invest") {
    let { from, price, amount, fee } = await getInfoTradeInvest(
      transactionHash,
      web3
    );
    result.to = transaction.to;
    result.from = from;
    result.price = price;
    result.amount = amount;
    result.fee = fee;
  } else if (result.method == "withdraw") {
    let { from, price, amount, fee, to } = await getInfoTradeWithdraw(
      transactionHash,
      web3
    );
    result.to = to;
    result.from = from;
    result.price = parseFloat(price) + parseFloat(fee);
    result.amount = amount;
    result.fee = fee;
  } else if (result.method == "transfer") {
    result.from = transaction.from;
    result.to = decoded?.params?.recipient;
    result.price = 0;
    result.amount = decoded?.params?.amount;
  } else if (result.method == "transferFrom") {
    result.from = decoded?.params?.sender;
    result.to = decoded?.params?.recipient;
    result.price = 0;
    result.amount = decoded?.params?.amount;
  } else return null;

  return new AssetTransaction(result as any);
}

export async function getTransactionsRisingPoolAsset({
  web3,
  assetAddress,
  abiPool,
  abiSingleAsset,
  assetContract,
}: {
  web3: Web3;
  assetAddress: string;
  abiSingleAsset: string;
  abiPool: string;
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
        parseDataRisingPoolAsset({
          transactionHash: event.transactionHash,
          web3,
          assetAddress,
          abiPool,
          abiSingleAsset,
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

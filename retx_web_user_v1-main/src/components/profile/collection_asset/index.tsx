import { Table, Tag, Space, Tabs } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { assetApi } from "@apis/index";
import { authSelector } from "@store/auth/auth.slice";
import { contractSelector } from "@store/contract/contract.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { formatCurrency } from "@utils/number";
import { routeNames } from "@utils/router";
import { slugify } from "@utils/string";
import { trans } from "src/resources/trans";
import { RealEstateAssetView } from "src/models/asset/real_estate.model";
import {
  AssetTransaction,
  TransactionDTO,
} from "src/models/smart_contract.model";
import {
  getOwnerOfNftId,
  getTransactionsCollectionAsset,
  runPromisesSequentially,
} from "@utils/web3";
import TableCollectionAsset from "@components/modal/asset_transactions";
import { InfoCmd } from "src/models/nft.model";
import ProfileCollectionAssetPurchased from "./purchased";
import ProfileCollectionAssetNegotiate from "./negotiate";
import { Contract } from "web3-eth-contract";

class ColumnData extends RealEstateAssetView {
  index: number;
  assetAddress: string;
  purchasedListNftId: number[];
  negotiateListNftId: number[];
  contractCollection: Contract;
  constructor({
    product,
    index,
    purchasedListNftId,
    negotiateListNftId,
    contractCollection,
  }: {
    product: RealEstateAssetView;
    index: number;
    purchasedListNftId: number[];
    negotiateListNftId: number[];
    contractCollection: Contract;
  }) {
    super(product);
    this.index = index;
    this.assetAddress = product.digitalInfo.assetAddress;
    this.purchasedListNftId = purchasedListNftId;
    this.negotiateListNftId = negotiateListNftId;
    this.contractCollection = contractCollection;
  }
}

export default function ProfileCollectionAsset() {
  const { infoContract, loadedInfoContracts, web3, web3Contract } =
    useSelector(contractSelector);
  const [dataTable, setDataTable] = useState<ColumnData[]>([]);
  const { user } = useSelector(authSelector);
  const { locate } = useSelector(locateSelector);

  const checkNegotiateAsset = async ({
    collectionAddress,
    nftId,
  }: {
    collectionAddress: string;
    nftId: number;
  }) => {
    try {
      let total = await web3Contract.nftExchange.methods
        .negCmd_getCounter(collectionAddress, nftId)
        .call();
      for (let index = 1; index <= total; index++) {
        let item = await web3Contract.nftExchange.methods
          .negCmd_getInfo(collectionAddress, nftId, index)
          .call();
        let info = new InfoCmd(item);
        // console.log("🚀 ~ file: collection_asset.tsx:123 ~ ProfileCollectionAsset ~ info:", info)
        if (
          info.maker.toLowerCase() == user.walletAddress &&
          info.is_open == true
        ) {
          return true;
        }
      }
      return false;
    } catch (err) {
      console.log("🚀 ~ file: box_trade.tsx:116 ~ getInfoSellCmd ~ err:", err);
    }
  };

  const checkPurchasedAndNegotiateAsset = (
    item: RealEstateAssetView
  ): Promise<{
    purchasedListNftId: number[];
    negotiateListNftId: number[];
    contractCollection: Contract;
  } | null> =>
    new Promise(async (resolve, reject) => {
      let temp = [...dataTable];
      if (temp.filter((i) => i._id != item._id).length <= 0) {
        let contract = new web3.eth.Contract(
          JSON.parse(infoContract.collection.abi),
          item.digitalInfo.assetAddress
        );
        let totalSupply = item.digitalInfo.totalSupply;

        let purchasedListNftId = [];
        let negotiateListNftId = [];
        for (let i = 1; i <= totalSupply; i++) {
          let owner = await getOwnerOfNftId({
            assetAddress: item.digitalInfo.assetAddress,
            nftExchangeAddress: infoContract.nftExchange.address,
            assetContract: contract,
            nftExchangeContract: web3Contract.nftExchange,
            nftId: i,
          });
          if (owner == user.walletAddress) {
            purchasedListNftId.push(i);
          } else if (
            await checkNegotiateAsset({
              collectionAddress: item.digitalInfo.assetAddress,
              nftId: i,
            })
          ) {
            negotiateListNftId.push(i);
          }
        }
        resolve({
          purchasedListNftId,
          negotiateListNftId,
          contractCollection: contract
        });
      } else resolve(null);
    });

  useEffect(() => {
    (async () => {
      try {
        if (
          user.walletAddress &&
          loadedInfoContracts &&
          infoContract.collection.abi &&
          !!web3
        )
          await getPurchasedAndNegotiateAsset();
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingTable(false);
      }
    })();
  }, [user.walletAddress, loadedInfoContracts, infoContract, web3]);

  const [loadingTable, setLoadingTable] = useState(false);

  const getPurchasedAndNegotiateAsset = async () => {
    setLoadingTable(true);
    let response: any = await assetApi.getAssets({
      limit: 9999999,
      page: 1,
      filterObj: { assetType: "collection_asset" },
    });

    await runPromisesSequentially(
      response.data.map(async (item, index) => {
        let r = await checkPurchasedAndNegotiateAsset(item);
        if (!!r) {
          let asset = new ColumnData({
            product: item,
            index: index + 1,
            purchasedListNftId: r.purchasedListNftId,
            negotiateListNftId: r.negotiateListNftId,
            contractCollection: r.contractCollection
          });
          setDataTable((dataTable) => [...dataTable, asset]);
        }
      })
    );
  };

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab={trans[locate].owned_asset} key="1">
          <ProfileCollectionAssetPurchased
            loadingTable={loadingTable}
            dataTable={dataTable.filter(
              (item) => item.purchasedListNftId.length > 0
            )}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={trans[locate].asset_is_paying_price} key="2">
          <ProfileCollectionAssetNegotiate
            loadingTable={loadingTable}
            dataTable={dataTable.filter(
              (item) => item.negotiateListNftId.length > 0
            )}
          />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

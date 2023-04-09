import { Table, Tag, Space } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { assetApi } from "@apis/index";
import AssetTransactions from "@components/modal/asset_transactions";
import UnitPrice from "@components/swap/unit_price";
import { assetSelector } from "@store/asset/asset.slice";
import { authSelector } from "@store/auth/auth.slice";
import { contractSelector } from "@store/contract/contract.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { formatCurrency } from "@utils/number";
import { routeNames } from "@utils/router";
import { slugify } from "@utils/string";
import { trans } from "src/resources/trans";
import { RealEstateAssetView } from "src/models/asset/real_estate.model";
import Networks from "@utils/networks.json";
import {
  AssetTransaction,
  TransactionDTO,
} from "src/models/smart_contract.model";
import { TransactionContract } from "src/models/transaction.model";
import {
  getTransactionsSingleAsset,
  runPromisesSequentially,
} from "@utils/web3";
import ModalTransactionAsset from "@components/modal/asset_transactions";
import Link from "next/link";

class ColumnData extends RealEstateAssetView {
  balance: string;
  index: number;
  address: string;
  constructor({
    product,
    balance,
    index,
  }: {
    product: RealEstateAssetView;
    balance: string;
    index: number;
  }) {
    super(product);
    this.balance = balance;
    this.index = index;
    this.address = product.digitalInfo.assetAddress;
  }
}

export default function ProfileAssets() {
  const dispatch = useDispatch();
  const { infoContract, loadedInfoContracts, web3 } =
    useSelector(contractSelector);
  const [dataTable, setDataTable] = useState<ColumnData[]>([]);
  const { user } = useSelector(authSelector);
  const { locate } = useSelector(locateSelector);

  const [textSeaching, setTextSeaching] = useState("");

  const columns = [
    {
      title: trans[locate].name,
      dataIndex: "name",
      key: "name",
      render: (text, record: ColumnData) => (
        <Link href={routeNames.product + "/" + record._id}>
          {record.digitalInfo.assetName[locate]}
        </Link>
      ),
    },
    {
      title: trans[locate].my_portion,
      dataIndex: "balance",
      key: "balance",
      render: (text) => <span>{formatCurrency(text)}</span>,
      defaultSortOrder: "ascend",
      sorter: (a: ColumnData, b: ColumnData) =>
        -parseFloat(a.balance) + parseFloat(b.balance),
    },
    {
      title: trans[locate].value_of_portion,
      dataIndex: "price",
      key: "price",
      render: (text) => <>{text ? text : "N/A"}</>,
    },
    {
      title: "",
      dataIndex: "",
      key: "",
      render: (value, record: ColumnData) => {
        return (
          <div className="d-flex justify-content-center">
            <button
              onClick={() => {
                setVisibleTableTransactions(true);
                getTransactions(new RealEstateAssetView(record));
              }}
              className="btn btn-outline-secondary"
            >
              {trans[locate].view_transactions}
            </button>
          </div>
        );
      },
    },
  ];

  const checkAssetPurchased = (item: RealEstateAssetView) =>
    new Promise(async (resolve, reject) => {
      let temp = [...dataTable];
      if (temp.filter((i) => i._id != item._id).length <= 0) {
        let contract = new web3.eth.Contract(
          JSON.parse(infoContract.asset.abi),
          item.digitalInfo.assetAddress
        );
        let balance = await contract.methods
          .balanceOf(user.walletAddress)
          .call();
        setTimeout(() => {
          resolve(balance);
        }, 2000);
      } else resolve(null);
    });

  useEffect(() => {
    (async () => {
      try {
        if (
          user.walletAddress &&
          loadedInfoContracts &&
          infoContract.asset.abi &&
          !!web3
        )
          await getAssetPurchased();
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingTable(false);
      }
    })();
  }, [user.walletAddress, loadedInfoContracts, infoContract, web3]);

  const [loadingTable, setLoadingTable] = useState(false);

  const getAssetPurchased = async () => {
    setLoadingTable(true);
    let response = await assetApi.getAssets({
      limit: 9999999,
      page: 1,
      filterObj: { assetType: "single_asset" },
    });

    await runPromisesSequentially(
      response.data.map(async (item, index) => {
        let r = await checkAssetPurchased(item);
        if (!!r && r != "0") {
          let asset = new ColumnData({
            product: item,
            balance: r as any,
            index: index + 1,
          });
          setDataTable((dataTable) => [...dataTable, asset]);
        }
      })
    );
  };

  const [changeState, setChangeState] = useState(1);
  useEffect(() => {
    setChangeState((changeState) => changeState + 1);
    console.log("dataTable: ", dataTable);
  }, [dataTable]);

  const [visibleTableTransactions, setVisibleTableTransactions] =
    useState(false);
  const [transactions, setTransactions] = useState<AssetTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const getTransactions = async (asset: RealEstateAssetView) => {
    try {
      setLoadingTransactions(true);
      let transactions = await getTransactionsSingleAsset({
        web3,
        assetAddress: asset.digitalInfo?.assetAddress,
        abiSingleAsset: infoContract.asset.abi,
        abiPancakeRouter: infoContract.pancakeRouter.abi,
        assetContract: new web3.eth.Contract(
          JSON.parse(infoContract.asset.abi),
          asset.digitalInfo.assetAddress
        ),
      });
      setTransactions([...transactions]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  return (
    <div>
      <div className="mb-3">
        <div className="profile-nav--search-bar">
          <input
            onChange={(e) => setTextSeaching(e.target.value)}
            value={textSeaching}
            type="text"
            placeholder={trans[locate].search + "..."}
          />
          <a role="button">
            <i className="fa-regular fa-magnifying-glass"></i>
          </a>
        </div>
      </div>
      <div
        style={{
          overflowX: "auto",
        }}
      >
        {changeState && (
          <Table
            locale={{ emptyText: trans[locate].no_data }}
            loading={loadingTable}
            style={{ minWidth: 700 }}
            columns={columns as any}
            dataSource={dataTable.filter(
              (item) =>
                slugify(item.digitalInfo.assetName[locate]).indexOf(
                  slugify(textSeaching)
                ) >= 0
            )}
            pagination={{
              position: [
                window?.innerWidth <= 1200 ? "bottomLeft" : "bottomRight",
              ],
            }}
          />
        )}
      </div>

      <ModalTransactionAsset
        visible={visibleTableTransactions}
        onCancel={() => setVisibleTableTransactions(false)}
        transactions={transactions}
        loading={loadingTransactions}
        assetType="single_asset"
      />
    </div>
  );
}

import { Table, Tag, Space } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { assetActions } from "@store/actions";
import { assetApi, userApi } from "@apis/index";
import { assetSelector } from "@store/asset/asset.slice";
import { authSelector } from "@store/auth/auth.slice";
import { locateSelector } from "@store/locate/locate.slice";
import { formatCurrency } from "@utils/number";
import { routeNames } from "@utils/router";
import { slugify } from "@utils/string";
import { ClassicSpinner } from "react-spinners-kit";
import { trans } from "src/resources/trans";
import UnitPrice from "@components/swap/unit_price";
import { RealEstateAssetView } from "src/models/asset/real_estate.model";
import { contractSelector } from "@store/contract/contract.slice";
import Networks from "@utils/networks.json";
import Link from "next/link";

class ColumnData extends RealEstateAssetView {
  name: string;
  balance: string;
  address: string;

  constructor({
    product,
    locate,
    balance,
  }: {
    product: RealEstateAssetView;
    locate: "vi" | "en";
    balance: string;
  }) {
    super(product);
    this.name = product.digitalInfo.assetName[locate];
    this.balance = balance;
    this.address = product.digitalInfo.assetAddress;
  }
}

export const MyPortion = ({ product }: { product: ColumnData }) => {
  const { user } = useSelector(authSelector);
  const [portion, setPortion] = useState("");
  const [loading, setLoading] = useState(true);
  const { infoContract, web3, loadedInfoContracts } =
    useSelector(contractSelector);

  const getBalance = async () => {
    if (!!user.walletAddress) {
      try {
        let contract = new web3.eth.Contract(
          JSON.parse(infoContract.asset.abi),
          product.digitalInfo.assetAddress
        );
        let balance = await contract.methods
          .balanceOf(user.walletAddress)
          .call();
        setPortion(balance);
      } catch (err) {
        setPortion("N/A");
        console.log(err);
      }
    } else setPortion("N/A");
  };

  useEffect(() => {
    (async () => {
      if (web3 && loadedInfoContracts) {
        await getBalance();
        setLoading(false);
      }
    })();
  }, [web3, loadedInfoContracts]);

  return (
    <span className="d-flex align-items-center justify-content-start">
      {loading ? (
        <ClassicSpinner color="#505050" size={20} />
      ) : portion == "N/A" ? (
        portion
      ) : (
        formatCurrency(portion)
      )}
    </span>
  );
};

export default function ProfileCartSingleAsset() {
  const dispatch = useDispatch();
  const { locate } = useSelector(locateSelector);
  const { cart, loadingGetCart } = useSelector(assetSelector);
  const [balances, setBalances] = useState([]);
  const [textSearching, setTextSearching] = useState("");

  const columns = [
    {
      title: trans[locate].name,
      dataIndex: "name",
      key: "name",
      render: (text, record: ColumnData) => (
        <Link className="" href={routeNames.product + "/" + record._id}>
          {text}
        </Link>
      ),
    },
    {
      title: trans[locate].my_portion,
      dataIndex: "balance",
      key: "balance",
      render: (text, record: ColumnData) => {
        return <MyPortion product={record} />;
      },
    },
    {
      title: trans[locate].value_of_portion,
      dataIndex: "price",
      key: "price",
      render: (text) => <>{text ? text : "N/A"}</>,
    },
    {
      title: "",
      key: "action",
      render: (text, record: ColumnData) => (
        <div className="d-flex justify-content-center">
          <button
            onClick={() => removeProduct(record._id)}
            className="button btn-cart-trash"
            style={{ lineHeight: 1, fontSize: 18 }}
          >
            <i className="fa-regular fa-trash-can"></i>
          </button>
        </div>
      ),
    },
  ];

  const removeProduct = async (id: string) => {
    try {
      await userApi.cartRemove(id);
      dispatch(assetActions.loadCart());
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <div className="mb-3">
        <div className="profile-nav--search-bar">
          <input
            onChange={(e) => setTextSearching(e.target.value)}
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
        <Table
          style={{ minWidth: 700 }}
          columns={columns as any}
          dataSource={cart
            .filter((item) => item.asset.assetType == "single_asset")
            .filter(
              (item) =>
                slugify(item.asset.digitalInfo.assetName[locate]).indexOf(
                  slugify(textSearching)
                ) >= 0
            )
            .map(
              (item, index) =>
                new ColumnData({
                  product: item.asset,
                  locate,
                  balance: balances[index],
                })
            )}
          pagination={{
            position: [
              window?.innerWidth <= 1200 ? "bottomLeft" : "bottomRight",
            ],
          }}
          loading={loadingGetCart}
          locale={{ emptyText: trans[locate].no_data }}
        />
      </div>
    </div>
  );
}

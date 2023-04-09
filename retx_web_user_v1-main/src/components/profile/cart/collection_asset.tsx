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
import { ColumnsType } from "antd/lib/table";
import { InfoCmd } from "src/models/nft.model";
import Link from "next/link";

class ColumnData extends RealEstateAssetView {
  name: string;
  assetIndex: number; // nftID in collection
  price: number;
  cartId: string;

  constructor({
    product,
    locate,
    assetIndex,
    cartId,
  }: {
    product: RealEstateAssetView;
    locate: "vi" | "en";
    assetIndex: number;
    cartId: string;
  }) {
    super(product);
    this.name = product.digitalInfo.assetName[locate];
    this.assetIndex = assetIndex;
    this.cartId = cartId;
  }
}

export const Price = ({
  collectionAddress,
  nftId,
}: {
  collectionAddress: string;
  nftId: number;
}) => {
  const { locate } = useSelector(locateSelector);
  const { web3Contract } = useSelector(contractSelector);
  const [price, setPrice] = useState<number>(null);

  useEffect(() => {
    (async () => {
      if (web3Contract.nftExchange) {
        let _info = await web3Contract.nftExchange.methods
          .sellCmd_getInfo(collectionAddress, nftId)
          .call();
        const info = new InfoCmd(_info);
        console.log("🚀 ~ file: collection_asset.tsx:59 ~ info:", info)
        if (info.price && !!info.is_open) {
          setPrice(info.price);
        } else {
          setPrice(null);
        }
      }
    })();
  }, [web3Contract]);

  useEffect(()=>{
    console.log("price:", price)
  },[price])

  return (
    <div>
        {price ? `${price.toLocaleString('vi-VN')}` : trans[locate].the_product_is_not_for_sale}
    </div>
  );
};

export default function ProfileCartCollectionAsset() {
  const dispatch = useDispatch();
  const { locate } = useSelector(locateSelector);
  const { cart, loadingGetCart } = useSelector(assetSelector);
  const [balances, setBalances] = useState([]);
  const [textSearching, setTextSearching] = useState("");

  const columns: ColumnsType<ColumnData> = [
    {
      title: trans[locate].name,
      dataIndex: "name",
      render: (text, record: ColumnData) => (
        <Link className="" href={routeNames.product + "/" + record._id}>
          {text}
        </Link>
      ),
    },
    {
      title: trans[locate].product_order_number,
      dataIndex: "assetIndex",
    },
    {
      title: `${trans[locate].selling_price} (VND)`,
      dataIndex: "price",
      render: (value, record: ColumnData) => (
        <Price
          collectionAddress={record?.digitalInfo.assetAddress}
          nftId={record.assetIndex}
        />
      ),
    },
    {
      title: "",
      render: (text, record: ColumnData) => (
        <div className="d-flex justify-content-center">
          <button
            onClick={() => removeProduct(record.cartId)}
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
            .filter((item) => item.asset.assetType == "collection_asset")
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
                  assetIndex: item.attributes?.nftId,
                  cartId: item._id,
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

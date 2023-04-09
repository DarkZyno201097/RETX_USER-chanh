import { Asset } from "./asset/asset.model";

export interface ICart {
  _id: string;
  asset: Asset;
  attributes: {
    nftId?: number
  };
}

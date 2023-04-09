export type TNotificationLevel = "INFO" | "WARNING" | "ERROR" | "CRITICAL";
export enum ENotificationTypes {
  RETX_BID_CANCELLED = "retx_bid_cancelled", // tương ứng vs case 1
  RETX_BID_ORDER_ACCEPTED = "retx_bid_order_accepted", // tương ứng vs case 2
  RETX_BID_FAILED = "retx_bid_failed", // tương ứng vs case 3
  RETX_ASSET_SOLD_SUCCESSFULLY = "retx_asset_sold_successfully", // tương ứng vs case 4
}

export interface ISendNotification {
  level: TNotificationLevel;
  type: ENotificationTypes;
  time: number;
  data: {
    walletAddresses?: string[];
    nftId?: string;
    assetId?: string;
    sellPrice?: number;
    bidPrice?: number;
    orderLink?: string;
    buyerId?: string;
    transactionFee?: number;
    revenue?: number;
  };
}

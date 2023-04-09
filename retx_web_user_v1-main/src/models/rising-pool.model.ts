export class PoolInfo {
  nftId: string;
  profileAddress: string;
  poolAddress: string;
  assetAddress: string;
  mvndAddress: string;
  totalInvestor: string;
  constructor();
  constructor(obj?: PoolInfo);
  constructor(obj?: any) {
    this.nftId = obj?.nftId || "";
    this.profileAddress = obj?.profileAddress || "";
    this.poolAddress = obj?.poolAddress || "";
    this.assetAddress = obj?.assetAddress || "";
    this.mvndAddress = obj?.mvndAddress || "";
    this.totalInvestor = obj?.totalInvestor || "";
  }
}

export class PoolStatus {
  rising_goal: number;
  total_funded: number;
  unit_price: number;
  constructor();
  constructor(obj?: PoolInfo);
  constructor(obj?: any) {
    this.rising_goal = obj?.rising_goal ? parseInt(obj?.rising_goal) : null;
    this.total_funded = obj?.total_funded ? parseInt(obj?.total_funded) : null;
    this.unit_price = obj?.unit_price ? parseInt(obj?.unit_price) : null;
  }
}

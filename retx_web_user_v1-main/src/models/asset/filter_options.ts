import { TAssetType } from "./real_estate.model";

export interface IFilterAssetOption {
    location?: {
        cityCode: string;
        districtCode: string;
        wardCode: string;
    };
    form?: string[];
    directions?: string[];
    rangePrice?: {
        min: number,
        max: number
    };
    rangeArea?: {
        min: number,
        max: number
    },
    sellers?: string[],
    timeCreated?: IFilterAssetValue,
    view?: IFilterAssetValue,
    numberOfComments?: IFilterAssetValue,
    rating?: IFilterAssetValue,
    totalSupply?: IFilterAssetValue,
    assetType?: TAssetType
}
export type IFilterAssetValue = 'asc' | 'dec' | null;


export type IFilterSelected = 'latest' | 'popular' | null;
export type IFilterPriceSelected = 'low_to_high' | 'high_to_low' | null;
export type IFieldTopFilter = 'latest' | 'mostView' | 'mostCommented' | 'hightestRated' | 'portionPrice' | 'totalPrice' | 'totalSupply' | 'sellers'
export type IValueTopFilter = 'low_to_high' | 'high_to_low' | boolean | null
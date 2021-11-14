export interface IF_JwtSignPayload {
  id: number;
  account: string;
  status: number;
  isAdmin: number;
}

export interface IF_AgisoBodyOrder {
  Platform: string;
  PlatformUserId: string;
  TidStr: string;
  Status: string;
  SellerNick: string;
  BuyerNick: string;
  Price: string;
  Num: number;
  TotalFee: string;
  Payment: string;
  PicPath: string;
  PostFee: string;
  Created: string;
  Orders: IF_AgisoOrderProducts[];
}

export interface IF_AgisoOrderProducts {
  OidStr: string;
  NumIid: number;
  OuterIid: string;
  OuterSkuId: string;
  Title: string;
  Price: string;
  Num: number;
  TotalFee: string;
  Payment: string;
  PicPath: string;
  SkuPropertiesName: string;
}

// 订单筛选SKU
export interface IF_UseProductData {
  sku: string;
  num: number;
}

// 运营总览
export interface IF_IncomeAbout {
  order: number;
  orderPayment: number;
  refund: number;
  refundPayment: number;
  user: number;
}

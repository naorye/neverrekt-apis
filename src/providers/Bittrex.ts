import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import * as crypto from "crypto";
import { NeverRekt } from "../types";
import { api } from "../api";
import { checkParameters, createQueryString } from "../utils";

export type BittrexParams = {
  SECRET: string;
  KEY: string;
  SUBACCOUNT: string;
};

//Bittrex required headers
// Api-Key - Populate this header with your API key.
// Api-Timestamp
// Api-Content-Hash
// Api-Signature
// Api-Subaccount-Id (optional)

class Bittrex {
  private SECRET: string;
  private KEY: string;
  private SUBACCOUNT: string;
  private axios: AxiosInstance;
  public prefix: string;

  constructor(SECRET: string, KEY: string) {
    this.SECRET = SECRET;
    this.KEY = KEY;
    this.SUBACCOUNT = "";
    this.prefix = "/v3";
    this.axios = axios.create({
      baseURL: "https://api.bittrex.com",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  //Function to populate Header Api-Content-Hash
  private getContentHash(body: string) {
    const hashedBody = crypto.createHash("sha512").update(body).digest("hex");
    return hashedBody;
  }

  private getSignature(
    path: string,
    timestamp: string,
    contentHash: string,
    subaccountId: string = this.SUBACCOUNT,
    method: string
  ): string {
    const strForSign: string = `${timestamp}${"https://api.bittrex.com"}${path}${method}${contentHash}${subaccountId}`;

    const signatureResult: string = crypto
      .createHmac("sha512", this.SECRET)
      .update(strForSign)
      .digest("hex");

    return signatureResult;
  }

  private async makeRequest<Response, Params extends object>(
    { type, method, endpoint, params }: NeverRekt.RequestArgs<Params>,
    map?: NeverRekt.ParametersMap
  ) {
    const paramError = checkParameters(params, map || []);

    if (!!paramError) {
      throw paramError;
    }

    try {
      let config: AxiosRequestConfig = {};
      const path = `${this.prefix}${endpoint}`;

      const timestamp = `${Date.now()}`;
      const contentHash = this.getContentHash("");

      if (type === "private") {
        config = {
          headers: {
            "Api-Timestamp": timestamp,
            "Api-Signature": this.getSignature(
              path,
              timestamp,
              contentHash,
              this.SUBACCOUNT,
              method
            ),
            "Api-Content-Hash": contentHash,
            "Api-Key": this.KEY,
          },
        };
        if (this.SUBACCOUNT !== "") {
          config = {
            ...config,
            headers: {
              ...config.headers,
              "Api-Subaccount-Id": this.SUBACCOUNT,
            },
          };
        }
      }
      const response = await api<Response, Params>(
        this.axios,
        method,
        path,
        params,
        config
      );

      return response;
    } catch (e) {
      throw e;
    }
  }

  /**
   * @docs https://bittrex.github.io/api/v3#operation--markets-get
   * @description Request via this endpoint to get a list of available currency pairs for trading.
   */
  public async getMarketList() {
    try {
      const response = await this.makeRequest<
        {
          symbol: string;
          baseCurrencySymbol: string;
          quoteCurrencySymbol: string;
          minTradeSize: number;
          precision: number;
          status: string;
          createdAt: string;
          notice: string;
          prohibitedIn: string;
          associatedTermsOfService: string[];
          tags: string[];
        }[],
        {}
      >({ method: "GET", endpoint: "/markets", params: {} });

      return response;
    } catch (e) {
      throw e;
    }
  }

  /**
   * @docs https://bittrex.github.io/api/v3#operation--markets-tickers-get
   * @description Request market tickers for all the trading pairs in the market (including 24h volume)
   */
  public async getTickerInformation() {
    try {
      const response = await this.makeRequest<
        {
          symbol: string;
          lastTradeRate: string;
          bidRate: number;
          askRate: number;
        }[],
        {}
      >({
        method: "GET",
        endpoint: "/markets/tickers",
        params: {},
      });

      return response;
    } catch (e) {
      throw e;
    }
  }

  /**
   * @docs https://bittrex.github.io/api/v3#operation--currencies-get
   * @description Request all currencies supported
   */

  public async getCurrencies() {
    try {
      const response = await this.makeRequest<
        {
          symbol: string;
          name: string;
          coinType: string;
          status: string;
          minConfirmations: number;
          notice: string;
          txFee: number;
          logoUrl: string;
          prohibitedIn: string;
          baseAddress: string;
          associatedTermsOfService: string;
          tags: string;
        }[],
        {}
      >({
        method: "GET",
        endpoint: "/currencies",
        params: {},
      });

      return response;
    } catch (e) {
      throw e;
    }
  }

  /**
   * @docs https://bittrex.github.io/api/v3#operation--balances-get
   * @description Get account balances
   */

  public async getBalances() {
    try {
      const response = await this.makeRequest<
        {
          currencySymbol: string;
          total: number;
          available: number;
          updatedAt: string;
        }[],
        {}
      >({
        type: "private",
        method: "GET",
        endpoint: "/balances",
        params: {},
      });
      return response;
    } catch (e) {
      throw e;
    }
  }
}

export { Bittrex };

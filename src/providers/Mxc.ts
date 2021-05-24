import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import * as crypto from "crypto";
import { NeverRekt } from "../types";
import { api } from "../api";
import { checkParameters, createQueryString } from "../utils";

class Mxc {
  private axios: AxiosInstance;

  constructor(private accessKey: string = "", private secretKey: string = "") {
    this.axios = axios.create({
      baseURL: "https://www.mxc.com",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private getSignature(
    timestamp: string,
    requestParameters: string | undefined = ""
  ) {
    const signatureString = `${this.accessKey}${timestamp}${requestParameters}`;

    const signature = crypto
      .createHmac("sha256", this.secretKey)
      .update(signatureString)
      .digest("hex");

    return signature;
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
      if (type === "private") {
        const timestamp = `${Date.now()}`;

        const requestParameters =
          method === "GET" || method === "DELETE"
            ? createQueryString(params).slice(1)
            : JSON.stringify(params);

        const signature = this.getSignature(timestamp, requestParameters);

        config = {
          headers: {
            ApiKey: this.accessKey,
            "Request-Time": timestamp,
            Signature: signature,
          },
        };
      }

      return await api<Response, Params>(
        this.axios,
        method,
        endpoint,
        params,
        config
      );
    } catch (e) {
      throw e;
    }
  }

  /**
   * @docs https://mxcdevelop.github.io/APIDoc/open.api.v2.en.html#all-symbols
   * @description List all market pairs symbols supported.
   */
  async getAllMarketSymbols() {
    try {
      return await this.makeRequest<
        {
          code: number;
          data: {
            symbol: string;
            state: string;
            price_scale: number;
            quantity_scale: number;
            min_amount: string;
            max_amount: string;
            maker_fee_rate: string;
            taker_fee_rate: string;
          }[];
        },
        {}
      >({ method: "GET", endpoint: "/open/api/v2/market/symbols", params: {} });
    } catch (e) {
      throw e;
    }
  }

  /**
   * @docs https://mxcdevelop.github.io/APIDoc/open.api.v2.en.html#ticker-information
   * @description Retrieve ticker information of required pair symbol. If pair symbol is not provided, return all symbols.
   */
  async getTickerInformation(params: { symbol?: string } = {}) {
    try {
      return await this.makeRequest<
        {
          code: number;
          data: {
            symbol: string;
            volume: string;
            high: string;
            low: string;
            bid: string;
            ask: string;
            open: string;
            last: string;
            time: number;
            change_rate: string;
          }[];
        },
        typeof params
      >({ method: "GET", endpoint: "/open/api/v2/market/ticker", params }, [
        { key: "symbol" },
      ]);
    } catch (e) {
      throw e;
    }
  }

  /**
   * @docs https://mxcdevelop.github.io/APIDoc/open.api.v2.en.html#current-system-time
   * @description Retrieve the system time.
   */
  async getCurrentSystemTime() {
    try {
      return await this.makeRequest<
        {
          code: number;
          data: number;
        },
        {}
      >({
        method: "GET",
        endpoint: "/open/api/v2/common/timestamp",
        params: {},
      });
    } catch (e) {
      throw e;
    }
  }

  /**
   * @docs https://mxcdevelop.github.io/APIDoc/open.api.v2.en.html#balance
   * @description Balance information of each currency
   */
  async getAccountBalance() {
    try {
      return await this.makeRequest<
        {
          code: number;
          data: Record<
            string,
            {
              frozen: string;
              available: string;
            }
          >;
        },
        {}
      >({
        type: "private",
        method: "GET",
        endpoint: "/open/api/v2/account/info",
        params: {},
      });
    } catch (e) {
      throw e;
    }
  }
}

export { Mxc };

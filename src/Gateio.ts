import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import * as crypto from "crypto";
import { NeverRekt } from "./types";
import { api } from "./api";
import { checkParameters, createQueryString } from "./utils";

class Gateio {
  private axios: AxiosInstance;
  private prefix: string;

  constructor(private key: string, private secret: string) {
    this.prefix = "/api/v4";
    this.axios = axios.create({
      baseURL: "https://api.gateio.ws",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }

  private getSignature(
    timestamp: string,
    method: string,
    path: string,
    queryString: string | undefined = "",
    payloadString: string | undefined = ""
  ) {
    const hashedPayload = crypto
      .createHash("sha512")
      .update(payloadString || "")
      .digest("hex");

    const signatureString = `${method.toUpperCase()}\n${path}\n${queryString}\n${hashedPayload}\n${timestamp}`;

    const signature = crypto
      .createHmac("sha512", this.secret)
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
      const path = `${this.prefix}${endpoint}`;
      if (type === "private") {
        const timestamp = (new Date().getTime() / 1000).toString();

        const queryString =
          method === "GET" || method === "DELETE"
            ? createQueryString(params)
            : undefined;

        const payloadString =
          method !== "GET" && method !== "DELETE"
            ? JSON.stringify(params)
            : undefined;

        config = {
          headers: {
            KEY: this.key,
            Timestamp: timestamp,
            SIGN: this.getSignature(
              timestamp,
              method,
              path,
              queryString,
              payloadString
            ),
          },
        };
      }

      return await api<Response, Params>(
        this.axios,
        method,
        path,
        params,
        config
      );
    } catch (e) {
      throw e;
    }
  }

  /**
   * @docs https://www.gate.io/docs/apiv4/en/index.html?python#list-all-currency-pairs-supported
   * @description List all currency pairs supported
   */
  async getAllCurrencyPairs() {
    try {
      return await this.makeRequest<
        {
          id: string;
          base: string;
          quote: string;
          fee: string;
          min_base_amount: string;
          min_quote_amount: string;
          amount_precision: number;
          precision: number;
          trade_status: "untradable" | "buyable" | "sellable" | "tradable";
          sell_start: number;
          buy_start: number;
        }[],
        {}
      >({ method: "GET", endpoint: "/spot/currency_pairs", params: {} });
    } catch (e) {
      throw e;
    }
  }

  /**
   * @docs https://www.gate.io/docs/apiv4/en/index.html?python#retrieve-ticker-information
   * @description Retrieve ticker information. Return only related data if currency_pair is specified; otherwise return all of them.
   */
  async getTickerInformation(params: { currency_pair?: string } = {}) {
    try {
      return await this.makeRequest<
        {
          currency_pair: string;
          last: string;
          lowest_ask: string;
          highest_bid: string;
          change_percentage: string;
          base_volume: string;
          quote_volume: string;
          high_24h: string;
          low_24h: string;
          etf_net_value: string;
          etf_pre_net_value: string;
          etf_pre_timestamp: number;
          etf_leverage: string;
        }[],
        typeof params
      >({ method: "GET", endpoint: "/spot/currency_pairs", params }, [
        { key: "currency_pair" },
      ]);
    } catch (e) {
      throw e;
    }
  }

  /**
   * @docs https://www.gate.io/docs/apiv4/en/index.html?python#list-spot-accounts
   * @description List spot accounts
   */
  async getSpotAccounts(params: { currency?: string } = {}) {
    try {
      return await this.makeRequest<
        {
          currency: string;
          available: string;
          locked: string;
        }[],
        typeof params
      >(
        { type: "private", method: "GET", endpoint: "/spot/accounts", params },
        [{ key: "currency" }]
      );
    } catch (e) {
      throw e;
    }
  }
}

export { Gateio };

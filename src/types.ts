export namespace NeverRekt {
  export type Method = "GET" | "POST" | "PUT" | "DELETE";

  export type ParametersMap = {
    key: string;
    required?: boolean;
  }[];

  export type RequestArgs<Params> = {
    type?: "private";
    method: Method;
    endpoint: string;
    params: Params;
  };
}

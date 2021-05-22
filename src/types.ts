export namespace NeverRekt {
  export type Method = "get" | "post" | "put" | "delete";

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

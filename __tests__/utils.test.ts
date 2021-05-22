import { createQueryString, checkParameters } from "../src/utils";
import { NeverRekt } from "../src/types";

function test_createQueryString(): void {
  test("Build simple valid query string", (): void => {
    const params: { argument: string } = {
      argument: "response",
    };
    expect(createQueryString(params)).toBe(`?argument=response`);
  });
  test("Build complex valid query string", (): void => {
    const params: {
      argument: string;
      list: (string | number)[];
      lastParam: number;
    } = {
      argument: "response",
      list: ["string", 516, "test", 23],
      lastParam: 12,
    };
    expect(createQueryString(params)).toBe(
      `?argument=response&list=string%2C516%2Ctest%2C23&lastParam=12`
    );
  });
  test("Build null query string", (): void => {
    const params: {} = {};
    expect(createQueryString(params)).toBe("");
  });
}

function test_checkParameters() {
  test("Check parameters with empty query map", (): void => {
    const params: {} = {};
    const map: NeverRekt.ParametersMap = [];
    expect(checkParameters(params, map)).toBeFalsy();
  });
  test("Check for missing non-required paramters", (): void => {
    const params: {} = {};
    const map: NeverRekt.ParametersMap = [{ key: "param" }];
    expect(checkParameters(params, map)).toBeFalsy();
  });
  test("Check for missing required paramters", (): void => {
    const params: {} = {};
    const map: NeverRekt.ParametersMap = [{ key: "param", required: true }];
    expect(checkParameters(params, map)).toBeTruthy();
  });
  test("Check for unused paramters", (): void => {
    const params: { param: string } = { param: "test" };
    const map: NeverRekt.ParametersMap = [];
    expect(checkParameters(params, map)).toBeFalsy();
  });
  test("Check with valid paramters", (): void => {
    const params: { param: string; object: object } = {
      param: "test",
      object: { prop: 2 },
    };
    const map: NeverRekt.ParametersMap = [
      { key: "param", required: true },
      { key: "object", required: true },
      { key: "non" },
    ];
    expect(checkParameters(params, map)).toBeFalsy();
  });
}

test_createQueryString();
test_checkParameters();

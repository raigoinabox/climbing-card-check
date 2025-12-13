declare const tag: unique symbol;
export type IdCode = string & { readonly [tag]: "ID_CODE" };

export function isIdCodeValid(code: string): code is IdCode {
  if (code.length !== 11) {
    return false;
  }

  const nr = [];
  for (let i = 0; i < code.length && i < 10; i++) {
    nr.push(parseInt(code[i]!, 10));
  }
  const givenControlCode = parseInt(code[10]!, 10);

  if (nr.some(Number.isNaN)) {
    return false;
  }

  const controlCode =
    nr.reduce((acc, value, index) => acc + value * ((index % 9) + 1), 0) % 11;

  if (controlCode !== 10) {
    return givenControlCode === controlCode;
  }

  const controlCode2 =
    nr.reduce((acc, value, index) => acc + value * (((index + 2) % 9) + 1), 0) %
    11;

  return givenControlCode === controlCode2;
}

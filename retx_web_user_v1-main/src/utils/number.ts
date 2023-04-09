export function divValueBlock(a: string, decimal: number) {
  let arr = a.split(".");
  a = arr[0];
  let str: any = "";
  let b = a.length;
  if (b > decimal) {
    str = a.slice(0, b - decimal) + "." + a.slice(b - decimal);
    if (arr[1]) str += arr[1];
  } else {
    str += "0.";
    for (let i = 0; i < decimal - b; i++) {
      str += "0";
    }
    if (arr[1]) {
      str += a;
      str += arr[1];
    } else {
      for (let i = 0; i < a.length; i++) {
        if (a[i] == "0") {
          break;
        }
        str += a[i];
      }
    }
  }

  let stop = str.indexOf(".");
  for (let i = str.length - 1; i > stop; i--) {
    if (str[i] != 0) {
      stop = i;
      break;
    }
  }

  let result: string = str.slice(0, stop + 1);
  if (result.indexOf(".") == result.length - 1)
    return result.slice(0, result.length - 1);

  return formatCurrency(result);
}

function reverseString(str: string) {
  var result = "";
  for (var i = str.length - 1; i >= 0; i--) {
    result += str[i];
  }
  return result;
}

function clearZero(str: string) {
  let temp = str;
  let stop = str.length;
  let loop = str.split("");
  for (let i = loop.length - 1; i >= 0; i--) {
    if (parseInt(loop[i]) == 0) {
      stop -= 1;
    } else break;
  }
  return temp.slice(0, stop);
}

export function formatCurrency(str: string) {
  // try {
  //   str = str.split(",").join("");
  //   let arr = str.split(".")

  //   str = arr[0]
  //   let result = ""
  //   let x = 3;
  //   for (let i = str.length - 1; i >= 0; i--) {
  //     result += str[i]
  //     x--;
  //     if (x == 0 && i != 0) {
  //       result += ","
  //       x = 3;
  //     }
  //   }
  //   if (arr[1]) {
  //     if (!!clearZero(arr[1]))
  //       return reverseString(result) + "." + clearZero(arr[1])
  //     else return reverseString(result)
  //   }
  //   else if (arr.length > 1) {
  //     return reverseString(result) + "."
  //   }
  //   else
  //     return reverseString(result)
  // }
  // catch (err) {
  //   return str
  // }

  return parseFloat(str).toLocaleString("vi-VN");
}

export function convertFormattedNumberToNumber(formattedNumber: string) {
  if (!formattedNumber.trim()) {
    return 0;
  } else {
    const number = parseFloat(
      formattedNumber.replace(/\./g, "").replace(",", ".")
    );
    return number;
  }
}

export function isNumberKey(evt: any) {
  var charCode = evt.which;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) return false;
  return true;
}

export const handleOnlyNumber = (value: string) => {
  const result = value.replace(/\D/g, "");
  return result;
};

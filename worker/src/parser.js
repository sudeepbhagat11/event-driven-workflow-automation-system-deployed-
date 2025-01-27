"use strict";
// // // export function parse(
// // //   text: string,
// // //   values: any,
// // //   startDelimiter = "{",
// // //   endDelimiter = "}"
// // // ): string {
// // //   console.log("Input Text:", text);
// // //   console.log("Input Values:", values);
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
// // //   let startIndex = 0;
// // //   let endIndex = 1;
// // //   let finalString = "";
// // //   if (typeof text !== "string") {
// // //     throw new Error("Invalid input: 'text' must be a string");
// // //   }
// // //   while (endIndex < text.length) {
// // //     if (text[startIndex] === startDelimiter) {
// // //       let endPoint = startIndex + 2;
// // //       while (text[endPoint] !== endDelimiter && endPoint < text.length) {
// // //         endPoint++;
// // //       }
// // //       if (text[endPoint] !== endDelimiter) {
// // //         throw new Error("Unmatched start delimiter in template string.");
// // //       }
// // //       const stringHoldingValue = text.slice(startIndex + 1, endPoint);
// // //       console.log("Extracted Placeholder:", stringHoldingValue);
// // //       const keys = stringHoldingValue.split(".");
// // //       let localValues: any = { ...values };
// // //       for (let i = 0; i < keys.length; i++) {
// // //         if (localValues == null) {
// // //           console.warn(`Key "${keys.slice(0, i + 1).join(".")}" not found in values.`);
// // //           localValues = `{{${keys.slice(0, i + 1).join(".")}}}`; // Placeholder for missing key
// // //           break;
// // //         }
// // //         if (typeof localValues === "string") {
// // //           try {
// // //             console.log(`Attempting to parse JSON for key "${keys[i]}":`, localValues);
// // //             localValues = JSON.parse(localValues);
// // //           } catch {
// // //             throw new Error(`Failed to parse JSON value for key: ${keys[i]}`);
// // //           }
// // //         }
// // //         localValues = localValues[keys[i]];
// // //         console.log(`Value at "${keys[i]}":`, localValues);
// // //       }
// // //       finalString += localValues ?? `{{${stringHoldingValue}}}`;
// // //       startIndex = endPoint + 1;
// // //       endIndex = endPoint + 2;
// // //     } else {
// // //       finalString += text[startIndex];
// // //       startIndex++;
// // //       endIndex++;
// // //     }
// // //   }
// // //   if (text[startIndex]) {
// // //     finalString += text[startIndex];
// // //   }
// // //   console.log("Final Parsed String:", finalString);
// // //   return finalString;
// // // }
// // // @ts-ignore
// // export function parse(text, values, startDelimeter = "{", endDelimeter = "}") {
// //   if (typeof text !== "string") {
// //       console.error("Parse Error: Received invalid text input:", text);
// //       throw new Error("Invalid input: 'text' must be a string");
// //   }
// //   let startIndex = 0;
// //   let endIndex = 1;
// //   let finalString = "";
// //   while (endIndex < text.length) {
// //       if (text[startIndex] === startDelimeter) {
// //           let endPoint = startIndex + 2;
// //           while (text[endPoint] !== endDelimeter && endPoint < text.length) {
// //               endPoint++;
// //           }
// //           if (text[endPoint] !== endDelimeter) {
// //               throw new Error("Unmatched start delimiter in template string.");
// //           }
// //           const stringHoldingValue = text.slice(startIndex + 1, endPoint);
// //           const keys = stringHoldingValue.split(".");
// //           let localValues = { ...values };
// //           for (let i = 0; i < keys.length; i++) {
// //               if (localValues == null) {
// //                   localValues = `{{${keys.slice(0, i + 1).join(".")}}}`; // Placeholder for missing key
// //                   break;
// //               }
// //               if (typeof localValues === "string") {
// //                   try {
// //                       localValues = JSON.parse(localValues);
// //                   } catch {
// //                       throw new Error(`Failed to parse JSON value for key: ${keys[i]}`);
// //                   }
// //               }
// //               localValues = localValues[keys[i]];
// //           }
// //           finalString += localValues ?? `{{${stringHoldingValue}}}`;
// //           startIndex = endPoint + 1;
// //           endIndex = endPoint + 2;
// //       } else {
// //           finalString += text[startIndex];
// //           startIndex++;
// //           endIndex++;
// //       }
// //   }
// //   if (text[startIndex]) {
// //       finalString += text[startIndex];
// //   }
// //   return finalString;
// // }
// export function parse(text: string, values: any, startDelimeter = "{", endDelimeter = "}") {
//   // You received {comment.amount} momey from {comment.link}
//   let startIndex = 0;
//   let endIndex = 1;
//   let finalString = "";
//   while (endIndex < text.length) {
//       if (text[startIndex] === startDelimeter) {
//           let endPoint = startIndex + 2;
//           while (text[endPoint] !== endDelimeter) {
//               endPoint++;
//           }
//           // 
//           let stringHoldingValue = text.slice(startIndex + 1, endPoint);
//           const keys = stringHoldingValue.split(".");
//           let localValues = {
//               ...values
//           }
//           for (let i = 0; i < keys.length; i++) {
//               if (typeof localValues === "string") {
//                   localValues = JSON.parse(localValues);
//               }
//               localValues = localValues[keys[i]];
//           }
//           finalString += localValues;
//           startIndex = endPoint + 1;
//           endIndex = endPoint + 2;
//       } else {
//           finalString += text[startIndex];
//           startIndex++;
//           endIndex++;
//       }
//   }
//   if (text[startIndex]) {
//       finalString += text[startIndex]
//   }
//   return finalString;
// }
function parse(text, values, startDelimeter = "{", endDelimeter = "}") {
    if (!text) {
        console.error("Error: parse received an undefined text input.");
        return "";
    }
    let startIndex = 0;
    let endIndex = 1;
    let finalString = "";
    while (endIndex < text.length) {
        if (text[startIndex] === startDelimeter) {
            let endPoint = startIndex + 2;
            // Ensure we don't go out of bounds
            while (endPoint < text.length && text[endPoint] !== endDelimeter) {
                endPoint++;
            }
            // Check if closing delimiter exists
            if (endPoint >= text.length) {
                console.error("Error: Unmatched placeholder in text:", text);
                return text; // Return original text if error
            }
            // Extract key
            let stringHoldingValue = text.slice(startIndex + 1, endPoint);
            const keys = stringHoldingValue.split(".");
            let localValues = Object.assign({}, values);
            for (let i = 0; i < keys.length; i++) {
                if (typeof localValues === "string") {
                    try {
                        localValues = JSON.parse(localValues);
                    }
                    catch (error) {
                        console.error("Error parsing JSON value for key:", keys[i], error);
                        return text; // Return original text on error
                    }
                }
                localValues = localValues === null || localValues === void 0 ? void 0 : localValues[keys[i]]; // Safe access
                if (localValues === undefined) {
                    console.error("Error: Missing value for key:", stringHoldingValue);
                    return text; // Return original text if key is missing
                }
            }
            finalString += localValues;
            startIndex = endPoint + 1;
            endIndex = endPoint + 2;
        }
        else {
            finalString += text[startIndex];
            startIndex++;
            endIndex++;
        }
    }
    if (text[startIndex]) {
        finalString += text[startIndex];
    }
    return finalString;
}
exports.parse = parse;

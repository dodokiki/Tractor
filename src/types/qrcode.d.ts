declare module "qrcode" {
  export interface QRCodeToDataURLOptions {
    width?: number;
    margin?: number;
    scale?: number;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    type?: "image/png" | "image/jpeg" | "image/webp";
    color?: { dark?: string; light?: string };
  }
  export function toDataURL(
    text: string,
    options?: QRCodeToDataURLOptions,
  ): Promise<string>;
  export function toString(
    text: string,
    options?: Record<string, unknown>,
  ): Promise<string>;
  const QRCode: {
    toDataURL: typeof toDataURL;
    toString: typeof toString;
  };
  export default QRCode;
}

import { QRCode } from "react-qrcode-logo";

interface QrCodeValidateRegisterProps {
  url: string | undefined;
  id: string;
}

export function QrCodeValidateRegister({
  url,
  id,
}: QrCodeValidateRegisterProps) {
  return (
    <QRCode
      value={url}
      size={800}
      style={{ width: "100%", height: "auto", maxWidth: "400px" }}
      bgColor="#ffffff"
      fgColor="#000000"
      quietZone={6}
      id={id}
      ecLevel="L"
      qrStyle="squares"
    />
  );
}

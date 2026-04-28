import { createElement } from "react";

type IconProps = {
  icon: string;
  className?: string;
  width?: number;
  height?: number;
};

export function Icon({
  icon,
  className,
  width = 18,
  height = 18,
}: IconProps) {
  return createElement("iconify-icon", {
    "aria-hidden": "true",
    className,
    height,
    icon,
    width,
  });
}

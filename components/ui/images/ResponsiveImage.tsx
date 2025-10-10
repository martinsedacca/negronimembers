import Image from "next/image";
import React from "react";

export default function ResponsiveImage() {
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <Image
          src="/images/grid-image/image-01.png"
          alt="Cover"
          className="w-full border border-neutral-200 rounded-xl dark:border-neutral-800"
          width={1054}
          height={600}
        />
      </div>
    </div>
  );
}

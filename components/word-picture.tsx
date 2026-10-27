import Image from "next/image";

import type { WordImage } from "@/features/curriculum/images";
import { cn } from "@/lib/utils";

interface WordPictureProps {
  image: WordImage;
  /** Quizzes pass a neutral alt: a failed load must not reveal the answer. */
  alt: string;
  /** Intrinsic size in px; CSS controls the rendered size. */
  size: number;
  sizes: string;
  className?: string;
}

/** A vocabulary photo. Commons photos carry their author and licence in the tooltip. */
export function WordPicture({
  image,
  alt,
  size,
  sizes,
  className,
}: WordPictureProps) {
  return (
    <Image
      src={image.src}
      alt={alt}
      title={
        image.credit
          ? `Photo: ${image.credit.artist} (${image.credit.license})`
          : undefined
      }
      unoptimized={image.unoptimized}
      width={size}
      height={size}
      sizes={sizes}
      className={cn("object-cover", className)}
    />
  );
}

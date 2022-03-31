import Image from "next/image";
import { useState } from "react";
import classnames from "classnames";

const BlurImage = (props) => {
  const [isLoading, setLoading] = useState(true);

  return (
    <Image
      {...props}
      alt={props.alt}
      className={classnames(
        props.className,
        "duration-700 ease-in-out ",
        isLoading
          ? "grayscale blur-3xl scale-110"
          : "grayscale-0 blur-0 scale-100",
        props.rounded ? "rounded-full children:rounded-full" : null
      )}
      onLoadingComplete={() => setLoading(false)}
    />
  );
};

export default BlurImage;

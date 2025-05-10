import React from "react";

const ImagePlaceholder = ({ src, alt, direction }) => {
  return (
    <div className={`image-container ${direction}`} key={src}>
      {src ? <img src={src} alt={alt} className="image" /> : null} {/* Don't show alt text */}
    </div>
  );
};

export default ImagePlaceholder;

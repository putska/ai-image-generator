"use client";

import Image from "next/image";
import useSWR from "swr";
import fetchImages from "../lib/fetchImages";

type ImageType = {
  name: string;
  url: string;
};

function Images() {
  const {
    data: images,
    isLoading,
    mutate: refreshImages,
    isValidating,
  } = useSWR("images", fetchImages, {
    revalidateOnFocus: false,
  });

  async function handleDeleteImage(imageName: string) {
    try {
      const response = await fetch("http://localhost:7071/api/deleteImage", {
        // Assuming your delete endpoint is '/deleteImage'
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName: imageName }),
      });
      console.log("response", response);
      if (response.ok) {
        // Refresh the images list after deletion
        refreshImages();
      } else {
        console.error("Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  }

  return (
    <div>
      <button
        className="fixed bottom-10 right-10 bg-violet-400/90 text-white px-5 py-3 rounded-md 
      hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-400 font-bold z-20"
        onClick={() => refreshImages(images)}
      >
        {!isLoading && isValidating ? "Refreshing..." : "Refresh Images"}
      </button>

      {isLoading && (
        <p className="animate-pulse text-center pb-7 font-extralight">
          Loading <span className="text-violet-400">AI</span> Generated
          Images...
        </p>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 px-0 md:px-10">
        {images?.imageUrls?.map((image: ImageType, i: number) => (
          <div
            className={`relative cursor-help ${
              i === 0 && "md:col-span-2 md:row-span-2"
            } hover:scale-[103%] transition-transform duration-200 ease-in-out 
            
            `}
            key={image.name}
          >
            {/* create a white div that when hovered it appears */}
            <div className="absolute flex justify-center items-center w-full h-full bg-white opacity-0 hover:opacity-80 transition-opacity duration-200 z-10">
              <p className="text-center font-light text-lg p-5">
                {/* This removes the Timestamp and File extension */}
                {image.name.split("_").shift()?.toString().split(".").shift()}
              </p>
            </div>
            <Image
              src={image.url}
              alt=""
              height={800}
              width={800}
              className="w-full rounded-sm shadow-2xl drop-shadow-lg -z-10"
            />
            {/* Add the red "x" icon */}
            <div className="absolute top-2 right-2 z-20">
              <Image
                src="/close.svg"
                alt="Close"
                width={16}
                height={16}
                className="w-6 h-6 text-red-500 hover:scale-120 transition-transform duration-200"
                onClick={() => handleDeleteImage(image.name)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Images;

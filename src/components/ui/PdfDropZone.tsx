import Image from "next/image";
import React, { useCallback, useState } from "react";

import { Button } from "./button";

interface PdfDropZoneProps {}

const PdfDropZone: React.FC<PdfDropZoneProps> = () => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [file, setFile] = useState<File | null>();

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);

    if (!event.dataTransfer.files || !event.dataTransfer.files.length) {
      return;
    }

    const fileList = Array.from(event.dataTransfer.files).filter((file) => file.type === "application/json");

    if (fileList.length) {
      setFile(fileList[0]);

      // Get the file input element
      const fileInput = document.getElementById("json-upload") as HTMLInputElement;

      // Clear the input before appending the new files
      fileInput.value = "";

      // Append the files to the input
      fileList.forEach((file) => {
        const fileItem = new File([file], file.name, { type: file.type });
        const dataTransfer = new DataTransfer();

        dataTransfer.items.add(fileItem);
        fileInput.files = dataTransfer.files;
      });
    } else {
      console.error("Only json files are allowed.");
    }
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    try {
      const data = new FormData();

      data.set("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const errorText = await res.text();

        throw new Error(errorText);
      }

      // Read the response as a Blob
      const blob = await res.blob();

      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger the download
      const link = document.createElement("a");

      link.href = url;
      link.download = "cropped.pdf"; // You can set your preferred filename here

      // Append the anchor to the document body and click it to start the download
      document.body.appendChild(link);
      link.click();

      // Clean up after the download is initiated
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setFile(undefined);
    } catch (e: any) {
      // Handle errors here
      console.error(e);
    }
  };

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative  group flex flex-col items-center ${
          isDraggingOver ? "border-primary-color" : ""
        } border-dashed border-2 border-grey-blue p-5 text-center min-h-24 mb-4 rounded-lg hover:border-primary-color hover:bg-grey-blue hover:dark:border-primary-color hover:dark:bg-neutral-800/30`}
      >
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#FFCDF46A] dark:invert mb-4 opacity-50 transition-all duration-200 ease-in-out group-hover:scale-110 group-hover:opacity-100"
          src="/upload-file-dark.svg"
          alt="Next.js Logo"
          width={40}
          height={5}
          priority
        />
        <p>Drag and drop your Mindmap files here</p>
        <p className="text-sm opacity-50">Supports: .json</p>
        <input
          type="file"
          accept=".json"
          id="json-upload"
          className="absolute top-0 left-0 right-0 bottom-0 opacity-0 cursor-pointer"
          onChange={(e) => setFile(e.target.files?.[0])}
          required
        />
      </div>
      <article className="w-full">
        {file ? (
          <section className="flex items-center justify-between pb-2 border-b-2 mb-4">
            <p className="font-medium">{file.name}</p>
            <button
              className="cursor-pointer text-sm w-9 p-2 bg-gray-100 dark:bg-neutral-800 rounded-full text-center"
              onClick={() => setFile(null)}
            >
              x
            </button>
          </section>
        ) : (
          ""
        )}
      </article>
      {file && (
        <Button type="submit" className="w-full">
          Upload
        </Button>
      )}
    </form>
  );
};

export { PdfDropZone };

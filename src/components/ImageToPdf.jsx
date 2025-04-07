import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImageToPdfUI from "./ImageToPdfUI";
const ImageToPdf = () => {
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validImages = files.filter((file) => file.type.startsWith("image/"));

    if (validImages.length === 0) {
      toast.error("Please upload valid image files.");
      return;
    }

    const imagePreviews = validImages.map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
    }));

    setImages([...images, ...imagePreviews]);
  };

  const handleDownloadPDF = () => {
    if (images.length === 0) {
      toast.warn("No images uploaded.");
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      let yPos = margin;
      let processedImages = 0;

      images.forEach((imgObj, index) => {
        const img = new Image();
        img.src = imgObj.url;

        img.onload = () => {
          const aspectRatio = img.width / img.height;
          let imgWidth = pageWidth - 2 * margin;
          let imgHeight = imgWidth / aspectRatio;

          if (imgHeight > pageHeight - 2 * margin) {
            imgHeight = pageHeight - 2 * margin;
            imgWidth = imgHeight * aspectRatio;
          }

          if (index !== 0) {
            pdf.addPage();
            yPos = margin;
          }

          pdf.addImage(imgObj.url, "JPEG", margin, yPos, imgWidth, imgHeight);
          processedImages++;
          
          if (processedImages === images.length) {
            pdf.save("converted.pdf");
            toast.success("PDF downloaded successfully!");
            setImages([]);
            fileInputRef.current.value = null;
            setIsGenerating(false);
          }
        };
      });
    }, 2000);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    const validImages = files.filter((file) => file.type.startsWith("image/"));
    
    if (validImages.length === 0) {
      toast.error("Please upload valid image files.");
      return;
    }
    
    const imagePreviews = validImages.map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
    }));
    
    setImages([...images, ...imagePreviews]);
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  const properties ={
    triggerFileInput,
    removeImage,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleImageUpload,
    handleDownloadPDF,
    isDragging,
    fileInputRef,
    images,
    isGenerating
  }
  return (
     < ImageToPdfUI properties={properties}/>
  );
};

export default ImageToPdf;

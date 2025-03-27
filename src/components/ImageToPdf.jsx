import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center p-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2 text-indigo-800">Image to PDF Converter</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your images and convert them into a professional PDF document with just one click.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-2xl mb-8">
          <div 
            className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-all ${
              isDragging 
                ? "border-indigo-500 bg-indigo-50" 
                : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageUpload}
            />
            <div className="flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium text-indigo-600 mb-1">
                Drop your images here
              </p>
              <p className="text-sm text-gray-500 mb-3">
                or click to browse files
              </p>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full">
                JPG, PNG, GIF, etc.
              </span>
            </div>
          </div>

          {images.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">
                {images.length} {images.length === 1 ? 'Image' : 'Images'} Selected
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((imgObj, index) => (
                  <div key={index} className="group relative">
                    <img
                      src={imgObj.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg shadow-md"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 px-2 truncate rounded-b-lg">
                      {imgObj.file.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={triggerFileInput}
              className="flex-1 bg-white text-indigo-600 font-medium py-3 rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center"
              disabled={isGenerating}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add More Images
            </button>
            <button
              onClick={handleDownloadPDF}
              className={`flex-1 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center ${
                images.length === 0 ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
              }`}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Generate PDF
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-indigo-800 bg-opacity-10 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-indigo-800 mb-2">Tips for best results:</h3>
          <ul className="text-gray-700 space-y-2 list-disc list-inside">
            <li>Upload high-resolution images for better quality PDFs</li>
            <li>Images will be placed one per page in the order they appear above</li>
            <li>You can drag and drop multiple images at once</li>
          </ul>
        </div>
        <p className="text-gray-700 mt-4 text-center">Developed and design by <a
        target="_blank"
         href="https://www.linkedin.com/in/talha-nawaz-5421931a4/"className="text-indigo-600 hover:underline hover:underline-offset-4">Talha Nawaz</a></p>
      </div>

      <ToastContainer position="top-center" autoClose={2000} theme="colored" />
    </div>
  );
};

export default ImageToPdf;

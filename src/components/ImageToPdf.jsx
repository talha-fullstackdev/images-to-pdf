// import { useState } from "react";
// import { jsPDF } from "jspdf";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const ImageToPdf = () => {
//   const [images, setImages] = useState([]);

//   const handleImageUpload = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;
    
//     const validImages = files.filter(file => file.type.startsWith("image/"));
    
//     if (validImages.length === 0) {
//       toast.error("Please upload valid image files.");
//       return;
//     }

//     const imagePreviews = validImages.map(file => URL.createObjectURL(file));
//     setImages([...images, ...imagePreviews]);
//   };

//   const handleDownloadPDF = () => {
//     if (images.length === 0) {
//       toast.warn("No images uploaded.");
//       return;
//     }

//     const pdf = new jsPDF();
//     images.forEach((img, index) => {
//       const imgWidth = 210;
//       const imgHeight = 297;
//       if (index !== 0) pdf.addPage();
//       pdf.addImage(img, "JPEG", 10, 10, imgWidth - 20, imgHeight - 20);
//     });

//     pdf.save("converted.pdf");
//     toast.success("PDF downloaded successfully!");
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
//       <h1 className="text-3xl font-bold mb-4 text-gray-800">Image to PDF Converter</h1>

//       <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
//         <input
//           type="file"
//           accept="image/*"
//           multiple
//           className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer p-2 mb-4"
//           onChange={handleImageUpload}
//         />

//         <div className="flex flex-wrap gap-3">
//           {images.map((img, index) => (
//             <img key={index} src={img} alt="Preview" className="w-20 h-20 object-cover rounded-lg border" />
//           ))}
//         </div>

//         <button
//           onClick={handleDownloadPDF}
//           className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
//         >
//           Convert to PDF
//         </button>
//       </div>

//       <ToastContainer position="top-center" autoClose={2000} />
//     </div>
//   );
// };

// export default ImageToPdf;
import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ImageToPdf = () => {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null); // Reference to input field

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
      file: file, // Store the original file for dimensions
    }));

    setImages([...images, ...imagePreviews]);
  };

  const handleDownloadPDF = () => {
    if (images.length === 0) {
      toast.warn("No images uploaded.");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4"); // A4 size
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 10; // Margin for images
    let yPos = margin;

    images.forEach((imgObj, index) => {
      const img = new Image();
      img.src = imgObj.url;

      img.onload = () => {
        const aspectRatio = img.width / img.height;
        let imgWidth = pageWidth - 2 * margin; // Set max width
        let imgHeight = imgWidth / aspectRatio; // Calculate height

        // Ensure images fit within page height
        if (imgHeight > pageHeight - 2 * margin) {
          imgHeight = pageHeight - 2 * margin;
          imgWidth = imgHeight * aspectRatio;
        }

        // If not the first image, create a new page
        if (index !== 0) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.addImage(imgObj.url, "JPEG", margin, yPos, imgWidth, imgHeight);
        if (index === images.length - 1) {
          pdf.save("converted.pdf");
          toast.success("PDF downloaded successfully!");

          // **Clear input field and reset images**
          setImages([]);
          fileInputRef.current.value = null;
        }
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Image to PDF Converter</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef} // Assign ref to input field
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer p-2 mb-4"
          onChange={handleImageUpload}
        />

        <div className="flex flex-wrap gap-3">
          {images.map((imgObj, index) => (
            <img
              key={index}
              src={imgObj.url}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border"
            />
          ))}
        </div>

        <button
          onClick={handleDownloadPDF}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Convert to PDF
        </button>
      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default ImageToPdf;

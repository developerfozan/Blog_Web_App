import React, { useEffect, useState } from "react";
import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";

function PostCard({ $id, title, featuredImage }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchImageUrl = async () => {
      if (!featuredImage) {
        if (isMounted) {
          setIsLoading(false);
          setHasError(true);
        }
        return;
      }
      
      try {
        setIsLoading(true);
        setHasError(false);
        
        const url = await appwriteService.getFilePreviewURL(featuredImage);
        
        if (isMounted && url) {
          setImageUrl(url);
        } else if (isMounted) {
          setHasError(true);
        }
      } catch (error) {
        console.error("Error fetching image URL:", error);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
      console.log('Featured Image ID:', featuredImage);
    };

    fetchImageUrl();

    return () => {
      isMounted = false;
    };
  }, [featuredImage]);

  const handleImageError = () => {
    setHasError(true);
    setImageUrl(null);
  };

  return (
    <Link to={`/post/${$id}`} className="block">
      <div className="w-full bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="w-full h-48 mb-4 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
          {isLoading ? (
            <div className="text-gray-500 text-sm">Loading image...</div>
          ) : hasError || !imageUrl ? (
            <div className="text-gray-500 text-sm flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              No image available
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="lazy"
            />
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-800 truncate">{title}</h2>
      </div>
    </Link>
  );
}

export default PostCard;
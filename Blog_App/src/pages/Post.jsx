import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import appwriteService from '../appwrite/config';
import { Button, Container } from '../components';
import parse from 'html-react-parser';
import { useSelector } from 'react-redux';

export default function Post() {
  const [post, setPost] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const { slug } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  useEffect(() => {
    if (!slug) return navigate('/');
    
    const fetchPost = async () => {
      try {
        const doc = await appwriteService.getPost(slug);
        if (!doc) return navigate('/');
        
        setPost(doc);
        
        if (doc.featuredImage) {
          setImageLoading(true);
          const url = await appwriteService.getFilePreviewURL(doc.featuredImage);
          setImageUrl(url);
          setImageLoading(false);
        } else {
          setImageLoading(false);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        navigate('/');
      }
    };

    fetchPost();
  }, [slug, navigate]);

  const isAuthor = post && userData && post.userId === userData.$id;

  const handleDelete = async () => {
    try {
      const ok = await appwriteService.deletePost(post.$id);
      if (ok && post.featuredImage) {
        await appwriteService.deleteFile(post.featuredImage);
      }
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (!post) {
    return (
      <div className="py-8">
        <Container>
          <div className="text-center text-gray-500">Loading post...</div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-8">
      <Container>
        <div className="w-full flex justify-center mb-4 relative border rounded-xl p-2 bg-gray-50 min-h-[300px]">
          {imageLoading ? (
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-gray-500">Loading image...</div>
            </div>
          ) : imageUrl ? (
            <img 
              src={imageUrl} 
              alt={post.title} 
              className="rounded-xl max-w-full max-h-[500px] object-contain"
              onError={() => setImageUrl(null)}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-500">
              No image available
            </div>
          )}
          
          {isAuthor && (
            <div className="absolute right-6 top-6 flex gap-3">
              <Link to={`/edit-post/${post.$id}`}>
                <Button bgColor="bg-green-500" className="px-4 py-2">
                  Edit
                </Button>
              </Link>
              <Button bgColor="bg-red-500" onClick={handleDelete} className="px-4 py-2">
                Delete
              </Button>
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold mb-6 text-gray-800">{post.title}</h1>
        
        <div className="browser-css prose max-w-none">
          {parse(post.content)}
        </div>
      </Container>
    </div>
  );
}
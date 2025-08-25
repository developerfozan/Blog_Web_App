import React, { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
  const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.$id || "",
      content: post?.content || "",
      status: post?.status || "active",
    },
  });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  useEffect(() => {
    async function fetchImage() {
      if (post?.featuredImage) {
        const url = await appwriteService.getFilePreviewURL(post.featuredImage);
        setImagePreviewUrl(url);
      }
    }
    fetchImage();
  }, [post]);

  const slugTransform = useCallback((value) => {
    return value?.trim().toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-") || "";
  }, []);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  const submit = async (data) => {
    try {
      let file = null;

      if (data.image?.[0]) {
        file = await appwriteService.uploadFile(data.image[0]);
        if (!file || !file.$id) {
          console.error("Image upload failed");
          return;
        }
      console.log('File uploaded:', file);

        if (post?.featuredImage) {
          await appwriteService.deleteFile(post.featuredImage);
        }
      }

      const featuredImageId = file?.$id || post?.featuredImage || null;
      
      if (post) {
        const updatedPost = await appwriteService.updatePost(post.$id, {
          ...data,
          featuredImage: featuredImageId,
        });
        if (updatedPost) {
          navigate(`/post/${updatedPost.$id}`);
        }
      } else {
        const newPost = await appwriteService.createPost({
          ...data,
          featuredImage: featuredImageId,
          userId: userData.$id,
        });
        console.log('New Post:', newPost);
        if (newPost) {
          navigate(`/post/${newPost.$id}`);
        }
      }
      console.log('Featured Image ID:', featuredImageId);

    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
      <div className="w-2/3 px-2">
        <Input
          label="Title:"
          placeholder="Enter title"
          className="mb-4"
          {...register("title", { required: true })}
        />
        <Input
          label="Slug:"
          placeholder="Slug"
          className="mb-4"
          {...register("slug", { required: true })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.currentTarget.value), {
              shouldValidate: true,
            });
          }}
        />
        <RTE
          label="Content:"
          name="content"
          control={control}
          defaultValue={getValues("content")}
        />
      </div>
      <div className="w-1/3 px-2">
        <Input
          label="Featured Image:"
          type="file"
          className="mb-4"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", { required: !post })}
        />
        {imagePreviewUrl && (
          <div className="w-full mb-4">
            <img src={imagePreviewUrl} alt={post?.title || "Featured"} className="rounded-lg max-w-full" />
          </div>
        )}
        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4"
          {...register("status", { required: true })}
        />
        <Button
          type="submit"
          bgColor={post ? "bg-green-500" : undefined}
          className="w-full"
        >
          {post ? "Update" : "Submit"}
        </Button>
      </div>
    </form>
  );
}
import { PostProps } from "../pages/index";
import Link from "next/link";
import Image from "next/image";

interface PostCardProps {
  post: PostProps;
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <Link href={`/posts/${post.slug}`}>
      <div className="border">
        <div className="postcard-image-container">
          <Image
            src={`/${post.frontMatter.image}`}
            layout="fill"
            alt={post.frontMatter.title}
          />
        </div>
      </div>
      <div className="px-2 py-4">
        <h1 className="font-bold text-lg truncate">{post.frontMatter.title}</h1>
        <span>{post.frontMatter.date}</span>
      </div>
    </Link>
  );
};

export default PostCard;

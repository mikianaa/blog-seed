import { PostProps } from '../pages/index';
import Link from 'next/link';
import Image from 'next/image'

interface PostCardProps {
    post : PostProps
}


const PostCard = ({ post } : PostCardProps) => {
    console.log(post.frontMatter.image)
    return (
        <Link href={`/posts/${post.slug}`}>
            <div className="bouder rounded-lg">
                <Image 
                 src={`/${post.frontMatter.image}`}
                 width={1200}
                 height={700}
                 alt={post.frontMatter.title}       
                />
            </div>
            <div className="px-2 py-4">
                <h1 className="font-bold text-lg">{post.frontMatter.title}</h1>
                <span>{post.frontMatter.date}</span>
            </div>
        </Link>
    );
};

export default PostCard;
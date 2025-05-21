import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import matter from "gray-matter";
import PostCard from "@/components/postcard";
import Pagination from "@/components/pagination";
import ScrollableTabBar from "@/components/category-tabbar";
import { Readable } from "stream";
import { useState } from "react";
import { useRouter } from "next/router";
import { StaticProps } from "../../posts/[slug]";

export interface PostFrontMatter {
    title: string;
    date: string;
    image: string;
    categories: string[];
}

export interface PostProps {
    slug: string;
    frontMatter: PostFrontMatter;
    content: string;
}

export interface HomeProps {
    posts: PostProps[];
    pages: number[];
    current_page: number;
    categories: { label: string; path: string }[];
}

const PAGE_SIZE = 6;
const range = (start: number, end: number, length = end - start + 1) =>
    Array.from({ length }, (_, i) => start + i);

const s3 = new S3Client({
    region: process.env.MY_AWS_REGION!,
    credentials: {
        accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const PREFIX = process.env.S3_POST_PREFIX ?? "";

export const getStaticProps = async ({ params }: StaticProps) => {
    const category = params.category;
    const current_page = Number(params.page);

    const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: PREFIX,
    });

    const listResponse = await s3.send(listCommand);
    const files = listResponse.Contents?.filter(obj => obj.Key?.endsWith(".md")) ?? [];

    const posts: PostProps[] = [];
    for (const file of files) {
        const slug = file.Key!.replace(PREFIX, "").replace(/\.md$/, "");
        const getCommand = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: file.Key! });
        const res = await s3.send(getCommand);
        const body = await streamToString(res.Body as Readable);
        const { data, content } = matter(body);
        if (category === "all" || (Array.isArray(data.categories) && data.categories.includes(category))) {
            posts.push({ slug, frontMatter: data as PostFrontMatter, content });
        }
    }

    const sortedPosts = posts.sort((a, b) =>
        new Date(a.frontMatter.date) > new Date(b.frontMatter.date) ? -1 : 1
    );

    const pages = range(1, Math.ceil(sortedPosts.length / PAGE_SIZE));
    const slicedPosts = sortedPosts.slice(
        PAGE_SIZE * (current_page - 1),
        PAGE_SIZE * current_page
    );

    const catCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: "public/categories.json",
    });
    const catRes = await s3.send(catCommand);
    const categoryJson = await streamToString(catRes.Body as Readable);
    const categories = JSON.parse(categoryJson);

    return {
        props: {
            posts: slicedPosts,
            pages,
            current_page,
            categories,
        },
    };
};

export const getStaticPaths = async () => {
    const listCommand = new ListObjectsV2Command({ Bucket: BUCKET_NAME, Prefix: PREFIX });
    const listResponse = await s3.send(listCommand);
    const files = listResponse.Contents?.filter(obj => obj.Key?.endsWith(".md")) ?? [];

    const categoryMap: Record<string, number> = {};
    for (const file of files) {
        const getCommand = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: file.Key! });
        const res = await s3.send(getCommand);
        const body = await streamToString(res.Body as Readable);
        const { data } = matter(body);
        if (Array.isArray(data.categories)) {
            data.categories.forEach((cat: string) => {
                categoryMap[cat] = (categoryMap[cat] || 0) + 1;
            });
        }
    }
    categoryMap["all"] = files.length;

    const paths: { params: { category: string; page: string } }[] = [];
    for (const [category, count] of Object.entries(categoryMap)) {
        const pageCount = Math.ceil(count / PAGE_SIZE);
        for (let i = 1; i <= pageCount; i++) {
            paths.push({ params: { category, page: i.toString() } });
        }
    }

    return {
        paths,
        fallback: false,
    };
};

async function streamToString(stream: Readable): Promise<string> {
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
}

const CategoryPage = ({ posts, pages, current_page, categories }: HomeProps) => {
    const router = useRouter();
    const currentPath = router.query.category as string;
    const [selectedCategory, setSelectedCategory] = useState(
        categories.find(c => c.path === currentPath) ?? categories[0]
    );

    return (
        <div className="my-8">
            <ScrollableTabBar
                categories={categories}
                selectedPath={selectedCategory.path}
                onSelect={setSelectedCategory}
            />
            <div className="grid grid-cols-3 gap-4 pt-5">
                {posts.map(post => (
                    <PostCard key={post.slug} post={post} />
                ))}
            </div>
            <Pagination pages={pages} current_page={current_page} category={selectedCategory.path} />
        </div>
    );
};

export default CategoryPage;

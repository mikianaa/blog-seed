import Pagination from "@/components/pagination";
import PostCard from "@/components/postcard";
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import matter from "gray-matter";
import { Readable } from "stream";

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
}

const PAGE_SIZE = 6;
const range = (start: number, end: number, length = end - start + 1) =>
  Array.from({ length }, (_, i) => start + i);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const PREFIX = process.env.S3_POST_PREFIX ?? "";

export const getStaticProps = async () => {
  const listCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: PREFIX,
  });

  const listResponse = await s3.send(listCommand);
  const files = listResponse.Contents?.filter(obj => obj.Key?.endsWith(".md")) ?? [];

  const posts: PostProps[] = [];

  for (const file of files) {
    const slug = file.Key!.replace(PREFIX, "").replace(/\.md$/, "");

    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: file.Key!,
    });

    const getObjectResponse = await s3.send(getCommand);

    const bodyContents = await streamToString(getObjectResponse.Body as Readable);
    const { data, content } = matter(bodyContents);

    posts.push({
      slug,
      frontMatter: data as PostFrontMatter,
      content,
    });
  }

  // 日付順ソート
  posts.sort((a, b) =>
    new Date(a.frontMatter.date) > new Date(b.frontMatter.date) ? -1 : 1
  );

  const pages = range(1, Math.ceil(posts.length / PAGE_SIZE));

  return {
    props: {
      posts: posts.slice(0, PAGE_SIZE),
      pages,
      current_page: 1,
    },
  };
};

async function streamToString(stream: Readable): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export default function Home({ posts, pages, current_page }: HomeProps) {
  return (
    <div className="my-8">
      <div className="grid grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      <Pagination pages={pages} current_page={current_page} />
    </div>
  );
}

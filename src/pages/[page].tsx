import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { StaticProps } from "./posts/[slug]";
import matter from "gray-matter";
import Pagination from "../components/pagination";
import PostCard from "../components/postcard";
import { PostFrontMatter, PostProps } from ".";
import { Readable } from "stream";

type PageProps = {
  posts: PostProps[];
  pages: number[];
  current_page: number;
};

const PAGE_SIZE = 6;

const range = (start: number, end: number, length = end - start + 1) =>
  Array.from({ length }, (_, i) => start + i);

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const PREFIX = process.env.S3_POST_PREFIX ?? "";

export const getStaticProps = async ({ params }: StaticProps) => {
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

    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: file.Key!,
    });

    const res = await s3.send(getCommand);
    const body = await streamToString(res.Body as Readable);
    const { data, content } = matter(body);

    posts.push({
      slug,
      frontMatter: data as PostFrontMatter,
      content,
    });
  }

  const sortedPosts = posts.sort((a, b) =>
    new Date(a.frontMatter.date) > new Date(b.frontMatter.date) ? -1 : 1
  );

  const pages = range(1, Math.ceil(sortedPosts.length / PAGE_SIZE));
  const slicedPosts = sortedPosts.slice(
    PAGE_SIZE * (current_page - 1),
    PAGE_SIZE * current_page
  );

  return {
    props: {
      posts: slicedPosts,
      pages,
      current_page,
    },
  };
};

export async function getStaticPaths() {
  const listCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: PREFIX,
  });
  const listResponse = await s3.send(listCommand);
  const count = listResponse.Contents?.filter(obj => obj.Key?.endsWith(".md")).length ?? 0;

  const paths = range(1, Math.ceil(count / PAGE_SIZE)).map((i) => ({
    params: { page: i.toString() },
  }));

  return {
    paths,
    fallback: false,
  };
}

async function streamToString(stream: Readable): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

const Page = ({ posts, pages, current_page }: PageProps) => {
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
};

export default Page;

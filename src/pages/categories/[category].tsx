import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import matter from "gray-matter";
import PostCard from "../../components/postcard";
import { StaticProps } from "../posts/[slug]";
import { HomeProps, PostFrontMatter, PostProps } from "../index";
import { Readable } from "stream";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const PREFIX = process.env.S3_POST_PREFIX ?? "";

// SSG
export const getStaticProps = async ({ params }: StaticProps) => {
  const category = params.category;

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

    // カテゴリーでフィルタ
    if (Array.isArray(data.categories) && data.categories.includes(category)) {
      posts.push({
        slug,
        frontMatter: data as PostFrontMatter,
        content,
      });
    }
  }

  const sortedPosts = posts.sort((a, b) =>
    new Date(a.frontMatter.date) > new Date(b.frontMatter.date) ? -1 : 1
  );

  return {
    props: {
      posts: sortedPosts,
    },
  };
};

// Paths
export const getStaticPaths = async () => {
  const listCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: PREFIX,
  });

  const listResponse = await s3.send(listCommand);
  const files = listResponse.Contents?.filter(obj => obj.Key?.endsWith(".md")) ?? [];

  const categorySet = new Set<string>();

  for (const file of files) {
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: file.Key!,
    });

    const res = await s3.send(getCommand);
    const body = await streamToString(res.Body as Readable);
    const { data } = matter(body);

    if (Array.isArray(data.categories)) {
      data.categories.forEach((cat: string) => categorySet.add(cat));
    }
  }

  const paths = Array.from(categorySet).map((category) => ({
    params: { category },
  }));

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

const Category = ({ posts }: HomeProps) => {
  return (
    <div className="my-8">
      <div className="grid grid-cols-3 gap-4">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Category;

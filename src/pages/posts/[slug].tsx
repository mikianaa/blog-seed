import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import matter from "gray-matter";
import { marked } from "marked";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import tocbot from "tocbot";
import ProfileCard from "@/components/profile-card";

export interface StaticProps {
  params: { slug: string; category: string; page: number };
}

type PostData = {
  id: string;
  title: string;
  categories: string[];
  published_at: string;
  thumbnail: string;
  blogContentHtml: string;
  categoryList: { path: string, label: string }[];
};

const s3 = new S3Client({
  region: process.env.MY_AWS_REGION,
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;
const PREFIX = process.env.S3_POST_PREFIX ?? "";

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const key = `${PREFIX}${params.slug}.md`;

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await s3.send(command);
  const body = await streamToString(response.Body as Readable);
  const { data: frontMatter, content } = matter(body);

  const catCommand = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: "public/categories.json",
  });
  const catRes = await s3.send(catCommand);
  const catJson = await streamToString(catRes.Body as Readable);
  const categoryList: { label: string; path: string }[] = JSON.parse(catJson);

  marked.setOptions({
    headerIds: true,
    mangle: false,
  });

  return {
    props: {
      title: frontMatter.title,
      categories: frontMatter.categories,
      published_at: frontMatter.date,
      thumbnail: frontMatter.image,
      blogContentHtml: marked(content),
      categoryList
    },
  };
}

export async function getStaticPaths() {
  const listCommand = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: PREFIX,
  });

  const listResponse = await s3.send(listCommand);
  const files = listResponse.Contents?.filter(obj => obj.Key?.endsWith(".md")) ?? [];

  const paths = files.map(file => ({
    params: {
      slug: file.Key!.replace(PREFIX, "").replace(/\.md$/, ""),
    },
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


const Post = ({
  title,
  categories,
  published_at,
  thumbnail,
  blogContentHtml,
  categoryList
}: PostData) => {
  useEffect(() => {
    const initTocbot = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        tocbot.init({
          tocSelector: "#toc",
          contentSelector: ".content-html",
          headingSelector: "h1, h2",
          scrollSmooth: true,
        });
      }
    };

    initTocbot();

    const handleResize = () => {
      tocbot.destroy();
      initTocbot();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      tocbot.destroy();
    };
  }, []);

  return (
    <div className="flex justify-center mt-4 md:mt-10 mb-10">
      <div className="flex flex-col lg:flex-row w-full px-4 gap-6 max-w-7xl">
        <div className="flex-1 lg:max-w-4xl mx-auto bg-white shadow-md rounded-xl p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl lg:text-5xl text-center mb-4 md:mb-6">{title}</h1>
          <div className="text-center mb-4 md:mb-6">
            <Image
              className="block mx-auto rounded w-full max-w-md md:max-w-lg"
              src={`/${thumbnail}`}
              width={500}
              height={300}
              alt={title}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 md:mb-6">
            <div className="text-gray-500 text-xs md:text-sm flex items-center gap-2">
              <svg
                className="w-3 h-3 md:w-4 md:h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
              </svg>
              {published_at}
            </div>
            {categories.map((category) => {
              const label = categoryList.find(c => c.path === category)?.label ?? category;
              return (
                <Link href={`/categories/${category}/1`} key={category}>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs md:text-sm font-medium px-2 md:px-3 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition">
                    {label}
                  </span>
                </Link>
              )
            })}
          </div>

          <div className="content-html prose prose-blue max-w-none prose-sm md:prose-base lg:prose-lg" dangerouslySetInnerHTML={{ __html: blogContentHtml }}></div>

          {/* Mobile Profile - Below Content */}
          <div className="lg:hidden mt-8">
            <ProfileCard avatarSrc={"/profile.jpg"} name={"Mikia"} intro={"Love: Math, Techno(logy) and you all"} twitterUrl={process.env.NEXT_PUBLIC_X_URL} instagramUrl={process.env.NEXT_PUBLIC_INSTA_URL} hatenaUrl={process.env.NEXT_PUBLIC_HATENA_URL} />
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:w-64 lg:sticky lg:top-32 lg:self-start">
          <div className="p-3 md:p-4 shadow-md rounded-xl bg-white mb-4">
            <nav id="toc" className="toc text-sm md:text-xl" />
          </div>
          <div className="p-3 md:p-4 mt-6">
            <ProfileCard avatarSrc={"/profile.jpg"} name={"Mikia"} intro={"Love: Math, Techno(logy) and you all"} twitterUrl={process.env.NEXT_PUBLIC_X_URL} instagramUrl={process.env.NEXT_PUBLIC_INSTA_URL} hatenaUrl={process.env.NEXT_PUBLIC_HATENA_URL} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Post;

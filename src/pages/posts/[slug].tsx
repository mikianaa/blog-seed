import fs from "fs";
import Image from "next/image";
import Link from "next/link";
import { marked } from "marked";
import matter from "gray-matter";
import Xfeed from "../../components/xfeed";
import "../../styles/posts.css";
import { useEffect } from "react";
import tocbot from "tocbot";
import "tocbot/dist/tocbot.css";

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
};

export async function getStaticProps({ params }: StaticProps) {
  const mdFile = fs.readFileSync(`posts/${params.slug}.md`, "utf-8");
  const { data: frontMatter, content } = matter(mdFile);
  const title = frontMatter.title;
  const categories = frontMatter.categories;
  const published_at = frontMatter.date;
  const thumbnail = frontMatter.image;

  marked.setOptions({
    headerIds: true,
    mangle: false,
  });
  const blogContentHtml = marked(content);

  return {
    props: {
      title,
      categories,
      published_at,
      thumbnail,
      blogContentHtml,
    },
  };
}

export async function getStaticPaths() {
  const files = fs.readdirSync("posts");
  const paths = files.map((fileName) => ({
    params: {
      slug: fileName.replace(/\.md$/, ""),
    },
  }));
  return {
    paths,
    fallback: "blocking",
  };
}

const Post = ({
  title,
  categories,
  published_at,
  thumbnail,
  blogContentHtml,
}: PostData) => {
  useEffect(() => {
    tocbot.init({
      tocSelector: "#toc",
      contentSelector: ".content-html",
      headingSelector: "h1, h2",
      scrollSmooth: true,
    });
    return () => tocbot.destroy();
  }, []);

  return (
    <div className="flex justify-center mt-10 mb-10">
      <div className="flex w-full px-4 gap-6">
        <div className="flex-1 bg-white shadow-md rounded-xl p-6">
          <h1 className="text-5xl text-center mb-6">{title}</h1>
          <div className="text-center mb-6">
            <Image
              className="block mx-auto rounded"
              src={`/${thumbnail}`}
              width={500}
              height={300}
              alt={title}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="text-gray-500 text-sm flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {published_at}
            </div>
            {categories.map((category) => (
              <Link href={`/categories/${category}`} key={category}>
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition">
                  {category}
                </span>
              </Link>
            ))}
          </div>

          <div className="content-html" dangerouslySetInnerHTML={{ __html: blogContentHtml }}></div>
        </div>

        <aside className="hidden md:block w-64 sticky top-32 self-start">
          <div className="p-4 shadow-md rounded-xl bg-white">
            <nav id="toc" className="toc text-xl" />
          </div>
          <div className="p-4 shadow-md rounded-xl mt-6 bg-white">
            <Xfeed />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Post;

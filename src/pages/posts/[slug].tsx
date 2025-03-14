import fs from "fs";
import Image from "next/image";
import Link from "next/link";
import markdownToHtml from "zenn-markdown-html";
import matter from "gray-matter";
import { JSDOM } from "jsdom";
import Xfeed from "../../components/xfeed";
import "../../styles/posts.css";
import { useEffect, useState } from "react";

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
  tableOfContents: TableOfContent[];
};

type TableOfContent = {
  level: string;
  title: string;
  href: string;
};

//h1タグ、h2タグをHTMLから抽出
function extractHeadings(html: string): TableOfContent[] {
  const domHtml = new JSDOM(html).window.document;

  // DOMから目次を検索し、{hタグレベル、タイトル名、リンク先}、を取得する
  const elements = domHtml.querySelectorAll<HTMLElement>("h1, h2");
  const tableOfContents: TableOfContent[] = [];
  elements.forEach((element) => {
    const level = element.tagName;
    const title = element.innerHTML.split("</a> ")[1];
    const href = `#${title.toLowerCase().replace(/\s+/g, "-")}`;
    const record = { level: level, title: title, href: href };
    tableOfContents.push(record);
  });

  return tableOfContents;
}

//静的Props取得
export async function getStaticProps({ params }: StaticProps) {
  const mdFile = fs.readFileSync(`posts/${params.slug}.md`, "utf-8");

  const { data: frontMatter, content } = matter(mdFile);

  //frontMatterの情報を取得
  const title = frontMatter.title;
  const categories = frontMatter.categories;
  const published_at = frontMatter.date;
  const thumbnail = frontMatter.image;

  //本文の内容と目次の情報を取得
  const blogContentHtml = markdownToHtml(content);
  const tableOfContents = extractHeadings(blogContentHtml);

  return {
    props: {
      title,
      categories,
      published_at,
      thumbnail,
      blogContentHtml,
      tableOfContents,
    },
  };
}

//静的パスをmdファイルから取得
export async function getStaticPaths() {
  const files = fs.readdirSync("posts");
  const paths = files.map((fileName) => ({
    params: {
      slug: fileName.replace(/\.md$/, ""),
    },
  }));
  return {
    paths,
    fallback: false,
  };
}

const Post = ({
  title,
  categories,
  published_at,
  thumbnail,
  blogContentHtml,
  tableOfContents,
}: PostData) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const headings = Array.from(document.querySelectorAll("h1, h2"));
      let currentId = null;

      for (const heading of headings) {
        const rect = heading.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
          currentId = heading.id;
        }
      }

      if (currentId !== activeId) {
        setActiveId(currentId);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeId]);

  return (
    <div className="flex justify-center mt-10 mb-10">
      <div className="flex w-full px-4 gap-6">
        {/* 本文エリア */}
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
            {/* 日付表示 */}
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

            {/* カテゴリー表示 */}
            {categories.map((category) => (
              <Link href={`/categories/${category}`} key={category}>
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition">
                  {category}
                </span>
              </Link>
            ))}
          </div>
          <div
            className="content-html"
            dangerouslySetInnerHTML={{ __html: blogContentHtml }}
          ></div>
        </div>
        <aside className="hidden md:block w-64 sticky top-32 self-start">
          <div className="p-4 shadow-md rounded-xl mb-6 bg-white">
            <p className="text-xl font-bold mb-4">目次</p>
            <ul className="list-none p-0">
              {tableOfContents.map((anchor: TableOfContent) => (
                <li
                  key={anchor.href}
                  className={anchor.level === "H2" ? "ml-4 mb-2" : "mb-2"}
                >
                  <a
                    href={anchor.href}
                    className={`transition-colors ${activeId === anchor.href.replace("#", "") ? "text-sky-500 font-semibold" : "text-gray-700"
                      }`}
                  >
                    {anchor.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 shadow-md rounded-xl bg-white">
            <Xfeed />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Post;

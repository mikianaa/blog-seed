import fs from "fs";
import Image from "next/image";
import Link from "next/link";
import markdownToHtml from "zenn-markdown-html";
import matter from "gray-matter";
import { JSDOM } from "jsdom";
import Xfeed from "../../components/xfeed";
import "../../styles/posts.css";

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
  return (
    <div className="flex justify-center mt-10">
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

          <div className="mb-4">{published_at}</div>
          <div className="space-x-10 space-y-6 mb-6">
            {categories.map((category) => (
              <span key={category}>
                <Link href={`/categories/${category}`}>
                  <div>{category}</div>
                </Link>
              </span>
            ))}
          </div>
          <div
            className="content-html"
            dangerouslySetInnerHTML={{ __html: blogContentHtml }}
          ></div>
        </div>
        <aside className="hidden md:block w-64 sticky top-20 self-start">
          <div className="p-4 shadow-md rounded-xl mb-6 bg-white">
            <p className="text-xl font-bold mb-4">目次</p>
            <ul className="list-none p-0">
              {tableOfContents.map((anchor: TableOfContent) => (
                <li
                  key={anchor.href}
                  className={anchor.level === "H2" ? "ml-4 mb-2" : "mb-2"}
                >
                  <a href={anchor.href}>{anchor.title}</a>
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

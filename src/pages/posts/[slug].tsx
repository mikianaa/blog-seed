import fs from 'fs';
import matter from 'gray-matter';
import { PostProps } from '../index'
import Image from 'next/image'
import { unified } from 'unified'
import remarkToc from 'remark-toc';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify'
import * as prod from 'react/jsx-runtime'
import rehypeParse from 'rehype-parse';
import rehypeReact from 'rehype-react';
import { createElement, FC, Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { toc } from 'mdast-util-toc';
import type {Node, Literal, Parent} from 'unist';
import *  as tocbot from 'tocbot'
// import classes from "../../styles/TableOfContents.module.scss";

//型定義
export interface StaticProps {
    params : {slug : string, category: string, page:number}
}

//目次生成
const TableOfContents: FC = () => {
  useEffect(() => {
    tocbot.init({
        // Where to render the table of contents.
        tocSelector: '.js-toc',
        // Where to grab the headings to build the table of contents.
        contentSelector: '.js-toc-content',
        // Which headings to grab inside of the contentSelector element.
        headingSelector: 'h1, h2, h3',
        // For headings inside relative or absolute positioned containers within content.
        hasInnerContainers: true,
      });

    return () => tocbot.destroy();
  }, []);

  return (
    <nav>
      <h2>Table of Contents</h2>
      <div className="toc" />
    </nav>
  );
};

//静的プロパティ取得
export async function getStaticProps({ params } : StaticProps ) {
    const file = fs.readFileSync(`posts/${params.slug}.md`, 'utf-8');
    let {data, content} = matter(file);

    // markdownをHTML変換　Parse(解析)→Toc(目次生成)→Rehype(変換)→Stringfy(文字列化)
    // Todo? remarkReactを使ったLink, Imageの設定(2.12)
    const indexedContent = await unified()
    .use(remarkParse)
    .use(remarkToc, {
        heading: '目次'
    })
    .use(remarkRehype)
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(content);

    content = indexedContent.toString();

    return { props : { frontMatter : data, content}};
}

//静的パスをmdファイルから取得
export async function getStaticPaths() {
    const files = fs.readdirSync('posts');
    const paths = files.map((fileName) => ({
        params : {
            slug: fileName.replace(/\.md$/, ''),
        }
    }));
    return {
        paths,
        fallback: false,
    };
}

const Post = ({frontMatter, content} : PostProps)  => {
    return (
        <div className="prose prose-lg max-w-none">
            <div className="border">
                <Image 
                    src={`/${frontMatter.image}`} 
                    width={1200} 
                    height={700} 
                    alt={frontMatter.title}
                />
            </div>
            <h1 className="mt-12">{frontMatter.title}</h1>
            <span>{frontMatter.date}</span>
            <div className="space-x-2">
                {frontMatter.categories.map((category) => (
                    <span key={category}>
                        <Link href={`/categories/${category}`}>
                            <div>{category}</div>
                        </Link>
                    </span>
                ))}
            </div>
            <div dangerouslySetInnerHTML={{ __html: content }}></div>
            <div>
                {/* Todo:目次サイドバー表示 <TableOfContents/> */}
            </div>
        </div>
    );
};

export default Post;
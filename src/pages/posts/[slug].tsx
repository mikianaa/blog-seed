import fs from 'fs';
import matter from 'gray-matter';
import { PostProps } from '../index'
import markdownit from 'markdown-it';
import Image from 'next/image'

//型定義
interface StaticProps {
    params : {slug : string}
}

//静的プロパティ取得
export async function getStaticProps({ params } : StaticProps ) {
    const file = fs.readFileSync(`posts/${params.slug}.md`, 'utf-8');
    const {data, content} = matter(file);
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
            <div dangerouslySetInnerHTML={{ __html : markdownit().render(content.toString()) }}></div>
            {/* contentの内容をHTMLにレンダリングして、HTMLに挿入 */}
        </div>
    );
};

export default Post;
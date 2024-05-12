import fs from 'fs';
import matter from 'gray-matter';
import { PostProps } from '../index'
import { marked } from 'marked';

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
        <div>
            <h1>{frontMatter.title}</h1>
            <div dangerouslySetInnerHTML={{ __html : marked(content.toString()) }}></div>
        </div>
    );
};

export default Post;
import Pagination from '@/components/pagination';
import PostCard from '@/components/postcard';
import fs from 'fs';
import matter from 'gray-matter';

//型定義
export interface PostFrontMatter {
  title: string;
  date: string;
  image : string;
  categories : string[];
}

export interface PostProps {
  slug: string;
  frontMatter: PostFrontMatter;
  content : string;
}

export interface HomeProps {
  posts: PostProps[],
  pages: number[],
  current_page : number
}

//ページ分割用の定数と配列
const PAGE_SIZE = 1;
const range = (start : number, end : number, length = end - start + 1) => 
  Array.from({ length }, (_, i) => start + i)

//サーバーサイドで静的Props取得
export const getStaticProps = () => {
  const files = fs.readdirSync('posts');
  let posts = files.map((fileName) => { //受け散った配列の各要素に関数を適用する
    const slug = fileName.replace(/\.md$/, ''); // .mdを消す
    const fileContent = fs.readFileSync(`posts/${fileName}`, 'utf-8');
    const { data } = matter(fileContent); //yamlファイル先頭を解析してjson形式にする
    return {
      frontMatter: data,  
      slug,
    }
  });

  //日付が新しい順にソート
  posts = posts.sort((postA, postB) => 
    new Date(postA.frontMatter.date) > new Date(postB.frontMatter.date) ? -1 : 1);

  const pages = range(1, Math.ceil(posts.length / PAGE_SIZE));

  return {
    props: {
      posts : posts.slice(0, PAGE_SIZE),
      pages,
    },
  };
};

export default function Home( { posts, pages, current_page }: HomeProps) {
  return (
    <div className='my-8'>
      <div className="grid grid-cols-3 gap-4"> 
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} /> 
        ))}
      </div>
      <Pagination pages={pages} current_page={current_page}/>
    </div>
  );
}
